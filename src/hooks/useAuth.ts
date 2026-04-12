import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AuthState } from "@/types/auth";

export default function useAuth() {
  const router = useRouter();
  // state.auth matches the store's { auth: authReducer } shape
  const { isAuthenticated, user } = useSelector(
    (state: AuthState) => state.auth,
  );
  const initialized = useRef(false);

  useEffect(() => {
    // Skip on the very first effect call — give AuthInitializer one tick
    // to populate the store synchronously before we decide to redirect.
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    if (!isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [isAuthenticated, router]);

  return { user };
}
