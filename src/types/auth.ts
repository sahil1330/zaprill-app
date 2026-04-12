import { User } from "better-auth/types";

export type AuthState = {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
  };
};
