import json




NO_FRONTEND_MODE = None
CLEAN_DB_STARTUP = None
USE_MOCK_DB = None
PATH_TO_MOCK_DB = None

def load_json(config_path = 'utilitis/config.json'):
    global NO_FRONTEND_MODE, CLEAN_DB_STARTUP, USE_MOCK_DB, PATH_TO_MOCK_DB

    with open(config_path) as config_file:
        config = json.load(config_file)
        
    NO_FRONTEND_MODE = config.get('no_frontend_mode', False)
    CLEAN_DB_STARTUP = config.get('clean_db_startup', False)
    USE_MOCK_DB = config.get('use_preloaded_db', False)
    PATH_TO_MOCK_DB = config.get('path_to_preloaded_db(not_affected_by--clean_db_startup)', "")
  
load_json()