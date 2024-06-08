from datetime import datetime
from dataclasses import dataclass
from data_classes.User import User


@dataclass(frozen=True, order=True)
class Student:
    user: User
    student_legal_id: str
    student_phone: str
    student_department: str
    student_degree: str
    student_num_of_articles: int
    student_gpa: float
    student_gender: str
    student_birthday: datetime
    supervisor: str
    field_of_reserch: str
    topic_of_reserch: str
    date_of_start_degree: datetime
    institute_of_bachelor: str
    faculty_of_bachelor: str
    rank_articles: float
    department_of_bechlor: str