import unittest

from services.main_coordinator import MainCoordinator
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from data_classes.Application import Application, Application_status
from data_classes.Student import Student 
from data_classes.Result import Result
from services.scholarhub_db import ScholarHubDB
from dataclasses import replace
from unittest.mock import patch, MagicMock
from datetime import datetime
from tests.test_utilits import CustomAssertions


def validate_all_passwords_ecrypted(self, db: ScholarHubDB):
    hash_constant_length = 97
    users_res = self.assertResult(db.get_all_users())
    for user in users_res:
        self.assertEqual(len(user.password), hash_constant_length, "password need to be hashed")

USE_SEND_EMAIL_MOCKS = True

def maybe_patch(target):
    def decorator(func):
        if USE_SEND_EMAIL_MOCKS:
            @patch(target)
            def validate_mock(self, mock_send_email=None):
                mock_send_email.return_value = Result(True)  # Mock successful email sending
                func(self)
                mock_send_email.assert_any_call(self.user.email, self.user.first_name, self.user.athentication_link)
            return validate_mock
        else:
            return func
    return decorator


class TestScholarHubManagerLoginLogout(CustomAssertions):
    
    def setUp(self):
        self.manager = MainCoordinator(db_uri='sqlite:///:memory:')
        self.manager.db._clear_db_only_for_debug()
        self.user = User(first_name="guy1", surname="test", email="guy1@bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password")
        self.user2 = User(first_name="guy2", surname="test", email="guy2@post.bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password2")
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_register(self):
        self.assertResult(self.manager.register(self.user))
    
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_register_duplicate(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.register(self.user), success=False)
        
    def test_register_bad_email(self):
        self.assertResult(self.manager.register( replace(self.user, email='guy1@gmail.com')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='guy1@post.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email=' @post.bgu.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='@post.bgu.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='guy@guy1@post.bgu.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='gu%y1@post.bgu.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='guy\\1@post.bgu.ac.il')), success=False)
        self.assertResult(self.manager.register( replace(self.user, email='gu!y1.guy@post.bgu.ac.il')), success=False)
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_authenticate(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))

    def test_authenticate_bad(self):
        self.assertResult(self.manager.authenticate(self.user), success=False)
        self.assertResult(self.manager.authenticate(self.user2), success=False)
        
    def check_user_logeed_in(self, user: User):
        user = self.assertResult(self.manager.db.get_user(user.email))
        return user.logged_in
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_login(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        self.assertResult(self.manager.login(self.user))
        user = self.assertResult(self.manager.db.get_user_email(self.user.email))
        # self.assertTrue(self.check_user_logeed_in(user), "user should be logged in after login")

    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_not_authenticated_before_login(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.login(self.user), success=False)
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_login_duplicate(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        ret = self.assertResult(self.manager.login(self.user))
        # self.assertEqual(ret.data.logged_in, 1)
        ret = self.assertResult(self.manager.login(self.user))
        # self.assertEqual(ret.data.logged_in, 2)
        
    def test_login_not_registered(self):
        self.assertResult(self.manager.login(self.user), success= False)
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_logout(self):
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        self.assertResult(self.manager.login(self.user))
        
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.manager.db)
        return super().tearDown()


class TestScholarHubManagerScholarshipAplication(CustomAssertions):
    def setUp(self):
        self.manager = MainCoordinator(db_uri='sqlite:///:memory:')
        self.manager.db._clear_db_only_for_debug()
        self.user = User(first_name="guy1", surname="test", email="guy1@bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password")
        self.user1 = User(first_name="guy2", surname="test", email="guy2@bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password2")
        self.user2 = User(first_name="guy3", surname="test", email="guy3@bgu.ac.il", role=Role.STUDENT, authenticated=False, password="password3")
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_add_scholarship(self):
        scholarship = Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        self.assertResult(self.manager.login(self.user))
        scholarship_res = self.assertResult(self.manager.open_new_scholarship(self.user, scholarship))
        updated_scholarship = Scholarship(id= scholarship_res.id,title="title test 1",content="content test 1", categories=["category1", "category2", "category3"], expiredDate=datetime.now(), grant=2, additional_grant_description="add test" ,description="description test 1")
        self.assertResult(self.manager.update_scholarship(self.user, updated_scholarship))
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].title, updated_scholarship.title, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].description, updated_scholarship.description, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].content, updated_scholarship.content, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].categories, updated_scholarship.categories, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].expiredDate, updated_scholarship.expiredDate, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].grant, updated_scholarship.grant, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].description, updated_scholarship.description, "get_all_sholarships should return all scholarships")
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_get_all_schoolarships(self):
        scholarship1 =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        scholarship2 =  Scholarship(title="title test 1",content="content test 1", categories=["category3", "category4"], expiredDate=datetime.now(), grant=2, additional_grant_description="add test", description="description test 1")
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        self.assertResult(self.manager.login(self.user))
        updated_scholarship = self.assertResult(self.manager.open_new_scholarship(self.user, scholarship1))
        updated_scholarship_1 = self.assertResult(self.manager.open_new_scholarship(self.user, scholarship2))
        
        
        self.assertEqual(len(self.manager.get_all_sholarships(self.user).data), 2, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[0].id, updated_scholarship.id, "get_all_sholarships should return all scholarships")
        self.assertEqual(self.manager.get_all_sholarships(self.user).data[1].id, updated_scholarship_1.id, "get_all_sholarships should return all scholarships")
    
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')        
    def test_delete_scholarship(self):
        scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        self.assertResult(self.manager.login(self.user))
        scholarship_res = self.assertResult(self.manager.open_new_scholarship(self.user, scholarship))
        self.assertResult(self.manager.delete_scholarship(self.user, scholarship_res))
        self.assertEqual(self.manager.get_all_sholarships(self.user).data, [], "get_all_sholarships should return all scholarships")
            
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.manager.db)
        return super().tearDown()

class TestScholarHubManagerScholarshipApplicaion(CustomAssertions):
    def setUp(self):
        self.manager = MainCoordinator(db_uri='sqlite:///:memory:')
        self.manager.db._clear_db_only_for_debug()
        self.user = User(first_name="guy1", surname="test", email="guy1@bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password")
        self.user2 = User(first_name="guy2", surname="test", email="guy2@bgu.ac.il", role=Role.ADMIN, authenticated=False, password="password1")
        self.student =Student(
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
        self.application = Application(
                    scholarship= None,
                    status= Application_status.pending,
                    rank= 2,
                    date= datetime.now(),
                    id= None,
                    student = None
                    )
        
    @maybe_patch('services.notification_service.Notification_manager.send_verification_email')
    def test_application(self):
        scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), additional_grant_description="add test" , grant=1,description="description test")
        self.assertResult(self.manager.register(self.user))
        self.assertResult(self.manager.authenticate(self.user))
        user = self.assertResult(self.manager.login(self.user))
        scholarship = self.assertResult(self.manager.open_new_scholarship(self.user, scholarship))
        application = self.assertResult(self.manager.add_application(self.user, replace(replace(self.application, student=replace(self.student, user= user)), scholarship=scholarship)))

        res = self.assertResult(self.manager.get_all_application(application.student.user))
        self.assertEqual(len(res), 1, "get_all_application should return all applications")
        self.assertEqual(res[0].id, application.id, "get_all_application should return all applications")
        self.assertEqual(res[0].student.user.email, self.user.email, "get_all_application should return all applications")
        self.assertEqual(res[0].scholarship.id, 1, "get_all_application should return all applications")
        self.assertEqual(res[0].status, Application_status.pending, "get_all_application should return all applications")
        
        fake_scholarship= Scholarship(id= 3, title="fake",content="fake", categories=["fake1", "fake2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test" ,description="fake")

        #test update
        self.assertResult(self.manager.update_application(user, replace(application,#TODO add the new fields for testing   
                scholarship= fake_scholarship,
                status = Application_status.approved,
                rank= 0,
                date = datetime.now(),
                student = replace(application.student,
                    user= self.user2,
                    student_legal_id = "0",
                    student_phone= "",
                    student_department= "",
                    student_degree= "",
                    student_num_of_articles= 0,
                    student_gpa= 0.0,
                    student_gender = "",
                    student_birthday = datetime.now(),
                    supervisor = "",
                    field_of_reserch = "",
                    topic_of_reserch = "",
                    date_of_start_degree = datetime.now(),
                    institute_of_bachelor = "",
                    faculty_of_bachelor = "",
                    rank_articles = 0.0,
                    department_of_bechlor = ""))),
            success=False)
        
        self.assertResult(self.manager.update_application(user, replace(application,
            scholarship= fake_scholarship,
            student = replace(application.student,
                        student_legal_id = "0",
                        student_phone= "",
                        student_department= "",
                        student_degree= "",
                        student_num_of_articles= 0,
                        student_gpa= 0.0,
                        student_gender = "",
                        student_birthday = datetime.now(),
                        supervisor = "",
                        field_of_reserch = "",
                        topic_of_reserch = "",
                        date_of_start_degree = datetime.now(),
                        institute_of_bachelor = "",
                        faculty_of_bachelor = "",
                        rank_articles = 0.0,
                        department_of_bechlor = ""),
            status = Application_status.approved,
            rank= 0,
            date = datetime.now())), success=False)
        
        new_application = self.assertResult(self.manager.update_application(user, replace(application,
            student = replace(application.student,
                        student_legal_id = "0",
                        student_phone= "",
                        student_department= "",
                        student_degree= "",
                        student_num_of_articles= 0,
                        student_gpa= 0.0,
                        student_gender = "",
                        student_birthday = datetime.now(),
                        supervisor = "",
                        field_of_reserch = "",
                        topic_of_reserch = "",
                        date_of_start_degree = datetime.now(),
                        institute_of_bachelor = "",
                        faculty_of_bachelor = "",
                        rank_articles = 0.0,
                        department_of_bechlor = ""),
            status = Application_status.approved,
            rank= 0,
            date = datetime.now())))
        
        self.assertEqual(new_application.student.user.id, application.student.user.id)
        self.assertEqual(new_application.scholarship.id, application.scholarship.id)
        self.assertEqual(new_application.id, application.id)
        self.assertEqual(new_application.student.student_legal_id, "0")
        self.assertEqual(new_application.student.student_phone, "")
        self.assertEqual(new_application.student.student_department, "")
        self.assertEqual(new_application.student.student_degree, "")
        self.assertEqual(new_application.student.student_num_of_articles, 0)
        self.assertEqual(new_application.student.student_gpa, 0.0)
        self.assertEqual(new_application.student.student_gender, "")
        self.assertNotEqual(new_application.student.student_birthday, application.student.student_birthday)
        self.assertEqual(new_application.student.supervisor, "")
        self.assertEqual(new_application.student.field_of_reserch, "")
        self.assertEqual(new_application.student.topic_of_reserch, "")
        self.assertNotEqual(new_application.student.date_of_start_degree, application.student.date_of_start_degree)
        self.assertEqual(new_application.student.institute_of_bachelor, "")
        self.assertEqual(new_application.student.faculty_of_bachelor, "")
        self.assertEqual(new_application.student.rank_articles, 0.0)
        self.assertEqual(new_application.student.department_of_bechlor, "")
        
        self.assertResult(self.manager.delete_application(user, application))
        self.assertResult(self.manager.get_application(user, application), success=False)
        self.assertResult(self.manager.delete_application(user, application), success=False)

     
    def tearDown(self) -> None:
        validate_all_passwords_ecrypted(self, self.manager.db)
        return super().tearDown()
    
    
