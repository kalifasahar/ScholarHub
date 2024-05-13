// ----------------------------------------------------------------------

export type IJobFilterValue = string | string[];

export type IJobFilters = {
  roles: string[];
  experience: string;
  locations: string[];
  benefits: string[];
  employmentTypes: string[];
};

// ----------------------------------------------------------------------

export type IJobCandidate = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IJobCompany = {
  name: string;
  logo: string;
  phoneNumber: string;
  fullAddress: string;
};

export type IJobSalary = {
  type: string;
  price: number;
  negotiable: boolean;
};

export type IJobItem = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  skills: string[];
  expiredDate: Date;
  salary: IJobSalary;
  company: IJobCompany;
  description: string;
};
