from data_classes.User import User
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass(frozen=True, order=True)
class Scholarship:
    id: str = None
    title: str = None
    content: str = None
    categories: list[str] = None
    expiredDate: datetime = None
    grant: int = None
    additional_grant_description: str= None
    description: str = None
    
