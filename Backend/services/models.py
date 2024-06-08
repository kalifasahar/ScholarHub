from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Float
from sqlalchemy.orm import relationship
from data_classes.User import User
from sqlalchemy.dialects.postgresql import ARRAY


Base = declarative_base()

class UserDB(Base):
    __tablename__ = 'users'

    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    id = Column(Integer, primary_key=True, autoincrement=True, unique=True)
    role = Column(String, nullable=False)
    
    password_hash = Column(String, nullable=False)
    authenticated = Column(Boolean, nullable=False)


class ScholarshipDB(Base):
    __tablename__ = 'scholarships'
    
    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    title = Column(String, unique=True, nullable=False)
    content = Column(String, nullable=False)
    categories = Column(String, nullable=False)
    expiredDate = Column(DateTime)
    grant = Column(Integer, nullable=False)
    additional_grant_description = Column(String, nullable=False)
    description = Column(String, nullable=False)

class ApplicationDB(Base):
    __tablename__ = 'applications'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    scholarship_id = Column(Integer, ForeignKey('scholarships.id'), nullable=False)
    rank = Column(String)
    status = Column(String, nullable=False)
    date = Column(DateTime)


class StudentDB(Base):
    __tablename__ = 'Students'

    id = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False, unique=True)
    student_legal_id = Column(String)
    student_phone = Column(String)
    student_department = Column(String)
    student_gpa = Column(Float)
    student_degree = Column(String)
    student_num_of_articles = Column(Integer)    
    student_gender = Column(String)
    student_birthday = Column(DateTime)
    supervisor = Column(String)
    field_of_reserch = Column(String)
    topic_of_reserch = Column(String)
    date_of_start_degree = Column(DateTime)
    institute_of_bachelor = Column(String)
    faculty_of_bachelor = Column(String)
    rank_articles = Column(Float)
    department_of_bechlor = Column(String)