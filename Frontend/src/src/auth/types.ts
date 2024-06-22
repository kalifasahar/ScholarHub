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
    lastName: string
  ) => Promise<void>;
  //
  loginWithGoogle?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  loginWithTwitter?: () => Promise<void>;
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
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
};

export type CustomRouteObject = RouteObject & {
  permission?: Permission;
  children?: CustomRouteObject[];
};

export interface form_data {
  student_first_name_heb: string;
  student_last_name_heb: string;
  student_first_name_english: string;
  student_last_name_english: string;
  mentor_name: string;
  israeli_id: string;
  department: string;
  is_israeli: boolean;
  email: string;
  gender: string;
  birth_date: Date;
  phone_number: string;
  faculty: string;
  resarch_field: string;
  resarch_subject: string;
  second_dgree_accpet_date: Date;
  second_dgree_finsih_date: Date;
  second_funding: string;
  first_dgree_institution: string;
  checklist: {
    check_1: boolean;
    check_2: boolean;
    check_3: boolean;
    check_4: boolean;
    check_5: boolean;
    check_6: boolean;
    check_7: boolean;
    check_8: boolean;
  };
  check_5_options: string;
}
