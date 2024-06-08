import logging

class LogManager:
    def __init__(self, name_class, log_level=logging.INFO, log_file='scholarhub.log'):
        self.logger = logging.getLogger(name_class)
        self.logger.setLevel(log_level)

        # Formatter to define the format of log messages
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        # Check if a console handler is already added
        if not any(isinstance(handler, logging.StreamHandler) for handler in self.logger.handlers):
            # Console handler to output logs to the console
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            self.logger.addHandler(console_handler)

        # Check if a file handler is already added for the specified log file
        if log_file and not any(isinstance(handler, logging.FileHandler) and handler.baseFilename == log_file for handler in self.logger.handlers):
            # File handler to write logs to a file
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            self.logger.addHandler(file_handler)

    def debug(self, message):
        self.logger.debug(message)

    def info(self, message: str):
        self.logger.info(message)

    def warning(self, message: str):
        self.logger.warning(message)

    def error(self, message: str):
        self.logger.error(message)

    def critical(self, message: str):
        self.logger.critical(message)
    
    def print(self, message):
        print(message)
    

