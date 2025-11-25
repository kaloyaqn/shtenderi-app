/**
 * Migration script to move existing users to Better Auth format
 * This creates Account records for existing users with passwords in User table
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateUsers() {
  try {
    console.log('Starting user migration to Better Auth...');

    // Get all users (password is required, so all users have passwords)
    const users = await prisma.user.findMany();

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Check if Account already exists
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: user.id,
          providerId: 'credential',
        },
      });

      if (existingAccount) {
        console.log(`Account already exists for user ${user.email}, skipping...`);
        continue;
      }

      // Create Account record with password from User table
      await prisma.account.create({
        data: {
          id: `credential_${user.id}`,
          accountId: user.email,
          providerId: 'credential',
          userId: user.id,
          password: user.password, // Copy bcrypt hash
        },
      });

      console.log(`✓ Migrated user: ${user.email}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsers();

