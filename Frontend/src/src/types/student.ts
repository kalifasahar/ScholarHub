import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type IUserTableFilterValue = string | string[];

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IStudentItem = {
  name: string;
  email: string;
  studentID: string;
  phoneNumber: string;
  department: string,
  degree: string;
  status: string;
  gradesAvarage: string;
  numOfArticles: string;
  scholarshipName: string;
  ranking: number;
  gender: string;
  yearOfBirth: string;
  supervisor: string;
  fieldOfResearch: string;
  topicOfReasearch: string;
  dateOfStartDgree: string;
  instituteOfBechlor: string;
  facultyOfBechlor: string;
  departmentOfBechlor: string;
  rankArticles: string;
};
