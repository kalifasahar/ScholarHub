
from  services.main_coordinator import MainCoordinator
import getpass
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship

def get_user_inputs() -> tuple:
    """
    Prompts the user for inputs and returns them as a tuple.

    Returns:
        tuple: A tuple containing uName, pwd, and id.
    """
    uname = input('Enter uName: ')
    pwd = getpass.getpass('Enter pwd: ')
    student_or_employee_id = input('Enter id: ')
    return uname, pwd, student_or_employee_id

def main():
    print("test fake login and logout:")
    manager = MainCoordinator()
    user = User(username= "guyp", email="guy@gmail.com", id="208750760", role=Role.ADMIN, password="password")
    # import pdb; pdb.set_trace()
    succ = manager.register(user)
    if succ:
        succ = manager.login(user)
    else:
        print("failed to register")
    manager.open_new_scholarship(user, Scholarship(name="scholarship1", description="desc1", creator=user))
    if succ:
        manager.logout(user)
    else:
        print("failed to login")
    
    # print("test real login and logout: Main Menu:")
    # username, password, id = get_user_inputs()
    # manager.login(username, password, id)
    # manager.logout("test")

    
    print("Goodbye World")
  
if __name__ == '__main__':
    main()
