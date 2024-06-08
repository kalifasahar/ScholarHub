from fastapi import APIRouter, HTTPException, Body, Request
from pydantic import BaseModel
from typing import Optional
from services.main_coordinator import MainCoordinator
from data_classes.Application import Application
from data_classes.Scholarship import Scholarship
from data_classes.Student import Student
from data_classes.User import User
from api.token import decode_access_token, get_token_from_header, create_user_verification_token
from data_classes.Result import Result
from utilitis.log_manager import LogManager
from datetime import datetime

    
class ApplicationModel(BaseModel):
    id: Optional[int] = None
    scholarship_id: Optional[int] = None
    name_of_scholarship: Optional[str] = None
    student_name: Optional[str] = None
    student_email: Optional[str] = None 
    student_gender: Optional[str] = None
    student_birthday: Optional[datetime] = None
    supervisor: Optional[str] = None
    field_of_reserch: Optional[str] = None
    topic_of_reserch: Optional[str] = None
    date_of_start_degree: Optional[datetime] = None
    institute_of_bachelor: Optional[str] = None
    faculty_of_bachelor: Optional[str] = None
    department_of_bechlor: Optional[str] = None
    user_id: Optional[int] = None
    student_legal_id: Optional[str] = None
    student_phone: Optional[str] = None
    student_department: Optional[str] = None
    student_gpa: Optional[float] = None
    rank_articles: Optional[float] = None
    student_degree: Optional[str] = None
    student_num_of_articles: Optional[int] = None
    rank: Optional[int] = None
    status: Optional[str] = None
    date: datetime = datetime.now()
    

    def build_regular_application(self, user: User, scholarship: Scholarship, logger: LogManager) -> Application:
        if ((not user is None) and (not user.id == self.user_id)) or ((not scholarship is None) and (not scholarship.id == self.scholarship_id)):
            logger.error(f"Cant convert application to regular scholarship because User/Scholarship id recived and different from the one in ApplicationModel obj")
        return Application(
                scholarship= scholarship,
                status = self.status,
                rank = self.rank,
                date = self.date,
                id = self.id,
                student = Student(
                    user = user,
                    student_legal_id = self.student_legal_id,
                    student_phone = self.student_phone,
                    student_department = self.student_department,
                    student_degree = self.student_degree,
                    student_num_of_articles = self.student_num_of_articles,
                    student_gpa = self.student_gpa,
                    student_gender = self.student_gender,
                    student_birthday = self.student_birthday,
                    supervisor = self.supervisor,
                    field_of_reserch = self.field_of_reserch,
                    topic_of_reserch = self.topic_of_reserch,
                    date_of_start_degree = self.date_of_start_degree,
                    institute_of_bachelor = self.institute_of_bachelor,
                    faculty_of_bachelor = self.faculty_of_bachelor,
                    rank_articles = self.rank_articles,
                    department_of_bechlor = self.department_of_bechlor 
                ))

    
        
def regular_application_to_application_model(application: Application) -> ApplicationModel:
    return ApplicationModel(
            id = application.id, 
            scholarship_id = application.scholarship.id, 
            name_of_scholarship = application.scholarship.title, 
            student_name = application.student.user.first_name, 
            student_email = application.student.user.email,
            user_id = application.student.user.id, 
            student_legal_id = application.student.student_legal_id, 
            student_phone = application.student.student_phone, 
            student_department = application.student.student_department, 
            student_gpa = application.student.student_gpa, 
            student_degree = application.student.student_degree, 
            student_num_of_articles = application.student.student_num_of_articles, 
            student_gender = application.student.student_gender, 
            student_birthday = application.student.student_birthday, 
            supervisor = application.student.supervisor, 
            field_of_reserch = application.student.field_of_reserch, 
            topic_of_reserch = application.student.topic_of_reserch, 
            date_of_start_degree = application.student.date_of_start_degree, 
            institute_of_bachelor = application.student.institute_of_bachelor, 
            faculty_of_bachelor = application.student.faculty_of_bachelor, 
            rank = application.rank, 
            status = application.status, 
            date = application.date,
            rank_articles = application.student.rank_articles,
            department_of_bechlor = application.student.department_of_bechlor
    )

class ApplicationAPI: #TODO move the logic of building the application to main_cordinator this module need to only deal with comunication
    def __init__(self, manager: MainCoordinator):
        self.log_manager = LogManager(ApplicationAPI.__name__)
        self.router = APIRouter()
        self.manager = manager
        self.router.post("/applications/open_new")(self.open_new_application)
        self.router.get("/applications/get_all")(self.get_all_application) 
        self.router.post("/applications/get_application")(self.get_application) 
        self.router.post("/applications/edit")(self.edit_application)
        self.router.post("/applications/delete")(self.delete_application)

    def open_new_application(self, request: Request, application: ApplicationModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived create new application request from {email}")
        user_obj = User(email=email)
        user = self.manager.get_user(user_obj,User(id=application.user_id))
        scholarship = self.manager.get_scholarship(user_obj,scholarship=Scholarship(id=application.scholarship_id))
        if not user.success:
            return user
        elif not scholarship.success:
            return scholarship
        application = application.build_regular_application(user=user.data, scholarship=scholarship.data, logger= self.log_manager)
        res = self.manager.add_application(user_obj, application)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_application_to_application_model(res.data))
    
    def get_all_application(self, request: Request):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived get all application request from {email}")
        user_obj = User(email=email)
        res = self.manager.get_all_application(user_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= [regular_application_to_application_model(application) for application in res.data])
    
    def get_application(self, request: Request, application: ApplicationModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit application request from {email}")
        user_obj = User(email=email)
        if not application.id:
            Result(success=False, error="no application id")
        application = ApplicationModel.build_regular_application(application, None, None, logger= self.log_manager)
        res = self.manager.get_application(user_obj,application)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_application_to_application_model(res.data))
    
    def delete_application(self, request: Request, application: ApplicationModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit application request from {email}")
        user_obj = User(email=email)
        user = self.manager.get_user(user_obj,User(id=application.user_id))
        if not user.success:
            return user
        if not application.id:
            Result(success=False, error="no application id")
        application = ApplicationModel.build_regular_application(application, user.data, None, logger= self.log_manager)
        res = self.manager.delete_application(user_obj,application)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True)
    
    def edit_application(self, request: Request, application: ApplicationModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit scholarship request from {email}")
        user_obj = User(email=email)
        user = self.manager.get_user(user_obj,User(id=application.user_id))
        scholarship = self.manager.get_scholarship(user_obj,scholarship=Scholarship(id=application.scholarship_id))
        if not user.success:
            return user
        elif not scholarship.success:
            return scholarship
        application_obj = application.build_regular_application(user.data, scholarship.data, logger= self.log_manager)
        res = self.manager.update_application(user_obj,application_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_application_to_application_model(res.data))