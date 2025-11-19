type BaseUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  program: string;
  school: string;
  acronym: string;
};

type StudentFacultyBase = BaseUser & {
  program: string;
  program_short: string;
  school: string;
  school_short: string;
};

type Student = StudentFacultyBase & {
  role: "student";
  class_of: number;
};

type Faculty = StudentFacultyBase & {
  role: "faculty";
};

type Staff = BaseUser & {
  role: "staff";
};

export type User = Student | Faculty | Staff;

type AuthenticatedSession = {
  status: "authenticated";
  user: User;
};

type UnauthenticatedSession = {
  status: "unauthenticated";
  user: null;
};

type LoadingSession = {
  status: "loading";
  user: null;
};

export type ServerSession = AuthenticatedSession | UnauthenticatedSession;
export type ClientSession = ServerSession | LoadingSession;
export type AuthStatus = ClientSession["status"];

export type CookiePayload = {
  userId: number;
};

export type SignUpFormData = {
  first_name: string;
  last_name: string;
  email_prefix: string;
  email_suffix_id: number;
  role_id: number;
  program_id: number;
  class_of: number | null;
  password: string;
};

export type EmailRoleChoice = {
  email_suffix_id: number;
  email_suffix: string;
  role_id: number;
  role_name: string;
  school_id: number;
  school_name: string;
  program_id: number;
  program_name: string;
};

export type Schools = {
  [id: number]: {
    name: string;
    programs: (keyof Programs)[];
  };
};

export type Options = {
  [id: number]: {
    email_suffix: string;
    role: { id: number; name: string };
    schools: (keyof Schools)[];
  };
};

export type Programs = {
  [id: number]: string;
};

export type FormattedSignUpData = {
  options: Options;
  schools: Schools;
  programs: Programs;
};
