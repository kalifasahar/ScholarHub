import unittest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.UsersAPI import UsersAPI
from unittest.mock import patch
from data_classes.Result import Result
from data_classes.User import User, Role
from tests.test_system_manager import validate_all_passwords_ecrypted
from services.main_coordinator import MainCoordinator
from api.token import decode_access_token
import utilitis.global_config as config
from tests.test_utilits import CustomAssertions, path_to_testsing_db


class TestUsersAPI(CustomAssertions):
    
    def setUp(cls):
        config.load_json('utilitis/for_tests.json')
        app = FastAPI()
        manager = MainCoordinator(path_to_testsing_db)
        cls.users_api = UsersAPI(manager)
        cls.users_api.manager.db._clear_db_only_for_debug()
        app.include_router(cls.users_api.router, prefix="/api", tags=["users"])
        cls.client = TestClient(app)
        cls.expired_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBwb3N0LmJndS5hYy5pbCIsImV4cCI6MTcxNjAyNTcyMywidHlwZSI6ImFjY2Vzc190b2tlbiJ9._E33_1l1U1bYyQLHavIZUhmCdwOoWk-3HoKWrMZFT4A'
        cls.user = User(id= 0, first_name="admin_user", surname="test", email='admin@post.bgu.ac.il', role= Role.ADMIN, password="securepassword")
        
        cls.api_path = '/api/users/'
        
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.users_api.manager.db)
        self.users_api.manager.db._clear_db_only_for_debug()   
        return super().tearDown()
    
    @patch('services.notification_service.Notification_manager.send_verification_email')
    def test_register_good(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)  
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
    @patch('services.notification_service.Notification_manager.send_verification_email')    
    def test_register_bad(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)
        response = self.client.post(self.api_path+"register", json={
                "first_name ": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 400, f'extra space  need to return error 400. {response.content}')
        self.assertIn("detail", response.json())
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "surname": f'{self.user.surname}',
                "role": f'{self.user.role}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 422, f'email missing need to return 422. {response.content}')
        self.assertIn("detail", response.json())
        
        response = self.client.post(self.api_path+"register", json={
                "first_name ": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}'
        })
        self.assertEqual(response.status_code, 400, f'cant drop optional fields {response.content}')
        self.assertIn("detail", response.json())
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}. when register need to send role')
        self.assertIn("success", response.json())
        self.assertEqual(response.json()['data']['first_name'],self.user.first_name)
        self.assertEqual(response.json()['data']['surname'],self.user.surname)
        self.assertEqual(response.json()['data']['email'],self.user.email)
        self.assertEqual(response.json()['data']['role'],self.user.role)
        if 'password' in response.json()['data']:
            self.assertEqual(None, response.json()['data']['password'])
        self.assertNotIn('athentication_link', response.json()['data'])

    @patch('services.notification_service.Notification_manager.send_verification_email')    
    def test_happy_flow(self, mock_send_email=None):
        mock_send_email.return_value = Result(True)
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        args, kwargs = mock_send_email.call_args
        token_link = args[2]
        token = token_link.split("token=")[1]
        
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json()['result'])
        self.assertIn("access_token", response.json())
        self.assertEqual(response.json()['result']['data']['first_name'],self.user.first_name)
        self.assertEqual(response.json()['result']['data']['surname'],self.user.surname)
        self.assertEqual(response.json()['result']['data']['email'],self.user.email)
        self.assertEqual(response.json()['result']['data']['role'],self.user.role)
        if 'password' in response.json()['result']['data']:
            self.assertEqual(None, response.json()['result']['data']['password'])
        self.assertNotIn('athentication_link', response.json()['result']['data'])
        
        access_token = response.json()["access_token"]
        

        response = self.client.get(self.api_path+"get_all_users", headers={
            "Authorization": f"Bearer {access_token}"
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertTrue(response.json()['success'])
        for user in response.json()["data"]:
            self.assertIn("email", user)
            self.assertIn(f'{self.user.email}', user["email"])

    
    @patch('services.notification_service.Notification_manager.send_verification_email')    
    def test_login_or_authenticate_or_register_twice(self, mock_send_email=None):
        mock_send_email.return_value = Result(True)
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 400, f'{response.content}')
        
        args, kwargs = mock_send_email.call_args
        token_link = args[2]
        token = token_link.split("token=")[1]
        
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        #authenticate second time
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 400, f'{response.content}')
        
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json()['result'])
        self.assertIn("access_token", response.json())
        
        access_token = response.json()["access_token"]
        #login second time
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')

        response = self.client.get(self.api_path+"get_all_users", headers={
            "Authorization": f"Bearer {access_token}"
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertTrue(response.json()['success'])
        for user in response.json()["data"]:
            self.assertIn("email", user)
            self.assertIn(f'{self.user.email}', user["email"])
            
        response = self.client.get(self.api_path+"get_user_data", headers={
            "Authorization": f"Bearer {access_token}"
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertTrue(response.json()['success'])
        user = response.json()["data"]
        self.assertIn("email", user)
        self.assertIn(f'{self.user.email}', user["email"])
        self.assertIn(f'{self.user.first_name}', user["first_name"])
        self.assertIn(f'{self.user.surname}', user["surname"])
        self.assertIn(f'{self.user.role}', user["role"])
        if 'password' in user:
            self.assertIsNone(user['password'])
        

    @patch('services.notification_service.Notification_manager.send_verification_email')
    def test_login_invalid_credentials(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)  
        
        response = self.client.post(self.api_path+"register", json={
            "first_name": f'{self.user.first_name}',
            "surname": f'{self.user.surname}',
            "email": f'{self.user.email}',
            "role": f'{self.user.role}',
            "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        args, kwargs = mock_send_email.call_args
        token_link = args[2]
        token = token_link.split("token=")[1]
        
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"login", json={
            "email": f'{self.user.email}',
            "password":  'wrongpassword'
        })
        self.assertEqual(response.status_code, 400, f'invalid credentials should return error 400. {response.content}')
        self.assertIn("detail", response.json())
        
        response = self.client.post(self.api_path+"login", json={
            "email": 'admin1@post.bgu.ac.il',
            "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 400, f'invalid credentials should return error 400. {response.content}')
        self.assertIn("detail", response.json())
        
    @patch('services.notification_service.Notification_manager.send_verification_email')
    def test_login_without_athentication(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)  
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  'wrongpassword'
        })
        self.assertEqual(response.status_code, 400, f'user not authenticated shuold return error 400. {response.content}')
        self.assertIn("detail", response.json())
        
        
    @patch('services.notification_service.Notification_manager.send_verification_email')
    def test_resend_email(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        response = self.client.post(self.api_path+"resend_authenticate_email", json={
                "email": f'{self.user.email}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"resend_authenticate_email", json={
                "email": f'{self.user.email}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        args, kwargs = mock_send_email.call_args
        token_link = args[2]
        token = token_link.split("token=")[1]
        
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"resend_authenticate_email", json={
                "email": f'{self.user.email}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 400, f'{response.content}')
        
        
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json()['result'])
        self.assertIn("access_token", response.json())
        
        access_token = response.json()["access_token"]
        
    @patch('services.notification_service.Notification_manager.send_verification_email')
    def test_expired_token(self,mock_send_email=None):
        mock_send_email.return_value = Result(True)
        
        response = self.client.post(self.api_path+"register", json={
                "first_name": f'{self.user.first_name}',
                "surname": f'{self.user.surname}',
                "email": f'{self.user.email}',
                "role": f'{self.user.role}',
                "password": f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        args, kwargs = mock_send_email.call_args
        token_link = args[2]
        token = token_link.split("token=")[1]
        
        response = self.client.get(self.api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json()['result'])
        self.assertIn("access_token", response.json())
        
        access_token = response.json()["access_token"]
        
        # test with good token
        response = self.client.get(self.api_path+"get_user_data", headers={
            "Authorization": f"Bearer {access_token}"
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertTrue(response.json()['success'])
        user = response.json()["data"]
        self.assertIn("email", user)
        self.assertIn(f'{self.user.email}', user["email"])
        self.assertIn(f'{self.user.first_name}', user["first_name"])
        self.assertIn(f'{self.user.surname}', user["surname"])
        self.assertIn(f'{self.user.role}', user["role"])
        if 'password' in user:
            self.assertIsNone(user['password'])
            
        response = self.client.get(self.api_path+"get_new_token", headers={
            "Authorization": f"Bearer {access_token}"
        })
        token = response.json()['access_token']
        email = decode_access_token(token)['sub']
        self.assertEqual(email,self.user.email)

        #test with expired token 
        response = self.client.get(self.api_path+"get_user_data", headers={
            "Authorization": f"Bearer {self.expired_token}"
        })
        self.assertEqual(response.status_code, 401, f'{response.content}')
        
        response = self.client.get(self.api_path+"get_new_token", headers={
            "Authorization": f"Bearer {self.expired_token}"
        })
        self.assertEqual(response.status_code, 401, f'{response.content}')
        
        
            
        