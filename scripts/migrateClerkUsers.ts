/**
 * One-Time Migration Script: Sync all Clerk users to MongoDB
 *
 * Usage:  npx ts-node scripts/migrateClerkUsers.ts
 *
 * This script:
 *  1. Connects to MongoDB
 *  2. Fetches ALL users from Clerk (paginated)
 *  3. Upserts each one into the `users` collection
 *  4. Prints a summary
 */

import "dotenv/config";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import { dbConnect } from "../utils/dbConnect";
import { User } from "../models/User";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error("❌ CLERK_SECRET_KEY is not set in .env");
  process.exit(1);
}

const clerkClient = createClerkClient({ secretKey: CLERK_SECRET_KEY });

async function migrate() {
  console.log("🔌 Connecting to MongoDB...");
  await dbConnect();
  console.log("✅ MongoDB connected\n");

  let totalFetched = 0;
  let totalUpserted = 0;
  let totalSkipped = 0;
  let offset = 0;
  const limit = 100; // Clerk max per page

  console.log("📥 Fetching users from Clerk...\n");

  // Paginate through all Clerk users
  while (true) {
    const { data: users } = await clerkClient.users.getUserList({
      limit,
      offset,
    });

    if (!users || users.length === 0) {
      break;
    }

    totalFetched += users.length;

    for (const u of users) {
      const email = u.emailAddresses?.[0]?.emailAddress;

      if (!email) {
        console.warn(
          `  ⚠️  Skipping user ${u.id} — no email address found`
        );
        totalSkipped++;
        continue;
      }

      const userData = {
        clerkId: u.id,
        firstName: u.firstName || "Unknown",
        lastName: u.lastName || "",
        email,
        profileImageUrl: u.imageUrl || "",
      };

      try {
        const result = await User.updateOne(
          { clerkId: u.id },
          { $set: userData },
          { upsert: true }
        );

        if (result.upsertedCount > 0) {
          console.log(`  ✅ Created: ${userData.firstName} ${userData.lastName} (${email})`);
        } else if (result.modifiedCount > 0) {
          console.log(`  🔄 Updated: ${userData.firstName} ${userData.lastName} (${email})`);
        } else {
          console.log(`  ⏭️  No change: ${userData.firstName} ${userData.lastName} (${email})`);
        }
        totalUpserted++;
      } catch (err) {
        console.error(`  ❌ Error upserting user ${u.id} (${email}):`, err);
      }
    }

    // If we got fewer than the limit, we've reached the end
    if (users.length < limit) {
      break;
    }
    offset += limit;
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Migration Summary");
  console.log("=".repeat(50));
  console.log(`  Total fetched from Clerk : ${totalFetched}`);
  console.log(`  Successfully upserted    : ${totalUpserted}`);
  console.log(`  Skipped (no email)       : ${totalSkipped}`);
  console.log("=".repeat(50));
  console.log("\n✅ Migration complete!");

  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
