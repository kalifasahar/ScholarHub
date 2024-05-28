import { CustomFile } from 'src/components/upload';

// ----------------------------------------------------------------------

export type IUserTableFilterValue = string | string[];

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IStudentItem = { //IUserItem
  name: string;
  studentID: string;
  email: string;
  phoneNumber: string;
  department: string,
  degree: string;
  status: string;
  gradesAvarage: string;
  numOfArticles: string;
};
