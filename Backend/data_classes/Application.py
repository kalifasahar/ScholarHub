from data_classes.User import User
from data_classes.Student import Student
from data_classes.Scholarship import Scholarship
from data_classes.Student import Student
from datetime import datetime
from dataclasses import dataclass
from typing import Optional

class Application_status:
    pending = 'pending'
    approved = 'approved'
    rejected = 'rejected'

@dataclass(frozen=True, order=True)
class Application:
    student: Student
    scholarship: Scholarship
    student: Student
    status: str
    rank: int
    date: datetime = datetime.now()
    id: Optional[int] = None
    

