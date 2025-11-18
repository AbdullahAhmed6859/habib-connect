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
