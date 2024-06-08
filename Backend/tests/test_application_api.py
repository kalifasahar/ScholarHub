import unittest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from api.UsersAPI import UsersAPI
from api.ScholarshipAPI import ScholarshipAPI
from api.ApplicationAPI import ApplicationAPI
from unittest.mock import patch
from data_classes.Result import Result
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from data_classes.Student import Student
from data_classes.Application import Application, Application_status
from tests.test_system_manager import validate_all_passwords_ecrypted
from services.main_coordinator import MainCoordinator
from datetime import datetime
from tests.test_utilits import CustomAssertions, path_to_testsing_db


class TestApplicationAPI(CustomAssertions):
    
    def setUp(cls):
        app = FastAPI()
        manager = MainCoordinator(path_to_testsing_db)
        cls.users_api = UsersAPI(manager)
        cls.scholarship_api = ScholarshipAPI(manager)
        cls.application_api = ApplicationAPI(manager)
        cls.users_api.manager.db._clear_db_only_for_debug()
        app.include_router(cls.scholarship_api.router, prefix="/api", tags=["scholarships"])
        app.include_router(cls.users_api.router, prefix="/api", tags=["users"])
        app.include_router(cls.application_api.router, prefix="/api", tags=["applications"])
        cls.client = TestClient(app)
        cls.user = User(first_name='admin_user', surname='test', email='admin@post.bgu.ac.il', role= Role.ADMIN, password="securepassword")    
        cls.scholarship = Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="description", description="description test")
        cls.users_api_path = '/api/users/'
        cls.scholarship_api_path = '/api/scholarships/'
        cls.applications_api_path = '/api/applications/'
        
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.users_api.manager.db)
        self.users_api.manager.db._clear_db_only_for_debug()   
        return super().tearDown()
    
    def test_application(self):
        def test_get_scholarship_impl(token, user_id, scholarship_id):
            student =Student(
                        user=None,
                        student_legal_id= "208750760",
                        student_phone= "0543123243",
                        student_department= "dep",
                        student_degree= "test",
                        student_num_of_articles= 4,
                        student_gpa= 2.9,
                        student_gender = "male",
                        student_birthday = datetime.now(),
                        supervisor = "yosi",
                        field_of_reserch = "tomatoes",
                        topic_of_reserch = "cherry tomatoes",
                        date_of_start_degree = datetime.now(),
                        institute_of_bachelor = "BGU",
                        faculty_of_bachelor = "vegan",
                        rank_articles = 1.5,
                        department_of_bechlor = "dep",
                        )
            application = Application(
                    scholarship= None,
                    status= Application_status.pending,
                    rank= 2,
                    date= datetime.now(),
                    id= None,
                    student= student
                    )
            response = self.client.post(self.applications_api_path+"open_new", json={
                "scholarship_id" : f'{scholarship_id}',
                "name_of_scholarship" : f'{self.scholarship.title}',
                "student_name" : f'{self.user.first_name}',
                "user_id" : f'{user_id}',
                "student_legal_id" : f'{application.student.student_legal_id}',
                "student_phone" : f'{application.student.student_phone}',
                "student_department" : f'{application.student.student_department}',
                "student_gpa" : f'{application.student.student_gpa}',
                "student_degree" : f'{application.student.student_degree}',
                "student_num_of_articles" : f'{application.student.student_num_of_articles}',
                "student_gender" : f'{application.student.student_gender}',
                "student_birthday" : f'{application.student.student_birthday.isoformat()}',
                "supervisor" : f'{application.student.supervisor}',
                "field_of_reserch" : f'{application.student.field_of_reserch}',
                "topic_of_reserch" : f'{application.student.topic_of_reserch}',
                "date_of_start_degree" : f'{application.student.date_of_start_degree.isoformat()}',
                "institute_of_bachelor" : f'{application.student.institute_of_bachelor}',
                "faculty_of_bachelor" : f'{application.student.faculty_of_bachelor}',
                "rank_articles" : f'{application.student.rank_articles}',
                "department_of_bechlor" : f'{application.student.department_of_bechlor}',
                "rank" : f'{application.rank}',
                "status" : f'{application.status}',
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            self.assertEqual(str(response.json()['data']["scholarship_id"]), scholarship_id)
            self.assertEqual(str(response.json()['data']["name_of_scholarship"]), self.scholarship.title)
            self.assertEqual(str(response.json()['data']["student_name"]), self.user.first_name)
            self.assertEqual(str(response.json()['data']["user_id"]), str(user_id))
            self.assertEqual(str(response.json()['data']["student_legal_id"]), str(application.student.student_legal_id))
            self.assertEqual(str(response.json()['data']["student_phone"]), application.student.student_phone)
            self.assertEqual(str(response.json()['data']["student_department"]), application.student.student_department)
            self.assertEqual(str(response.json()['data']["student_gpa"]), str(application.student.student_gpa))
            self.assertEqual(str(response.json()['data']["student_degree"]), application.student.student_degree)
            self.assertEqual(str(response.json()['data']["student_num_of_articles"]), str(application.student.student_num_of_articles))
            self.assertEqual(str(response.json()['data']["student_gender"]), str(application.student.student_gender))
            self.assertEqual(str(response.json()['data']["student_birthday"]), str(application.student.student_birthday.isoformat()))
            self.assertEqual(str(response.json()['data']["supervisor"]), str(application.student.supervisor))
            self.assertEqual(str(response.json()['data']["field_of_reserch"]), str(application.student.field_of_reserch))
            self.assertEqual(str(response.json()['data']["topic_of_reserch"]), str(application.student.topic_of_reserch))
            self.assertEqual(str(response.json()['data']["date_of_start_degree"]), str(application.student.date_of_start_degree.isoformat()))
            self.assertEqual(str(response.json()['data']["institute_of_bachelor"]), str(application.student.institute_of_bachelor))
            self.assertEqual(str(response.json()['data']["faculty_of_bachelor"]), str(application.student.faculty_of_bachelor))
            self.assertEqual(str(response.json()['data']["rank_articles"]), str(application.student.rank_articles))
            self.assertEqual(str(response.json()['data']["department_of_bechlor"]), str(application.student.department_of_bechlor))
            application_id = response.json()['data']['id']
            
            response = self.client.get(self.applications_api_path+"get_all", headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            self.assertEqual(response.json()['data'][0]['id'], application_id)
            self.assertEqual(len(response.json()['data']), 1)
            
            
            response = self.client.post(self.applications_api_path+"get_application", json={
                "id": application_id
            },headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            self.assertEqual(int(response.json()['data']['id']), int(application_id))
            self.assertEqual(int(response.json()['data']['user_id']), int(user_id))
            self.assertEqual(int(response.json()['data']['scholarship_id']), int(scholarship_id))
            
            response = self.client.post(self.applications_api_path+"get_application", json={
                "id": 2
            },headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 400, f'{response.content}')
            
            edit_student =Student(
                        user=None,
                        student_legal_id= "208750762",
                        student_phone= "0543123244",
                        student_department= "dep edit",
                        student_degree= "test edit",
                        student_num_of_articles= 2,
                        student_gpa= 2.1,
                        student_gender = "male edit",
                        student_birthday = datetime.now(),
                        supervisor = "yosi edit",
                        field_of_reserch = "tomatoes edit",
                        topic_of_reserch = "cherry tomatoes edit",
                        date_of_start_degree = datetime.now(),
                        institute_of_bachelor = "BGU edit",
                        faculty_of_bachelor = "vegan edit",
                        rank_articles = 1.5,
                        department_of_bechlor = "dep"
                        )
            edit_application = Application(
                    scholarship= None,
                    status= Application_status.approved,
                    rank= 3,
                    date= datetime.now(),
                    id= None,
                    student= edit_student
                    )
            response = self.client.post(self.applications_api_path+"edit", json={
                "scholarship_id" : f'{scholarship_id}',
                "name_of_scholarship" : f'{self.scholarship.title}',
                "student_name" : f'{self.user.first_name}',
                "user_id" : f'{user_id}',
                "student_legal_id" : f'{edit_application.student.student_legal_id}',
                "student_phone" : f'{edit_application.student.student_phone}',
                "student_department" : f'{edit_application.student.student_department}',
                "student_gpa" : f'{edit_application.student.student_gpa}',
                "student_degree" : f'{edit_application.student.student_degree}',
                "student_num_of_articles" : f'{edit_application.student.student_num_of_articles}',
                "student_gender" : f'{edit_application.student.student_gender}',
                "student_birthday" : f'{edit_application.student.student_birthday.isoformat()}',
                "supervisor" : f'{edit_application.student.supervisor}',
                "field_of_reserch" : f'{edit_application.student.field_of_reserch}',
                "topic_of_reserch" : f'{edit_application.student.topic_of_reserch}',
                "date_of_start_degree" : f'{edit_application.student.date_of_start_degree.isoformat()}',
                "institute_of_bachelor" : f'{edit_application.student.institute_of_bachelor}',
                "faculty_of_bachelor" : f'{edit_application.student.faculty_of_bachelor}',
                "rank_articles" : f'{edit_application.student.rank_articles}',
                "department_of_bechlor" : f'{edit_application.student.department_of_bechlor}',
                "rank" : f'{edit_application.rank}',
                "status" : f'{edit_application.status}'
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 400, f'{response.content}')
            
            
            response = self.client.post(self.applications_api_path+"edit", json={
                "id": application_id,
                "scholarship_id" : f'{scholarship_id}',
                "name_of_scholarship" : f'{self.scholarship.title}',
                "student_name" : f'{self.user.first_name}',
                "user_id" : f'{user_id}',
                "student_legal_id" : f'{edit_application.student.student_legal_id}',
                "student_phone" : f'{edit_application.student.student_phone}',
                "student_department" : f'{edit_application.student.student_department}',
                "student_gpa" : f'{edit_application.student.student_gpa}',
                "student_degree" : f'{edit_application.student.student_degree}',
                "student_num_of_articles" : f'{edit_application.student.student_num_of_articles}',
                "student_gender" : f'{edit_application.student.student_gender}',
                "student_birthday" : f'{edit_application.student.student_birthday.isoformat()}',
                "supervisor" : f'{edit_application.student.supervisor}',
                "field_of_reserch" : f'{edit_application.student.field_of_reserch}',
                "topic_of_reserch" : f'{edit_application.student.topic_of_reserch}',
                "date_of_start_degree" : f'{edit_application.student.date_of_start_degree.isoformat()}',
                "institute_of_bachelor" : f'{edit_application.student.institute_of_bachelor}',
                "faculty_of_bachelor" : f'{edit_application.student.faculty_of_bachelor}',
                "rank_articles" : f'{edit_application.student.rank_articles}',
                "department_of_bechlor" : f'{edit_application.student.department_of_bechlor}',
                "rank" : f'{edit_application.rank}',
                "status" : f'{edit_application.status}'
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            
            self.assertEqual(str(response.json()['data']["scholarship_id"]), scholarship_id)
            self.assertEqual(str(response.json()['data']["name_of_scholarship"]), self.scholarship.title)
            self.assertEqual(str(response.json()['data']["student_name"]), self.user.first_name)
            self.assertEqual(str(response.json()['data']["user_id"]), str(user_id))
            self.assertEqual(str(response.json()['data']["student_legal_id"]), str(edit_application.student.student_legal_id))
            self.assertEqual(str(response.json()['data']["student_phone"]), edit_application.student.student_phone)
            self.assertEqual(str(response.json()['data']["student_department"]), edit_application.student.student_department)
            self.assertEqual(str(response.json()['data']["student_gpa"]), str(edit_application.student.student_gpa))
            self.assertEqual(str(response.json()['data']["student_degree"]), edit_application.student.student_degree)
            self.assertEqual(str(response.json()['data']["student_num_of_articles"]), str(edit_application.student.student_num_of_articles))
            self.assertEqual(str(response.json()['data']["student_gender"]), str(edit_application.student.student_gender))
            self.assertEqual(str(response.json()['data']["student_birthday"]), str(edit_application.student.student_birthday.isoformat()))
            self.assertEqual(str(response.json()['data']["supervisor"]), str(edit_application.student.supervisor))
            self.assertEqual(str(response.json()['data']["field_of_reserch"]), str(edit_application.student.field_of_reserch))
            self.assertEqual(str(response.json()['data']["topic_of_reserch"]), str(edit_application.student.topic_of_reserch))
            self.assertEqual(str(response.json()['data']["date_of_start_degree"]), str(edit_application.student.date_of_start_degree.isoformat()))
            self.assertEqual(str(response.json()['data']["institute_of_bachelor"]), str(edit_application.student.institute_of_bachelor))
            self.assertEqual(str(response.json()['data']["faculty_of_bachelor"]), str(edit_application.student.faculty_of_bachelor))
            self.assertEqual(str(response.json()['data']["rank_articles"]), str(edit_application.student.rank_articles))
            self.assertEqual(str(response.json()['data']["department_of_bechlor"]), str(edit_application.student.department_of_bechlor))

            response = self.client.post(self.applications_api_path+"delete", json={
                "id": application_id,
                "scholarship_id" : f'{scholarship_id}',
                "name_of_scholarship" : f'{self.scholarship.title}',
                "user_id" : f'{user_id}',
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 200, f'{response.content}')
            self.assertIn("success", response.json())
            
            response = self.client.post(self.applications_api_path+"delete", json={
                "id": application_id,
                "scholarship_id" : f'{scholarship_id}',
                "name_of_scholarship" : f'{self.scholarship.title}',
                "user_id" : f'{user_id}',
            }, headers={
                "Authorization": f"Bearer {token}"
            })
            self.assertEqual(response.status_code, 400, f'{response.content}')

        self._register_user_and_login_create_scholarship(test_to_run= test_get_scholarship_impl)
        
        
    @patch('services.notification_service.Notification_manager.send_verification_email')    
    def _register_user_and_login_create_scholarship(self, mock_send_email=None, test_to_run= lambda : None):
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
        user_id = response.json()['result']['data']['id']
        
        response = self.client.post(self.scholarship_api_path+"open_new", json={
            "title": self.scholarship.title,
            "content": self.scholarship.content,
            "categories": self.scholarship.categories,
            "expiredDate": self.scholarship.expiredDate.isoformat(),
            "grant": self.scholarship.grant,
            "additional_grant_description": self.scholarship.additional_grant_description,
            "description": self.scholarship.description,
        }, headers={
            "Authorization": f"Bearer {access_token}"
        })
        self.assertEqual(response.status_code, 200, f'{response.content}')
        self.assertIn("success", response.json())
        scholarship_id = response.json()['data']['id']
        

        test_to_run(access_token, user_id, scholarship_id)