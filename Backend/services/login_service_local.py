from services.login_service_base import LoginServiceBase
from data_classes.User import User, Role
from services.scholarhub_db import ScholarHubDB
from data_classes.Result import Result
from dataclasses import replace
from services.notification_service import Notification_manager




class LoginServiceLocal(LoginServiceBase):
    def __init__(self, db_service: ScholarHubDB, pwd_context):
        super().__init__()
        self.db_service = db_service
        self.pwd_context = pwd_context
        self.notification_manager = Notification_manager()
    

    def login(self, user: User) -> Result:
        if not self._authenticate(user):
            self.log_manager.warning(f'Login failed for {user.email}')
            return Result(success=False, error= f'Login failed for {user.email}')
        # user=replace(user, logged_in = user.logged_in+1)
        res = self.db_service.update_user(user)
        if not res.success:
            self.log_manager.warning(f'Login failed for {user.email}')
            return Result(success=False, error= f'Login failed for {user.email}')            
        self.log_manager.info(f'Login successful for {user.email}')
        return res
    
    def _authenticate(self, user: User) -> bool:
        user_res = self.db_service.get_user_email(user.email)
        if not user_res.success:
            self.log_manager.error("Failed to get user from db")
            return False
        if user_res.data.password == None:
            self.log_manager.error("No password in db user")
            return False
        return self.verify_password(password=user.password, password_hash=user_res.data.password)
    
    def register(self, user: User) ->  Result: 
        if not self.validate_BGU_student(user.email):
            self.validate_BGU_student(user.email)
            return Result(success=False, error="email not valid")
        if self.db_service.get_user_email(user.email).success:
            return Result(success=False, error="user with this email already exist")
        user_res = self.hash_user_password(user)
        if not user_res.success:
            self.log_manager.info(f'Failed to register user {user.email}. No password sent')
            return Result(False, f'Failed to register user {user.email}. No password sent')
        if user_res.data.role == None or not Role.is_valid_role(user_res.data.role):
            self.log_manager.info(f'Failed to register user {user.email}. No role or not valid')
            return Result(False, f'Failed to register user {user.email}. No role or not valid')
        user_res = self.db_service.add_user(replace(user_res.data, authenticated=False, id=None))
        if not user_res.success:
            self.log_manager.info(f'Failed to register user {user.email}. Failed to save user in the database')
            return Result(False, f'Failed to register user {user.email}. Failed to save user in the database')
        if not self.notification_manager.send_verification_email(user_res.data.email, user_res.data.first_name, user.athentication_link).success:
            self.log_manager.info(f'Failed to send email to User {user.email}.')
            return Result(False, f'Failed to send email to User {user.email}.')
        self.log_manager.info(f"User {user.email} successfully registered.")
        return user_res
        
    def resend_verification_email(self, user: User) -> Result[User]:
        if not self._authenticate(user):
            self.log_manager.warning(f'failed to authenticate {user.email}')
            return Result(success=False, error= f'failed to authenticate {user.email}')
        if not self.notification_manager.send_verification_email(user.email, user.first_name, user.athentication_link).success:
            self.log_manager.info(f'Failed to send email to User {user.email}.')
            return Result(False, error= f'Failed to send email to User {user.email}.')
        self.log_manager.info(f'successfully sent email to {user.email}')
        return Result(success=True, data=user)
    
    #TODO check password validity
    def hash_user_password(self, user: User) -> Result[User]:
        if user.password == None:
            return Result(success=False, error="password cant be None")
        user = replace(user, password= self.pwd_context.hash(user.password))
        return Result(success=True, data=user)

    def verify_password(self, password: str, password_hash: str):
        return self.pwd_context.verify(password, password_hash)
    
    def validate_BGU_student(self, email: str) -> bool:
        gmail_suffix = "@gmail.com"
        bgu_suffix = "bgu.ac.il"
        # invalid_chars = set('!#$%&\'*+/=?^`{|}~')
        semail = email.split("@")
        
        return len(semail) == 2 and \
            semail[1].endswith(bgu_suffix) and \
                not any([char in set('!#$%&\'*+/=?^`{|}~') for char in semail[0]]) and \
                    not semail[0] == "" and not " " in semail[0] and \
                        not "/" in semail[0] and not "\\" in semail[0]
        