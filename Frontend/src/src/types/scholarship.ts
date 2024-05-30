type IFile = File;

  export type IScholarshipItem = {
    id: string;
    title: string;
    description: string;
    categories: string[];
    content: string;
    ExpirationDate: Date;
    grant: number;
    additionalgrantDescription: string;
  };
