from services.scholarhub_db import ScholarHubDB
from utilitis.log_manager import LogManager
from services.login_service_adapter import LoginServiceAdapter
from services.login_service_BGU import LoginServiceBGU
from services.login_service_local import LoginServiceLocal
from services.notification_service import Notification_manager
from functools import wraps
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from data_classes.Result import Result
from data_classes.Application import Application, Application_status
from dataclasses import replace
from passlib.context import CryptContext
import utilitis.global_config as config

def validate_user(check_roles=True, required_roles: list[str] = [], return_user=True, check_if_authenticated=True, authenticated_value=True):
    def decorator(func):
        def wrapper(self, user: User, *args, **kwargs):
            if not isinstance(user,User):
                erorr_str = f"first parameter of every function is the user that is calling it instead got {type(user)}"
                self.log_manager.error(erorr_str)
                return Result(False, erorr_str)
            user_res = None
            if not user.id == None:
                user_res = self.db.get_user_id(user.id)
            elif not user.email==None:
                user_res = self.db.get_user_email(user.email)
            else:
                pass
            if not user_res.success:
                self.log_manager.error(user_res.error)
                return user_res
            if check_if_authenticated and (authenticated_value ^ user_res.data.authenticated):
                error_str = f'user {user.email} is not authenticated'
                self.log_manager.error(error_str)
                return Result(False, error=error_str)
            if not Role.is_valid_role(user_res.data.role):
                error_str = f"User {user.email} has an invalid role."
                self.log_manager.error(error_str)
                return Result(False, error_str)
            if check_roles  and user_res.data.role not in required_roles:
                erorr_str = f"User does not have any of the required roles: {required_roles}"
                self.log_manager.error(erorr_str)
                return Result(False, erorr_str)
            return func(self, replace(user_res.data, password=user.password, athentication_link=user.athentication_link), *args, **kwargs) if return_user else  func(self, *args, **kwargs)
        return wrapper
    return decorator
 
class MainCoordinator:
    def __init__(self, db_uri='sqlite:///database_files_save/scholarhub.db'):
        self.db = ScholarHubDB(db_uri)
        if config.CLEAN_DB_STARTUP and not config.USE_MOCK_DB:
            self.db._clear_db_only_for_debug()
        self.pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
        self.login_service = LoginServiceLocal(self.db, self.pwd_context)
        self.log_manager = LogManager(MainCoordinator.__name__)

    def register(self, user: User) -> Result:
        return self.login_service.register(user)
    
    @validate_user(check_roles=False, return_user=True, check_if_authenticated=True, authenticated_value=False)
    def authenticate(self, user: User) -> Result:
        return self.db.update_user(replace(user, authenticated=True))
    
    @validate_user(check_roles=False, return_user=True, check_if_authenticated=True, authenticated_value=True)
    def login(self, user: User) -> Result:
        res = self.login_service.login(user)
        if not res.success:
            return Result(False, "Failed to login.")
        self.log_manager.info(f"Login successful for {user.email}")
        return res

    @validate_user(check_roles=True, required_roles=[Role.ADMIN], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def get_all_users(self) -> Result:
        return self.db.get_all_users()
    
    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.RECOMMENDER, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def get_user(self, user: User) -> Result[User]:
        user_res = None
        if not user.id == None:
            user_res = self.db.get_user_id(user.id)
        elif not user.email==None:
            user_res = self.db.get_user_email(user.email)
        else:
            return Result(False, "no data on user was given")
        return user_res
    
    @validate_user(check_roles=False, required_roles=[Role.ADMIN, Role.RECOMMENDER, Role.STUDENT, Role.REVIEWER], return_user=True, check_if_authenticated=True, authenticated_value=False)
    def resend_verification_email(self, user: User) -> Result:
        return self.login_service.resend_verification_email(user)

    @validate_user(check_roles=True, required_roles=[Role.ADMIN], return_user=False, check_if_authenticated=True, authenticated_value=True)    
    def open_new_scholarship(self, scholarship: Scholarship) -> Result[Scholarship]: 
        res = self.db.add_scholarship(scholarship)
        if res.success:
            self.log_manager.info(f"New scholarship '{scholarship.id}' successfully created.")
        else:
            self.log_manager.error(str(res.error))
        return res
    
    #TODO add tests to this funtion in the system manager tests file
    @validate_user(check_roles=True, required_roles=[Role.ADMIN], return_user=True, check_if_authenticated=True, authenticated_value=True)    
    def update_scholarship(self, caller_user: User, scholarship: Scholarship) -> Result:
        res = self.db.update_scholarship(scholarship)
        if res.success:
            self.log_manager.info(f"scholarship id '{scholarship.id}' successfully updated.")
            return res
        self.log_manager.error(str(res.error))
        return res

    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)       
    def get_scholarship(self, scholarship: Scholarship) -> Result[list[Scholarship]]:
        scholarship = self.db.get_scholarship(scholarship.id)
        if scholarship.success:
            self.log_manager.info(f"Successfully retrieved all scholarships.")
            return scholarship
        self.log_manager.error("Failed to retrieve all scholarships.")
        return scholarship
    
    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)    
    def get_all_sholarships(self) -> Result[list[Scholarship]]:
        scholarships = self.db.get_all_scholarships()
        if scholarships.success:
            self.log_manager.info(f"Successfully retrieved all scholarships.")
            return scholarships
        self.log_manager.error("Failed to retrieve all scholarships.")
        return scholarships
    
    @validate_user(check_roles=True, required_roles=[Role.ADMIN], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def delete_scholarship(self, scholarship: Scholarship):
        res_scholarship = self.db.delete_scholarship(scholarship_id=scholarship.id)
        if not res_scholarship.success:
            self.log_manager.error(res_scholarship.error)
            return Result(success=False, error="faild to delete scholarship")
        self.log_manager.info(f"Successfully updated application.")
        return Result(success=True)
        
    @validate_user(check_roles=True, required_roles=[Role.ADMIN], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def add_application(self, application: Application):
        res = self.db.add_application(application=application)
        if res.success:
            self.log_manager.info(f"New application created for {application.student.user.email} to scholarship {application.scholarship.title}.")
        else:
            self.log_manager.error(res.error)
        return res

    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def get_all_application(self):
        res = self.db.get_all_applications()
        if res.success:
            self.log_manager.info(f"Successfully retrieved all applications.")
        else:
            self.log_manager.error(res.error)
        return res     
    
    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def get_application(self, application: Application):
        res = self.db.get_applications(application.id)
        if res.success:
            self.log_manager.info(f"Successfully retrieved application.")
        else:
            self.log_manager.error(res.error)
        return res  

    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT, Role.REVIEWER], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def update_application(self, application: Application):
        res = self.db.update_application(application)
        if res.success:
            self.log_manager.info(f"Successfully updated application.")
        else:
            self.log_manager.error(res.error)
        return res
    
    @validate_user(check_roles=True, required_roles=[Role.ADMIN, Role.STUDENT], return_user=False, check_if_authenticated=True, authenticated_value=True)
    def delete_application(self, application: Application):
        res_application = self.db.delete_application(application.id)
        res_student = self.db.delete_student(application.student.user.id) #TODO dont delete user keep him for later, but if im doing so need to see that when saving new applicaion will not get an error 
        if not res_student.success:
            self.log_manager.error(res_student.error)
            return Result(success=False, error="faild to delete student")
        elif not res_application.success:
            self.log_manager.error(res_application.error)
            return Result(success=False, error="faild to delete application")
        self.log_manager.info(f"Successfully updated application.")
        return Result(success=True)
    
    