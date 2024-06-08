from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker
from services.models import Base, UserDB, ScholarshipDB, ApplicationDB, StudentDB
from utilitis.log_manager import LogManager
from data_classes.User import User, Role
from data_classes.Scholarship import Scholarship
from data_classes.Application import Application
from data_classes.Student import Student
from data_classes.Result import Result
import utilitis.global_config as config
import os

def userDB_from_user(user: User):
    return UserDB(first_name = user.first_name, surname = user.surname, email = user.email, id = user.id, role = user.role, password_hash = user.password, authenticated = user.authenticated)
def user_from_userDB(user: UserDB, with_password=False):
    return User(first_name = user.first_name, surname = user.surname, email = user.email, id = user.id, role = user.role, authenticated = user.authenticated, password= user.password_hash if with_password else '')
def scholarshipDB_from_scholarship(scholarship: Scholarship):
    db_scholarship = ScholarshipDB(
        id=scholarship.id,
        title=scholarship.title,
        content=scholarship.content,
        categories=",".join(scholarship.categories) if scholarship.categories else None,
        expiredDate=scholarship.expiredDate,
        grant=scholarship.grant,
        additional_grant_description=scholarship.additional_grant_description,
        description=scholarship.description
    )
    return db_scholarship
def scholarship_from_scholarshipDB(scholarship: ScholarshipDB):
    db_scholarship = Scholarship(
        id = scholarship.id,
        title = scholarship.title,
        content = scholarship.content,
        categories = scholarship.categories.split(",") if not scholarship.categories == None else None,
        expiredDate = scholarship.expiredDate,
        grant = scholarship.grant,
        additional_grant_description=scholarship.additional_grant_description,
        description = scholarship.description            
    )
    return db_scholarship

def application_from_applicationDB(application: ApplicationDB, student: StudentDB, user:User, scholarship: Scholarship) -> Application:
    return Application(
                    scholarship= scholarship,
                    status= application.status,
                    rank= application.rank,
                    date= application.date,
                    id= application.id,
                    student=Student(
                        user = user,
                        student_legal_id= student.student_legal_id,
                        student_phone= student.student_phone,
                        student_department= student.student_department,
                        student_degree= student.student_degree,
                        student_num_of_articles= student.student_num_of_articles,
                        student_gpa= student.student_gpa,
                        student_gender = student.student_gender,
                        student_birthday = student.student_birthday,
                        supervisor = student.supervisor,
                        field_of_reserch = student.field_of_reserch,
                        topic_of_reserch = student.topic_of_reserch,
                        date_of_start_degree = student.date_of_start_degree,
                        institute_of_bachelor = student.institute_of_bachelor,
                        faculty_of_bachelor = student.faculty_of_bachelor,
                        rank_articles = student.rank_articles,
                        department_of_bechlor = student.department_of_bechlor
                    )
    )
def applicationDB_from_application(application: Application) -> ApplicationDB:
    return ApplicationDB(user_id=application.student.user.id,
                    scholarship_id= application.scholarship.id,
                    status= application.status,
                    rank= application.rank,
                    date= application.date,
                    id= application.id
    )
    
def studentDB_from_student(student: Student) -> ApplicationDB:
    return StudentDB(
                        user_id = student.user.id,
                        student_legal_id= student.student_legal_id,
                        student_phone= student.student_phone,
                        student_department= student.student_department,
                        student_degree= student.student_degree,
                        student_num_of_articles= student.student_num_of_articles,
                        student_gpa= student.student_gpa,
                        student_gender = student.student_gender,
                        student_birthday = student.student_birthday,
                        supervisor = student.supervisor,
                        field_of_reserch = student.field_of_reserch,
                        topic_of_reserch = student.topic_of_reserch,
                        date_of_start_degree = student.date_of_start_degree,
                        institute_of_bachelor = student.institute_of_bachelor,
                        faculty_of_bachelor = student.faculty_of_bachelor,
                        rank_articles = student.rank_articles,
                        department_of_bechlor = student.department_of_bechlor
    )
    
#TODO find how to update db file if its outdated 
class ScholarHubDB:
    def __init__(self, db_uri):
        if config.USE_MOCK_DB:
            db_uri = config.PATH_TO_MOCK_DB
        self.engine = create_engine(db_uri, echo=False, future=True)
        self.sqlite_db(self.engine)
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.log_manager = LogManager(ScholarHubDB.__name__)
        
    def sqlite_db(self, engine):
        with engine.connect() as connection:
            connection.execute(text('PRAGMA foreign_keys=ON'))
        
    def add_user(self, user: User) -> Result[User]:
        session = self.Session()
        try:
            new_user = userDB_from_user(user)
            session.add(new_user)
            session.commit()
            if self.log_manager:
                self.log_manager.info(f"User added: {user.email}")
            return Result(success=True, data=user_from_userDB(new_user))

        except Exception as e:
            session.rollback()
            if self.log_manager:
                self.log_manager.error(f"Error adding user {user.email}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
    
    def get_user_email(self, email: str) -> Result[User]:
        session = self.Session()
        try:
            user = session.query(UserDB).filter_by(email=email).first()
            if user:
                return Result(success=True, data=user_from_userDB(user, with_password=True))
            return Result(success=False, error=f"User not found: {email}")
        except Exception as e:
            self.log_manager.error(f"Error getting user {email}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def get_user_id(self, id: int) -> Result[User]: #TODO add testing and use it in the future
        session = self.Session()
        try:
            user = session.query(UserDB).filter_by(id=id).first()
            if user:
                return Result(success=True, data=user_from_userDB(user, with_password=True))
            return Result(success=False, error=f"User not found: {id}")
        except Exception as e:
            self.log_manager.error(f"Error getting user {id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def get_all_users(self) -> Result[list[User]]:
        session = self.Session()
        try:
            users = session.query(UserDB).all()
            result = []
            for user in users:
                result += [user_from_userDB(user, with_password=True)]
            return Result(success=True, data=result)
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error getting users: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
                
    def update_user(self, user: User) -> Result:
        # cant update email and cant update password and id
        session = self.Session()
        try:
            user_to_update = session.query(UserDB).filter_by(id=user.id).first()
            user_to_update.first_name = user.first_name if user.first_name is not None else user_to_update.first_name
            user_to_update.surname = user.surname if user.surname is not None else user_to_update.surname
            # TODO pssword update is in error because from time to time we recive unhashed password and its saved to the database
            # user_to_update.password_hash = user.password if user.password is not None else user_to_update.password_hash
            user_to_update.role = user.role if user.role is not None else user_to_update.role
            user_to_update.authenticated = user.authenticated if user.authenticated is not None else user_to_update.authenticated
            session.commit()
            self.log_manager.info(f"User updated: {user.email}")
            return Result(success=True, data= user_from_userDB(user_to_update, with_password=False))
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error updating user {user.email}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
    
    def add_scholarship(self, scholarship: Scholarship) -> Result:
        session = self.Session()
        try:
            new_scholarship = scholarshipDB_from_scholarship(scholarship)
            session.add(new_scholarship)
            session.commit()
            self.log_manager.info(f"Scholarship added: {scholarship.id}")
            return Result(success=True, data=scholarship_from_scholarshipDB(new_scholarship))
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error adding scholarship {scholarship.id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()

    def get_scholarship(self, id: str) -> Result[Scholarship]:
        session = self.Session()
        try:
            scholarship = session.query(ScholarshipDB).filter_by(id=id).first()
            if scholarship:
                return Result(success=True, data=scholarship_from_scholarshipDB(scholarship))
            return Result(success=False, error=f"Scholarship not found: {id}")
        except Exception as e:
            self.log_manager.error(f"Error getting scholarship {id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()

    def get_all_scholarships(self) -> Result:
        session = self.Session()
        try:
            scholarships = session.query(ScholarshipDB).all()
            result = []
            for scholarship in scholarships:
                result += [scholarship_from_scholarshipDB(scholarship) ]
            return Result(success=True, data=result)
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error getting scholarships: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()   

    def update_scholarship(self, scholarship: Scholarship) -> Result:
        session = self.Session()
        try:
            scholarship = scholarshipDB_from_scholarship(scholarship)
            scholarship_to_update = session.query(ScholarshipDB).filter_by(id=scholarship.id).first()
            scholarship_to_update.title = scholarship.title if scholarship.title is not None else scholarship_to_update.title 
            scholarship_to_update.content = scholarship.content if scholarship.content is not None else scholarship_to_update.content
            scholarship_to_update.categories = scholarship.categories if scholarship.categories is not None else scholarship_to_update.categories
            scholarship_to_update.expiredDate = scholarship.expiredDate if scholarship.expiredDate is not None else scholarship_to_update.expiredDate
            scholarship_to_update.grant = scholarship.grant if scholarship.grant is not None else scholarship_to_update.grant
            scholarship_to_update.additional_grant_description = scholarship.additional_grant_description if scholarship.additional_grant_description is not None else scholarship_to_update.additional_grant_description
            scholarship_to_update.description = scholarship.description if scholarship.description is not None else scholarship_to_update.description            
            
            session.commit()
            self.log_manager.info(f"Scholarship updated: {scholarship.title}")
            return Result(success=True, data=scholarship_from_scholarshipDB(scholarship))
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error updating scholarship {scholarship.title}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()

    def delete_scholarship(self, scholarship_id: str) -> Result:
            session = self.Session()
            try:
                scholarship_to_delete = session.query(ScholarshipDB).filter_by(id=scholarship_id).first()
                if scholarship_to_delete:
                    session.delete(scholarship_to_delete)
                    session.commit()
                    self.log_manager.info(f"Scholarship deleted: {scholarship_id}")
                    return Result(success=True)
                else:
                    return Result(success=False, error=f"Scholarship not found: {scholarship_id}")
            except Exception as e:
                session.rollback()
                self.log_manager.error(f"Error deleting scholarship {scholarship_id}: {e}")
                return Result(success=False, error=str(e))
            finally:
                session.close()

    def add_application(self, application: Application) -> Result[Application]:
        session = self.Session()
        try:
            userDB_ = session.query(UserDB).filter_by(id=application.student.user.id).first()
            scholarshipDB = session.query(ScholarshipDB).filter_by(id=application.scholarship.id).first()
            applicationDB_ = applicationDB_from_application(application=application)
            studentDB_ = studentDB_from_student(application.student)
            session.add(applicationDB_)
            session.add(studentDB_)
            session.commit()
            self.log_manager.info(f"Application added for scholarship: {scholarshipDB.title} for user: {userDB_.email}")
            return Result(success=True, data= application_from_applicationDB(applicationDB_, studentDB_,user_from_userDB(userDB_), scholarship_from_scholarshipDB(scholarshipDB)))
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Application added for scholarship: {application.scholarship.title} for user: {application.student.user.email} | error: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def get_all_applications(self) -> Result[list[Application]]:
        session = self.Session()
        try:
            result = []
            applications = session.query(ApplicationDB).all()
            for application in applications:
                scholarship =self.get_scholarship(application.scholarship_id)
                user = self.get_user_id(application.user_id)
                student = session.query(StudentDB).filter_by(user_id=application.user_id).first()
                if not scholarship.success:
                    return Result(success=False, error=scholarship.error)
                if not user.success:
                    return Result(success=False, error=user.error)
                if student == None:
                    return Result(success=False, error=f"no data on the user id {application.user_id}")
                result += [application_from_applicationDB(application=application, student=student, user=user.data, scholarship=scholarship.data)]
            return Result(success=True, data=result)
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error getting applications: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def get_applications(self, id: str) -> Result[Scholarship]:
        session = self.Session()
        try:
            application = session.query(ApplicationDB).filter_by(id=id).first()
            if not application:
                return Result(success=False, error=f"application not found: {id}")
            scholarship =self.get_scholarship(application.scholarship_id)
            if not scholarship.success:
                return Result(success=False, error=f"scholarship not found: {application.scholarship_id}")
            user = self.get_user_id(application.user_id)
            if not user.success:
                return Result(success=False, error=f"user not found: {application.user_id}")
            student = session.query(StudentDB).filter_by(user_id=application.user_id).first()
            if student == None:
                    return Result(success=False, error=f"no data on the user id {application.user_id}")
            return Result(success=True, data=application_from_applicationDB(application=application, student=student, user=user.data, scholarship=scholarship.data))
        except Exception as e:
            self.log_manager.error(f"Error getting application {id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def update_application(self, updated_application: Application) -> Result:
        session = self.Session()
        try:
            applicationDB = session.query(ApplicationDB).filter_by(id=updated_application.id).first()
            if applicationDB is None:
                raise Exception("application with this id dosent exist")
            userDB = session.query(UserDB).filter_by(email=updated_application.student.user.email).first()
            if userDB is None:
                raise Exception("user dosent exist")
            scholarshipDB = session.query(ScholarshipDB).filter_by(id=updated_application.scholarship.id).first()
            if scholarshipDB is None:
                raise Exception("scholarship doesnt exist")
            applicationDB.rank = updated_application.rank if updated_application.rank is not None else applicationDB.rank
            applicationDB.status = updated_application.status if updated_application.status is not None else applicationDB.status
            applicationDB.date = updated_application.date if updated_application.date is not None else applicationDB.date
            student = session.query(StudentDB).filter_by(user_id=updated_application.student.user.id).first()
            student.student_legal_id = updated_application.student.student_legal_id if updated_application.student.student_legal_id is not None else student.student_legal_id
            student.student_phone = updated_application.student.student_phone if updated_application.student.student_phone is not None else student.student_phone
            student.student_department = updated_application.student.student_department if updated_application.student.student_department is not None else student.student_department
            student.student_gpa = updated_application.student.student_gpa if updated_application.student.student_gpa is not None else student.student_gpa
            student.student_degree = updated_application.student.student_degree if updated_application.student.student_degree is not None else student.student_degree
            student.student_num_of_articles = updated_application.student.student_num_of_articles if updated_application.student.student_num_of_articles is not None else student.student_num_of_articles
            student.student_gender = updated_application.student.student_gender if updated_application.student.student_gender is not None else student.student_gender
            student.student_birthday = updated_application.student.student_birthday if updated_application.student.student_birthday is not None else student.student_birthday
            student.supervisor = updated_application.student.supervisor if updated_application.student.supervisor is not None else student.supervisor
            student.field_of_reserch = updated_application.student.field_of_reserch if updated_application.student.field_of_reserch is not None else student.field_of_reserch
            student.topic_of_reserch = updated_application.student.topic_of_reserch if updated_application.student.topic_of_reserch is not None else student.topic_of_reserch
            student.date_of_start_degree = updated_application.student.date_of_start_degree if updated_application.student.date_of_start_degree is not None else student.date_of_start_degree
            student.institute_of_bachelor = updated_application.student.institute_of_bachelor if updated_application.student.institute_of_bachelor is not None else student.institute_of_bachelor
            student.faculty_of_bachelor = updated_application.student.faculty_of_bachelor if updated_application.student.faculty_of_bachelor is not None else student.faculty_of_bachelor
            student.rank_articles = updated_application.student.rank_articles if updated_application.student.rank_articles is not None else student.rank_articles
            student.department_of_bechlor = updated_application.student.department_of_bechlor if updated_application.student.department_of_bechlor is not None else student.department_of_bechlor
            session.commit()
            self.log_manager.info(f'Application updated for scholarship: {applicationDB.id} for user: {applicationDB.user_id}')
            return Result(success=True, data= application_from_applicationDB(applicationDB, student, user_from_userDB(userDB), scholarship_from_scholarshipDB(scholarshipDB)))
        except Exception as e:
            session.rollback()
            self.log_manager.error(f'Application updated for scholarship: {updated_application.scholarship.id} | error: {e}')
            return Result(success=False, error=str(e))
        finally:
            session.close()
    
    def delete_application(self, application_id: str) -> Result:
        session = self.Session()
        try:
            application_to_delete = session.query(ApplicationDB).filter_by(id=application_id).first()
            if application_to_delete:
                session.delete(application_to_delete)
                session.commit()
                self.log_manager.info(f"Application deleted: {application_id}")
                return Result(success=True)
            else:
                return Result(success=False, error=f"Application not found: {application_id}")
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error deleting application {application_id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def delete_student(self, student_id: str) -> Result:
        session = self.Session()
        try:
            student_to_delete = session.query(StudentDB).filter_by(user_id=student_id).first()
            if student_to_delete:
                session.delete(student_to_delete)
                session.commit()
                self.log_manager.info(f"Student deleted: {student_id}")
                return Result(success=True)
            else:
                return Result(success=False, error=f"Student not found: {student_id}")
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error deleting student {student_id}: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
            
    def _clear_db_only_for_debug(self) -> Result:
        session = self.Session()
        try:
            session.query(StudentDB).delete()
            session.query(ApplicationDB).delete()
            session.query(ScholarshipDB).delete()
            session.query(UserDB).delete()
            session.commit()
            self.log_manager.info("Database cleared")
            return Result(success=True)
        except Exception as e:
            session.rollback()
            self.log_manager.error(f"Error clearing database: {e}")
            return Result(success=False, error=str(e))
        finally:
            session.close()
