from services.login_service_base import LoginServiceBase
from data_classes.User import User

class LoginServiceAdapter(LoginServiceBase):
    def __init__(self):
        super().__init__()

    def _authenticate(self, user: User):
        return True 
    
    def register(self, user: User):
        return True