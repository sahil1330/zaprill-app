import { config } from "dotenv";
import { resolve } from "path";

// 1. Load environment variables IMMEDIATELY
// We do this before any other imports to avoid hoisting issues
config({ path: resolve(process.cwd(), ".env.local") });

async function createTestUser() {
  console.log("🚀 Initialization...");

  // 2. Dynamically import modules that depend on environment variables
  // This prevents them from initializing before dotenv has finished loading
  const { auth } = await import("../lib/auth");
  const { drizzle } = await import("drizzle-orm/neon-http");
  const { neon } = await import("@neondatabase/serverless");
  const schema = await import("../db/schema");
  const { eq, and } = await import("drizzle-orm");

  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const email = process.argv[2] || "test@zaprill.com";
  const rawPassword = process.argv[3] || "password123";
  const name = "Test User";

  console.log(`Creating/Updating test user: ${name} (${email})...`);

  try {
    // 3. User official Better Auth API for creation/hashing
    const users = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email))
      .limit(1);

    const existingUser = users[0];

    if (existingUser) {
      console.log(`User already exists. Updating...`);

      const ctx = await auth.$context;
      const hashedPassword = await ctx.password.hash(rawPassword);

      await db
        .update(schema.user)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(schema.user.id, existingUser.id));

      await db
        .update(schema.account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(
          and(
            eq(schema.account.userId, existingUser.id),
            eq(schema.account.providerId, "email"),
          ),
        );
    } else {
      console.log("Using Better Auth API to create user...");

      await auth.api.signUpEmail({
        body: {
          email,
          password: rawPassword,
          name,
        },
      });

      console.log("User created. Forcing verification status in DB...");

      await db
        .update(schema.user)
        .set({ emailVerified: true })
        .where(eq(schema.user.email, email));
    }

    console.log("-----------------------------------------------");
    console.log("✅ Test user is ready!");
    console.log(`📧 Email:    ${email}`);
    console.log(`🔑 Password: ${rawPassword}`);
    console.log("-----------------------------------------------");
  } catch (error: any) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
