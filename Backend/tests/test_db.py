import unittest
from services.scholarhub_db import ScholarHubDB
from services.models import UserDB, ScholarshipDB, ApplicationDB
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from data_classes.Application import Application, Application_status
from data_classes.Student import Student
from datetime import datetime
from tests.test_utilits import CustomAssertions
from dataclasses import replace

guy = User(first_name="guy", surname="test", email="guy@post.bgu.ac.il", role=Role.ADMIN, authenticated=True, password="password")
dan = User(first_name="dan", surname="test", email="dan@post.bgu.ac.il", role=Role.STUDENT, authenticated=True, password="password")
nimrod = User(first_name="nimrod", surname="test", email="nimrod@post.bgu.ac.il", role=Role.REVIEWER, authenticated=True, password="password")
fake_user =  User(first_name="fake", surname="test", email="fake@post.bgu.ac.il", role=Role.REVIEWER, authenticated=True, password="password")
    
class TestScholarHubDBAddUser(CustomAssertions):
  
    def setUp(self):
        self.db = ScholarHubDB(db_uri='sqlite:///:memory:')
        
    def test_add_user_sanity(self):
        self.assertResult(self.db.add_user(guy))
        
    def test_add_user(self):
        user1 = self.assertResult(self.db.add_user(guy))
        user2 =self.assertResult(self.db.add_user(dan))
        self.assertIsNotNone(user1.id)        
        self.assertIsNotNone(user2.id)
        self.assertNotEqual(user1.id, user2.id)  
              
        # Check if the session's add method was called with a UserDB object
        # having the correct attributes
        added_user = self.db.Session().query(UserDB).filter_by(email=guy.email).first()
        self.assertIsInstance(added_user, UserDB, "The object added should be an instance of User")
        
        self.assertEqual(added_user.first_name, guy.first_name, "The User's name should match the one provided")
        self.assertEqual(added_user.surname, guy.surname, "The User's name should match the one provided")
        self.assertEqual(added_user.email, guy.email, "The User's email should match the one provided")
        self.assertEqual(added_user.role, guy.role, "The User's role should match the one provided")
        self.assertEqual(added_user.password_hash, guy.password, "The User's password should match the one provided")
        self.assertEqual(added_user.authenticated, guy.authenticated, "The User need to be authenticated")

    def test_add_user_duplicate(self):
        self.assertResult(self.db.add_user(guy))
        self.assertResult(self.db.add_user(guy), success=False)
    
    def tearDown(self) -> None:
        self.db.Session().close()


class TestScholarHubDBGetUserFromEmail(CustomAssertions):
      
    def setUp(self):
        self.db = ScholarHubDB(db_uri='sqlite:///:memory:')
        self.db.add_user(guy)
        self.db.add_user(dan)
        self.db.add_user(nimrod)
          
    def test_get_user_from_email(self):
        user = self.assertResult(self.db.get_user_email(guy.email))
        self.assertEqual(user.email, guy.email, "The User's email should match the one provided")
        self.assertIsNotNone(user.id) 
        
        user = self.assertResult(self.db.get_user_email(dan.email))
        self.assertEqual(user.email, dan.email, "The User's email should match the one provided")
        
    def test_get_user_from_email_not_found(self):
        user = self.assertResult(self.db.get_user_email("none@post.bgu.ac.il"), success=False)
        self.assertIsNone(user, "The User should be None")
    
    def tearDown(self) -> None:
        self.db.Session().close()
        
        
class TestScholarHubDBUpdateUser(CustomAssertions):
      
    def setUp(self):
        self.db = ScholarHubDB(db_uri='sqlite:///:memory:')
        self.guy_saved = self.assertResult(self.db.add_user(guy))
        self.db.add_user(dan)
        self.db.add_user(nimrod)
          
    def test_update_user(self):
        new_guy = User(first_name=guy.first_name, surname=guy.surname, email=dan.email, id=self.guy_saved.id, role=guy.role, authenticated=guy.authenticated, password=guy.password)
        self.assertResult(self.db.update_user(new_guy))
        self.assertEqual(self.db.get_user_email(guy.email).data.first_name, new_guy.first_name)
        self.assertEqual(self.db.get_user_email(guy.email).data.surname, new_guy.surname)
        self.assertEqual(self.db.get_user_email(guy.email).data.email, guy.email, 'update according to id so email should not change')
        self.assertEqual(self.db.get_user_email(guy.email).data.role, new_guy.role)
        self.assertEqual(self.db.get_user_email(guy.email).data.authenticated, new_guy.authenticated)
        self.assertEqual(self.db.get_user_email(guy.email).data.password, dan.password)
        
        # new_guy2 = User(guy.username, guy.email, new_guy.id, guy.role, password="new_password")
        # self.db.update_user(new_guy2)
        # self.assertEqual(self.db.get_user(new_guy.email).data.password, new_guy2.password, "The User's password should be updated")
    
    def test_update_user_no_change(self):
        self.assertResult(self.db.update_user(self.guy_saved))
        self.assertEqual(self.db.get_user_email(guy.email).data.password, guy.password, "The User's password should not be updated")
    
    def tearDown(self) -> None:
        self.db.Session().close()


class TestScholarHubDBScholarship(CustomAssertions):
    
    def setUp(self):
        self.db = ScholarHubDB(db_uri='sqlite:///:memory:')
        self.db.add_user(guy)
        
    def test_add_scholarship(self):
        scholarship =  Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.assertResult(self.db.add_scholarship(scholarship))
        
        added_scholarship = self.db.Session().query(ScholarshipDB).first()
        self.assertEqual(added_scholarship.title, scholarship.title, "The Scholarship's name should match the one provided")
        self.assertEqual(added_scholarship.description, scholarship.description, "The Scholarship's description should match the one provided")
        self.assertEqual(added_scholarship.content, scholarship.content, "The Scholarship's creator should match the one provided")
                
    def test_get_all_scholarship(self):
        scholarship1 =  Scholarship(title="scholarship1 test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        scholarship2 =  Scholarship(title="scholarship2 test",content="content2 test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=2, additional_grant_description="add test", description="description2 test")
        self.db.add_scholarship(scholarship1)
        self.db.add_scholarship(scholarship2)
        scholarships = self.db.get_all_scholarships().data
        self.assertEqual(len(scholarships), 2, "The number of scholarships should be 2")
        self.assertIsInstance(scholarships[0], Scholarship, "The object should be an instance of Scholarship")
        self.assertIsInstance(scholarships[1], Scholarship, "The object should be an instance of Scholarship")
        
        self.assertEqual(scholarships[0].title, scholarship1.title, "The Scholarship's name should match the one provided")
        self.assertEqual(scholarships[0].description, scholarship1.description, "The Scholarship's description should match the one provided")
        self.assertEqual(scholarships[0].content, scholarship1.content, "The Scholarship's creator should match the one provided")
        
        self.assertEqual(scholarships[1].title, scholarship2.title, "The Scholarship's name should match the one provided")
        self.assertEqual(scholarships[1].description, scholarship2.description, "The Scholarship's description should match the one provided")
        self.assertEqual(scholarships[1].content, scholarship2.content, "The Scholarship's creator should match the one provided")
        
    def test_update_scholarship(self):
        scholarship = Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.db.add_scholarship(scholarship)
        scholarship = Scholarship(id= 3, title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test" ,description="description test")
        self.assertFalse(self.db.update_scholarship(scholarship).success, "update_scholarship should return False when id doesnt exist")
        
        scholarships = self.db.get_scholarship(1).data
        self.assertEqual(scholarships.title, scholarship.title, "The Scholarship's name should match the one provided")
        self.assertEqual(scholarships.description, scholarship.description, "The Scholarship's description should match the one provided")
        self.assertEqual(scholarships.content, scholarship.content )
    
    def test_get_scholarship(self):
        scholarship = Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.db.add_scholarship(scholarship)
        
        scholarship = self.db.get_scholarship(1).data
        self.assertEqual(scholarship.title, scholarship.title, "The Scholarship's name should match the one provided")
        self.assertEqual(scholarship.description, scholarship.description, "The Scholarship's description should match the one provided")
        
        scholarship = self.db.get_scholarship(2).data
        self.assertIsNone(scholarship, "The Scholarship should be None")
        
    def test_delete_scholarship(self):
        scholarship = Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")
        self.db.add_scholarship(scholarship)
        self.assertResult(self.db.delete_scholarship(1))
        self.assertResult(self.db.get_scholarship(1), success=False)
        self.assertResult(self.db.delete_scholarship(1), success=False)
        
    def tearDown(self) -> None:
        self.db.Session().close()
        
   
class TestScholarHubDBApplication(CustomAssertions):
    
    def setUp(self):
        self.db = ScholarHubDB(db_uri='sqlite:///:memory:')
        self.guy_saved = self.assertResult(self.db.add_user(guy))
        self.dan_saved = self.assertResult(self.db.add_user(dan))
        self.assertResult(self.db.add_user(nimrod))
        self.assertResult(self.db.add_scholarship(Scholarship(title="title test",content="content test", categories=["category1", "category2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test", description="description test")))
        self.scholarships = self.assertResult(self.db.get_all_scholarships())
        self.application = Application(
                    scholarship= self.scholarships[0],
                    status= Application_status.pending,
                    rank= 2,
                    date= datetime.now(),
                    id= None,
                    student = Student(
                        user=self.guy_saved,
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
                    )
        self.student2 = Student(
                        user=self.dan_saved,
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
        self.application2 = Application(
                    scholarship= self.scholarships[0],
                    status= Application_status.pending,
                    rank= 2,
                    date= datetime.now(),
                    id= None,
                    student = self.student2
                    )

    def test_add_application(self):
        
        self.assertResult(self.db.add_application(self.application))
        
        added_application = self.assertResult(self.db.get_all_applications())[0]
        self.assertEqual(added_application.student.user.id, self.application.student.user.id, "The Application's user_email should match the one provided")
        self.assertEqual(added_application.status, self.application.status, "The Application's status should match the one provided")
        
        application = replace(self.application, student=replace(self.student2, user=fake_user))
        self.assertResult(self.db.add_application(application), success=False)
        
        fake_scholarship= Scholarship(id= 3, title="fake",content="fake", categories=["fake1", "fake2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test" ,description="fake")
        application =  replace(self.application, scholarship=fake_scholarship)
        self.assertResult(self.db.add_application(application), success=False)
      
    def test_get_all_applications(self):
        application1 = self.application
        application2 = self.application2
        self.assertResult(self.db.add_application(application1))
        self.assertResult(self.db.add_application(application2))
        applications = self.assertResult(self.db.get_all_applications())

        self.assertEqual(len(applications), 2, "The number of applications should be 2")
        self.assertIsInstance(applications[0], Application, "The object should be an instance of Application")
        self.assertIsInstance(applications[1], Application, "The object should be an instance of Application")
        
        self.assertEqual(applications[0].student.user.email, application1.student.user.email, "The Application's user_email should match the one provided")
        self.assertEqual(applications[0].scholarship.id, application1.scholarship.id, "The Application's scholarship_id should match the one provided")
        self.assertEqual(applications[0].status, application1.status, "The Application's status should match the one provided")
        self.assertEqual(applications[0].id, 1, "test the id given to application by the database")
        
        self.assertEqual(applications[1].student.user.email, application2.student.user.email, "The Application's user_email should match the one provided")
        self.assertEqual(applications[1].scholarship.id, application2.scholarship.id, "The Application's scholarship_id should match the one provided")
        self.assertEqual(applications[1].status, application2.status, "The Application's status should match the one provided")
        self.assertEqual(applications[1].id, 2, "test the id given to application by the database")
        
        
    def test_update_application(self):
        '''
        test update application, test good flow, update with non existing user or not existing scholarship
        '''
        application = self.assertResult(self.db.add_application(self.application))
        application = replace(application, status = Application_status.approved)
        application = self.assertResult(self.db.update_application(application))
        self.assertEqual(application.status, Application_status.approved)
        
        application = replace(application, status = Application_status.pending, student=replace(application.student, user= fake_user))
        self.assertResult(self.db.update_application(application), success=False)
        self.assertNotEqual(application.status, Application_status.approved)
        
        fake_scholarship= Scholarship(id= 3, title="fake",content="fake", categories=["fake1", "fake2"], expiredDate=datetime.now(), grant=1, additional_grant_description="add test" ,description="fake")
        application = replace(application, student=replace(application.student, user= guy), scholarship= fake_scholarship)
        self.assertResult(self.db.update_application(application), success=False)
        
    def test_delete_application(self):
        '''
        test delete application, test good flow, delete with non existing application
        '''
        application = self.assertResult(self.db.add_application(self.application))
        self.assertResult(self.db.delete_application(application.id))
        self.assertResult(self.db.get_applications(application.id), success=False)
        self.assertResult(self.db.delete_application(application), success=False)
        
    def test_delete_student(self):
        '''
        test delete student, test good flow, delete with non existing student
        '''
        application = self.assertResult(self.db.add_application(self.application))
        self.assertResult(self.db.delete_student(application.student.user.id))
        self.assertResult(self.db.get_applications(application.id), success=False)
        self.assertResult(self.db.delete_student(application.student.user.id), success=False)