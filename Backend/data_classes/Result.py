from dataclasses import dataclass
from typing import Optional,TypeVar,Generic

T = TypeVar('T')

@dataclass(frozen=True, order=True)
class Result(Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None    
