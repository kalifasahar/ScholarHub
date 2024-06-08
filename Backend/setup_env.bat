@echo off

REM Check if the virtual environment folder exists
IF EXIST .\venv (
    echo Virtual environment already exists.
) ELSE (
    REM Create a virtual environment with Python 3.9
    echo Creating virtual environment with Python 3.9...
    py -3.9 -m venv venv

    REM Activate the virtual environment
    echo Activating virtual environment...
    CALL .\venv\Scripts\activate

    REM Upgrade pip to the latest version
    echo Upgrading pip...
    python -m pip install --upgrade pip

    REM Install the necessary libraries from requirements.txt
    echo Installing necessary libraries from requirements.txt...
    pip install -r requirements.txt
)

echo Setup complete. Use '.\venv\Scripts\activate' to activate the virtual environment.
