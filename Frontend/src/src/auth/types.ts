import { LogoutOptions, PopupLoginOptions, RedirectLoginOptions } from '@auth0/auth0-react';
import { Permission, Role } from './roles/roles';
import { RouteObject } from 'react-router-dom';

// ----------------------------------------------------------------------

export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
  status?: string;
  loading: boolean;
  user: AuthUserType
};

// ----------------------------------------------------------------------

type CanRemove = {
  login?: (email: string, password: string) => Promise<void>;
  register?: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    isStaff: boolean
  ) => Promise<void>;
  //
  loginWithPopup?: (options?: PopupLoginOptions) => Promise<void>;
  loginWithRedirect?: (options?: RedirectLoginOptions) => Promise<void>;
  //
  confirmRegister?: (email: string, code: string) => Promise<void>;
  forgotPassword?: (email: string) => Promise<void>;
  resendCodeRegister?: (email: string) => Promise<void>;
  newPassword?: (email: string, code: string, password: string) => Promise<void>;
  updatePassword?: (password: string) => Promise<void>;
};

export type JWTContextType = CanRemove & {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, isStaff:boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
};

export type CustomRouteObject = RouteObject & {
  permission?: Permission;
  children?: CustomRouteObject[];
};

export interface wizard_data {
  hebFirstName : string;
  hebLastName : string;
  engFirstName : string;
  engLastName : string;
  supervisor : string;
  studentID : string;
  department : string;
  email : string;
  gender : string;
  yearOfBirth : Date;
  phoneNumber : string;
  faculty : string;
  fieldOfResearch : string;
  topicOfResearch : string;
  dateOfStartDgree : Date;
  dateOfFinishDgree : Date;
  fundsResources : string;
  instituteOfBechlor : string;
  gradesAvarageOfBechlor : string;
  isFinalGrade: boolean;
  rankingOfBechlor: string;
  dateOfFinishBechlor : Date;
  departmentOfBechlor : string;
  facultyOfBechlor : string;
  secondScholarship: string;
  studentNotes: string
}
