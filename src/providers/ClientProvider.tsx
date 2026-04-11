"use client";

import { useDispatch } from "react-redux";
import React, { useRef } from "react";
import { login } from "@/store/authSlice";
import { User } from "better-auth/types";

/** Recursively convert Date values to ISO strings so Redux serialization passes. */
function serializeUser(user: User): User {
  return JSON.parse(JSON.stringify(user));
}

function AuthInitializer({ user }: { user: User }) {
  const dispatch = useDispatch();
  const dispatched = useRef(false);

  // Dispatch synchronously during render (guarded by ref) so the store
  // is populated before any child useEffect sees isAuthenticated=false.
  if (!dispatched.current) {
    dispatch(login(serializeUser(user)));
    dispatched.current = true;
  }

  return null;
}

export default function ClientProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: User;
}) {
  return (
    <>
      {user && <AuthInitializer user={user} />}
      {children}
    </>
  );
}

