from fastapi import APIRouter, HTTPException, Depends, Body, Request
from pydantic import BaseModel
from typing import Optional
from services.main_coordinator import MainCoordinator
from data_classes.User import User
from dataclasses import replace
from api.token import create_access_token, decode_access_token, Token, get_token_from_header, create_user_verification_token
from data_classes.Result import Result
from utilitis.log_manager import LogManager
import utilitis.global_config as config


    
class UserModel(BaseModel):
    id: Optional[int] = None
    first_name: str = None
    surname: str = None
    email: str
    role: Optional[str] = None
    password: Optional[str] = None
    authenticated: Optional[bool] = None

    def build_regular_user(self) -> User:
        return User(
            id = self.id,
            first_name = self.first_name,
            surname= self.surname,
            email=self.email,
            role=self.role,
            password=self.password
        )
        
def userModel_from_user(user: User) -> UserModel:
    return UserModel(
        id = user.id,
        first_name =user.first_name,
        surname= user.surname,
        email= user.email,
        role= user.role,
        password= None,
        authenticated= user.authenticated
    )

class UsersAPI:
    def __init__(self, manager):
        self.log_manager = LogManager(UsersAPI.__name__)
        self.router = APIRouter()
        self.manager: MainCoordinator = manager
        self.link_URL = "http://localhost:3000/auth/jwt/verify-email" if not config.NO_FRONTEND_MODE else "http://127.0.0.1:8000/api/users/authenticate"
        self.router.post("/users/login", response_model=Token)(self.login)
        self.router.post("/users/register")(self.register)
        self.router.get("/users/authenticate")(self.authenticate)
        self.router.get("/users/get_all_users")(self.get_all_users)
        self.router.post("/users/resend_authenticate_email")(self.resend_verification_email)
        self.router.get("/users/get_user_data")(self.get_user_data)
        self.router.get("/users/get_new_token")(self.regenerate_token)

    def request_handler(self, user: UserModel, manager_func):
        user_obj = user.build_regular_user()
        result = manager_func(user_obj)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        return result
    
    def login(self, user: UserModel):
        self.log_manager.info(f"Recived login request from {user.email}")
        res = self.request_handler(user, self.manager.login)
        access_token = create_access_token(user.email)
        return {"access_token": access_token, "token_type": "bearer", "result": Result(success=res.success, data=userModel_from_user(res.data) if not None else None, error=res.error)}

    def register(self, user: UserModel):
        self.log_manager.info(f"Recived register request from {user.email}")
        user_obj = user.build_regular_user()
        token = create_user_verification_token(user_obj.email)
        user_obj = replace(user_obj,  athentication_link = f"{self.link_URL}?token={token}")
        result = self.manager.register(user_obj)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        return Result(success=result.success, data=userModel_from_user(result.data) if not None else None, error=result.error)
    
    def resend_verification_email(self, user: UserModel):
        self.log_manager.info(f"Recived resend verification email request from {user.email}")
        user_obj = user.build_regular_user()
        token = create_user_verification_token(user_obj.email)
        user_obj = replace(user_obj,  athentication_link = f"{self.link_URL}?token={token}")
        result = self.manager.resend_verification_email(user_obj)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        return Result(success=result.success, data=userModel_from_user(result.data) if not None else None, error=result.error)
    
    def authenticate(self, token: str):
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived authentication request from {email}")
        user = UserModel(email=email)
        result = self.request_handler(user, self.manager.authenticate)
        return Result(success=result.success, data=userModel_from_user(result.data) if not None else None, error=result.error)
    
    def regenerate_token(self, request: Request):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived regenerate token request from {email}")
        token = create_access_token(email)
        return {"access_token": token, "token_type": "bearer", "result": ""}

    def get_user_data(self, request: Request):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived get user data request from {email}")
        user_obj = UserModel(email=email).build_regular_user()
        result = self.manager.get_user(user_obj,user_obj)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        return Result(success=result.success, data=userModel_from_user(result.data) if not None else None, error=result.error)    

    def get_all_users(self, request: Request):
        token = get_token_from_header(request)
        email = decode_access_token(token)['sub']
        self.log_manager.info(f"Recived get all users request from {email}")
        user_obj = User(email=email)
        result = self.manager.get_all_users(user_obj)
        if not result.success:
            raise HTTPException(status_code=400, detail=result.error)
        return Result(success=result.success, data=[userModel_from_user(user) for user in result.data ] if not None else None, error=result.error)