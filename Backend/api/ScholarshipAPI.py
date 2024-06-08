from fastapi import APIRouter, HTTPException, Body, Request
from pydantic import BaseModel
from typing import Optional
from services.main_coordinator import MainCoordinator
from data_classes.Scholarship import Scholarship
from data_classes.User import User
from api.token import decode_access_token, get_token_from_header, create_user_verification_token
from data_classes.Result import Result
from utilitis.log_manager import LogManager
from datetime import datetime

    
class ScholarshipModel(BaseModel):
    id: str = None
    title: str = None
    content: Optional[str] = None
    categories: Optional[list[str]] = None
    expiredDate: Optional[datetime] = None
    grant: Optional[int] = None
    additional_grant_description: Optional[str]= None
    description: Optional[str] = None

    def build_regular_scholarship(self) -> Scholarship:
        return Scholarship(
                id = int(self.id) if not self.id == None else None,
                title = self.title,
                content = self.content,
                categories = self.categories,
                expiredDate = self.expiredDate,
                grant = self.grant,
                description = self.description,
                additional_grant_description = self.additional_grant_description
        )
        
def regular_scholarship_to_scholarship_model(scholarship: Scholarship) -> ScholarshipModel:
    return ScholarshipModel(
        id = str(scholarship.id),
        title = scholarship.title,
        content = scholarship.content,
        categories = scholarship.categories,
        expiredDate = scholarship.expiredDate,
        grant = scholarship.grant,
        additional_grant_description = scholarship.additional_grant_description,
        description = scholarship.description
    )

class ScholarshipAPI:
    def __init__(self, manager: MainCoordinator):
        self.log_manager = LogManager(ScholarshipAPI.__name__)
        self.router = APIRouter()
        self.manager = manager
        self.router.post("/scholarships/open_new")(self.open_new_scholarship)
        self.router.get("/scholarships/get_all")(self.get_all_scholarship) 
        self.router.post("/scholarships/get_scholarship")(self.get_scholarship) 
        self.router.post("/scholarships/edit")(self.edit_scholarship)
        self.router.post("/scholarships/delete")(self.delete_scholarship)

    def open_new_scholarship(self, request: Request, scholarship: ScholarshipModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived create new scholarship request from {email}")
        user_obj = User(email=email)
        scholarship_obj = scholarship.build_regular_scholarship()
        res = self.manager.open_new_scholarship(user_obj, scholarship_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_scholarship_to_scholarship_model(res.data))
    
    def get_all_scholarship(self, request: Request):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived get all scholarship request from {email}")
        user_obj = User(email=email)
        res = self.manager.get_all_sholarships(user_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= [regular_scholarship_to_scholarship_model(scholarship) for scholarship in res.data])
    
    def delete_scholarship(self, request: Request, scholarship: ScholarshipModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit scholarship request from {email}")
        user_obj = User(email=email)
        scholarship_obj = scholarship.build_regular_scholarship()
        res = self.manager.delete_scholarship(user_obj,scholarship_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True)
    
    def get_scholarship(self, request: Request, scholarship: ScholarshipModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit scholarship request from {email}")
        user_obj = User(email=email)
        scholarship_obj = scholarship.build_regular_scholarship()
        res = self.manager.get_scholarship(user_obj,scholarship_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_scholarship_to_scholarship_model(res.data))
    
    def edit_scholarship(self, request: Request, scholarship: ScholarshipModel = Body(...)):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived eddit scholarship request from {email}")
        user_obj = User(email=email)
        scholarship_obj = scholarship.build_regular_scholarship()
        res = self.manager.update_scholarship(user_obj,scholarship_obj)
        if not res.success:
            raise HTTPException(status_code=400, detail=res.error)
        return Result(success=True, data= regular_scholarship_to_scholarship_model(res.data))
