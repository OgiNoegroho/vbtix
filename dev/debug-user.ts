#!/usr/bin/env tsx

/**
 * Script to debug the specific user issue
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function debugUser() {
  try {
    const userId = "cmayzne2x00019e4o1f7zkum7";
    
    console.log(`🔍 Checking user: ${userId}`);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizer: true,
      },
    });

    if (!user) {
      console.log("❌ User not found!");
      return;
    }

    console.log("👤 User found:");
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Role: ${user.role}`);
    console.log(`  - Created: ${user.createdAt}`);

    if (user.organizer) {
      console.log("🏢 Organizer record found:");
      console.log(`  - ID: ${user.organizer.id}`);
      console.log(`  - Org Name: ${user.organizer.orgName}`);
      console.log(`  - Verified: ${user.organizer.verified}`);
      console.log(`  - Created: ${user.organizer.createdAt}`);
    } else {
      console.log("❌ No organizer record found!");
      
      if (user.role === "ORGANIZER") {
        console.log("🔧 Creating organizer record...");
        
        const organizer = await prisma.organizer.create({
          data: {
            userId: user.id,
            orgName: user.name || "Organizer",
            verified: false,
          },
        });
        
        console.log(`✅ Created organizer record with ID: ${organizer.id}`);
      }
    }

    // Check all users with ORGANIZER role
    console.log("\n📊 All users with ORGANIZER role:");
    const organizerUsers = await prisma.user.findMany({
      where: { role: "ORGANIZER" },
      include: { organizer: true },
    });

    organizerUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.id}) - Organizer: ${user.organizer ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error("💥 Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
debugUser()
  .then(() => {
    console.log("Debug completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Debug failed:", error);
    process.exit(1);
  });
