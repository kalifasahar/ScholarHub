import unittest
from data_classes.Result import Result

path_to_testsing_db = 'sqlite:///database_files_save/for_testing.db'

class CustomAssertions(unittest.TestCase):
    def assertResult(self, res: Result, success = True):
        if success:
            self.assertTrue(res.success, res.error)
        else:
            self.assertFalse(res.success, f'return data {res.data if not res.data == None else ""}')
        return res.data