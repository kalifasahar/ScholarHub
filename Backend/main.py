from fastapi import FastAPI
from api.UsersAPI import UsersAPI
from api.ScholarshipAPI import ScholarshipAPI
from api.ApplicationAPI import ApplicationAPI
from fastapi.middleware.cors import CORSMiddleware
from services.main_coordinator import MainCoordinator

# Initialize the FastAPI app
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
 
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = MainCoordinator()
users_api = UsersAPI(manager)
scholarship_api = ScholarshipAPI(manager)
application_api = ApplicationAPI(manager)

# Include routers from different modules
app.include_router(users_api.router, prefix="/api", tags=["users"])
app.include_router(scholarship_api.router, prefix="/api", tags=["scholarships"])
app.include_router(application_api.router, prefix="/api", tags=["applications"])
