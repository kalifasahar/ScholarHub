from utilitis.log_manager import LogManager
from data_classes.User import User
from data_classes.Result import Result
 
class LoginServiceBase:
    def __init__(self):
        self.log_manager = LogManager(LoginServiceBase.__name__)
         
    def _authenticate(self, user: User):
        raise NotImplementedError("Subclass must implement authenticate method")
    
    def register(self, user: User):
        raise NotImplementedError("Subclass must implement register method (not all services require registration)")
    
    def login(self, user: User) -> Result:
        if self._authenticate(user):
            self.log_manager.info(f'Login successful for {user.email}')
            return Result(success=True)
        self.log_manager.warning(f'Login failed for {user.email}')
        return Result(success=False, error= f'Login successful for {user.email}')
    
    def logout(self, user: User) -> Result:
        if user.logged_in:
            self.log_manager.info(f'Logout successful for {user.email}')
            return Result(success=True)
        self.log_manager.warning(f'Logout failed for {user.email}')
        return Result(success=False, error= f'Logout failed for {user.email}')
    

    
    
    
    