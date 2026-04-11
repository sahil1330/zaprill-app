"use server";

import db from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Checks if a user already exists in the database with the given email.
 * This is used to prevent the sign-up flow from proceeding for existing accounts.
 */
export async function checkUserExists(email: string) {
  try {
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email.toLowerCase().trim()),
    });

    return !!existingUser;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    // In case of DB error, we default to false to let the auth library handle it,
    // but we could also throw an error to block the UI.
    return false;
  }
}
