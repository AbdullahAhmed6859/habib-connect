type BaseUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  major: string;
  school: string;
};

type Student = BaseUser & {
  role: "student";
  class_of: number;
};

type Faculty = BaseUser & {
  role: "faculty";
};

export type User = Student | Faculty;

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

export type CookieUser = {
  id: number;
};
