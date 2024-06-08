from datetime import datetime, timedelta
from fastapi import HTTPException, Depends, Request
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from data_classes.Result import Result
from pydantic import BaseModel
from typing import Optional


# Secret key to encode the JWT
SECRET_KEY = "uyO5TVD8pN9En6MrAudYrPP5zrbCJ3yF"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES = 5
ACCESS_TOKEN_TYPE="access_token"
EMAIL_VERIFICATION_TOKEN_TYPE="email_verification"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class Token(BaseModel):
    access_token: str
    token_type: str
    result: Result

def create_access_token(email: str) -> str:
    return _create_token(email, ACCESS_TOKEN_EXPIRE_MINUTES, ACCESS_TOKEN_TYPE)

def create_user_verification_token(email: str) -> str:
    return _create_token(email, EMAIL_VERIFICATION_TOKEN_EXPIRE_MINUTES, EMAIL_VERIFICATION_TOKEN_TYPE)
 
def _create_token(email: str, expire_delta: int, type: str) -> str:
    expire = datetime.now() - timedelta(hours=3) + timedelta(minutes=expire_delta) #jwt.encode adds by defult so me subtract if first
    to_encode = {"sub": email, "exp": expire, "type": f'{type}'}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str = Depends(oauth2_scheme)) -> dict[str:str]:
    return _decode_token(token, ACCESS_TOKEN_TYPE)

def decode_user_verification_token(token: str = Depends(oauth2_scheme)) -> dict[str:str]:
    return _decode_token(token, EMAIL_VERIFICATION_TOKEN_TYPE)

def _decode_token(token: str = Depends(oauth2_scheme), token_type: str = ACCESS_TOKEN_TYPE) -> dict[str:str]:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        time: datetime = datetime.fromtimestamp(payload.get("exp"))
        token_type = payload.get("type")
    except JWTError:
        raise credentials_exception
    if email is None or\
        time is None or\
         not token_type == token_type or\
          time < datetime.now():
        raise credentials_exception
    return {"sub": email, "exp": time, "type": f'{token_type}'}

def get_token_from_header(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if auth_header is None or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_header.split(" ")[1]
    return token