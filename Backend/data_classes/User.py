from dataclasses import dataclass, field
from typing import Optional

class Role:
    ADMIN = "admin"
    REVIEWER = "reviewer"
    STUDENT = "student"
    RECOMMENDER = "recommender"

    @classmethod
    def is_valid_role(cls, role):
        return role in [cls.ADMIN, cls.REVIEWER, cls.STUDENT, cls.RECOMMENDER]

@dataclass(frozen=True, order=True)
class User:
    first_name: str = None
    surname: str = None
    email: str = None
    id: str = None
    role: Role = None
    authenticated: bool = False
    password: Optional[str] = field(default=None, repr=False)
    athentication_link: str = field(default_factory=str, repr=False)
    
    


