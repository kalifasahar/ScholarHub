type IFile = File;

  export type IScholarshipItem = {
    id: string;
    title: string;
    description: string;
    categories: string[];
    content: string;
    DepartmentExpirationDate: Date;
    CraitmanExpirationDarte: Date;
    grant: number;
    grantDescription: string;
    files:IFile[];
  };
