call .\setup_env.bat
call .\venv\Scripts\activate
call python -m unittest discover -s tests
@REM call python -m unittest tests\test_users_api.py