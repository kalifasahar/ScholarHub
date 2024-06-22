export type Role = 'admin' | 'student' | 'reviwer' ;
export type Permission = 'Scholarships' | 'editSettings' | 'viewUsers' | 'MyScholarships' | 'CreateScholarship';

export const roles: Record<Role, Permission[]> = {
  admin: ['Scholarships', 'editSettings', 'viewUsers','CreateScholarship'],
  student: ['MyScholarships','Scholarships'],
  reviwer: [],
};
