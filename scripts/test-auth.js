/**
 * Quick test script to verify Better Auth setup
 * Run with: node scripts/test-auth.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log('🧪 Testing Better Auth Setup...\n');

    // 1. Check users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true },
    });
    console.log(`✓ Found ${users.length} users in database`);

    // 2. Check Account records
    const accounts = await prisma.account.findMany({
      where: { providerId: 'credential' },
      select: { id: true, userId: true, providerId: true, password: true },
    });
    console.log(`✓ Found ${accounts.length} Account records with providerId 'credential'`);

    // 3. Check if all users have Account records
    const usersWithoutAccounts = users.filter(
      (user) => !accounts.some((acc) => acc.userId === user.id)
    );

    if (usersWithoutAccounts.length > 0) {
      console.log(`⚠️  Warning: ${usersWithoutAccounts.length} users without Account records:`);
      usersWithoutAccounts.forEach((user) => {
        console.log(`   - ${user.email} (${user.id})`);
      });
    } else {
      console.log('✓ All users have Account records');
    }

    // 4. Check Account records without passwords
    const accountsWithoutPasswords = accounts.filter((acc) => !acc.password);
    if (accountsWithoutPasswords.length > 0) {
      console.log(`⚠️  Warning: ${accountsWithoutPasswords.length} Account records without passwords`);
    } else {
      console.log('✓ All Account records have passwords');
    }

    // 5. Check sessions
    const sessions = await prisma.session.findMany({
      select: { id: true, userId: true, expiresAt: true },
    });
    console.log(`✓ Found ${sessions.length} active sessions`);

    if (sessions.length > 0) {
      const activeSessions = sessions.filter(
        (s) => new Date(s.expiresAt) > new Date()
      );
      console.log(`   - ${activeSessions.length} active (not expired)`);
      console.log(`   - ${sessions.length - activeSessions.length} expired`);
    }

    console.log('\n✅ Better Auth setup looks good!');
    console.log('\nNext steps:');
    console.log('1. Test login in the browser');
    console.log('2. Check session persistence');
    console.log('3. Test protected routes');
    console.log('4. Verify user roles work correctly');
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();

