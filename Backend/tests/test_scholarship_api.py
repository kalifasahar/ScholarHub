
import unittest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.UsersAPI import UsersAPI
from api.ScholarshipAPI import ScholarshipAPI
from unittest.mock import patch
from data_classes.Result import Result
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from tests.test_system_manager import validate_all_passwords_ecrypted
from services.main_coordinator import MainCoordinator
from datetime import datetime
from tests.test_utilits import CustomAssertions, path_to_testsing_db

#TODO json in update scholarshi that got a bag from front 
# [23:24] Tomer Tal
# {
#     "title": "הקרן הלאומית למדע (ISF) - מלגות פוסט דוק' במדעי החברה - תשפ\"ו",
#     "description": "מצ\"ב קול קורא של הקרן הלאומית למדע (ISF) במסלול מלגות מחייה לבתר-דוקטורנטים במדעי החברה .\n\n",
#     "content": "<ol><li class=\"ql-direction-rtl ql-align-right\">ההגשה הינה באמצעות מערכת<strong>ISF online</strong>&nbsp;&nbsp;. לצורך כך יש לבצע אימות פרטים,&nbsp;ורק חוקרים שאומתו פרטיהם יוכלו להתחיל למלא טופס הרשמה להגשת בקשה.</li><li class=\"ql-direction-rtl ql-align-right\">אימות הפרטים אינו מהווה הרשמה להגשת הבקשה</li><li class=\"ql-direction-rtl ql-align-right\">רשאים להגיש בקשות לקרן רק מועמדים שהגישו את עבודת הדוקטורט עד 14 באוגוסט 2024, ושלא עברו יותר משנתיים&nbsp;מאז תאריך אישור עבודת הדוקטורט, לבין המועד האחרון להגשת בקשות, קרי - 14 באוגוסט 2024.</li><li class=\"ql-direction-rtl ql-align-right\">רשאים להגיש חוקרים שהתואר השלישי שלהם הוא&nbsp;בכל אחד מתחומי מדעי החברה.&nbsp;במקרים בהם התואר השלישי אינו במדעי החברה, אך אחד המנחים לדוקטורט הוא מתחום מדעי החברה ובנוסף השתלמות הבתר-דוקטורט מתוכננת להיות במחלקה של מדעי החברה, ניתן להגיש בקשה.</li><li class=\"ql-direction-rtl ql-align-right\">המועד האחרון לרישום במאגר&nbsp;וביצוע אימות נתונים:&nbsp;<strong>31 ביולי 2024, בשעה 13:00</strong>. חוקרים שלא ירשמו במועד, לא יהיו רשאים להגיש את ההצעה במועד ההגשה.</li><li class=\"ql-direction-rtl ql-align-right\">המועד האחרון להגשת הבקשות לקרן, לאחר אישור רשות המחקר:&nbsp;<strong>14 באוגוסט 2024, בשעה 13:00</strong></li></ol>",
#     "categories": [
#         "בריאות ומדעי החיים",
#         "מדעי החברה",
#         "כלכלה וניהול",
#         "בינתחומי"
#     ],
#     "expiredDate": "2024-07-31T14:11:14.000Z",
#     "grant": 15000,
#     "additional_grant_description": "."
# }
class TestScholarshipAPI(CustomAssertions):
    
    def setUp(cls):
        app = FastAPI()
        manager = MainCoordinator(path_to_testsing_db)
        cls.users_api = UsersAPI(manager)
        cls.scholarship_api = ScholarshipAPI(manager)
        cls.users_api.manager.db._clear_db_only_for_debug()
        app.include_router(cls.scholarship_api.router, prefix="/api", tags=["scholarships"])
        app.include_router(cls.users_api.router, prefix="/api", tags=["users"])
        cls.client = TestClient(app)
        cls.user = User(first_name='admin_user', surname='test', email='admin@post.bgu.ac.il', role= Role.ADMIN, password="securepassword")    
        cls.users_api_path = '/api/users/'
        cls.scholarship_api_path = '/api/scholarships/'
        
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.users_api.manager.db)
        self.users_api.manager.db._clear_db_only_for_debug()   
        return super().tearDown()
    
    def test_create_new_sholarship_then_update(self):
        def create_new_scholarship(token):
            scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="description", description="description test")
            response = self.client.post(self.scholarship_api_path+"open_new", json={
                "title": scholarship.title,
                "content": scholarship.content,
                "categories": scholarship.categories,
                "expiredDate": scholarship.expiredDate.isoformat(),
                "grant": scholarship.grant,
                "additional_grant_description": scholarship.additional_grant_description,
                "description": scholarship.description,
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            scholarship_id = response.json()['data']['id']
            
            response = self.client.get(self.scholarship_api_path+"get_all", headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            self.assertEqual(int(response.json()['data'][0]['id']), int(scholarship_id))

            response = self.client.post(self.scholarship_api_path+"edit", json={
                "id": scholarship_id,
                "title": "test_name_1",
                "description": "test_description_1" 
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            
            response = self.client.post(self.scholarship_api_path+"edit", json={
                "id": str(int(scholarship_id)+1),
                "title": "test_name_1",
                "description": "test_description_1" 
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 400, f'{response.content}')
        self._register_user_and_login(test_to_run= create_new_scholarship)
        
    def test_get_scholarship(self):
        def test_get_scholarship_impl(token):
            scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="description", description="description test")
            response = self.client.post(self.scholarship_api_path+"open_new", json={
                "title": scholarship.title,
                "content": scholarship.content,
                "categories": scholarship.categories,
                "expiredDate": scholarship.expiredDate.isoformat(),
                "grant": scholarship.grant,
                "additional_grant_description": scholarship.additional_grant_description,
                "description": scholarship.description,
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            scholarship_id = response.json()['data']['id']
            
            response = self.client.post(self.scholarship_api_path+"get_scholarship", json={
                "id": scholarship_id
            },headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            self.assertEqual(int(response.json()['data']['id']), int(scholarship_id))
            
        self._register_user_and_login(test_to_run= test_get_scholarship_impl)
        
    def test_delete_scholarship(self):
        def test_delete_scholarship_impl(token):
            scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="description", description="description test")
            response = self.client.post(self.scholarship_api_path+"open_new", json={
                "title": scholarship.title,
                "content": scholarship.content,
                "categories": scholarship.categories,
                "expiredDate": scholarship.expiredDate.isoformat(),
                "grant": scholarship.grant,
                "additional_grant_description": scholarship.additional_grant_description,
                "description": scholarship.description,
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            scholarship_id = response.json()['data']['id']
            
            response = self.client.post(self.scholarship_api_path+"delete", json={
                "id": scholarship_id
            },headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            
            response = self.client.post(self.scholarship_api_path+"get_scholarship", json={
                "id": scholarship_id
            },headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 400, f'{response.content}')
        self._register_user_and_login(test_to_run= test_delete_scholarship_impl)
    
    @patch('services.notification_service.Notification_manager.send_verification_email')    
    def _register_user_and_login(self, mock_send_email=None, test_to_run= lambda : None):
        mock_send_email.return_value = Result(True)
        response = self.client.post(self.users_api_path+"register", json={
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
        
        response = self.client.get(self.users_api_path+"authenticate", params={"token":token})
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        
        response = self.client.post(self.users_api_path+"login", json={
                "email": f'{self.user.email}',
                "password":  f'{self.user.password}'
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json()['result'])
        self.assertIn("access_token", response.json())
        
        access_token = response.json()["access_token"]
        

        test_to_run(access_token)
        
    
