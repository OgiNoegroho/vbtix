/**
 * Create test admin user untuk testing dashboard
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestAdmin() {
  console.log('👤 Creating test admin user...\n');

  try {
    await prisma.$connect();

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin Test',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(), // Mark as verified
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    console.log(`   Role: ${adminUser.role}`);
    
    // Create some test events if needed
    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      console.log('\n📅 Creating test events...');
      
      // Create test organizer first
      const testUser = await prisma.user.create({
        data: {
          name: 'Test Organizer',
          email: 'organizer@test.com',
          password: hashedPassword,
          role: 'ORGANIZER',
        }
      });

      const testOrganizer = await prisma.organizer.create({
        data: {
          userId: testUser.id,
          orgName: 'Test Event Organizer',
          verified: true,
        }
      });

      // Create test events with different statuses
      await prisma.event.createMany({
        data: [
          {
            title: 'Test Event Published',
            description: 'This is a published test event',
            venue: 'Test Venue',
            city: 'Jakarta',
            province: 'DKI Jakarta',
            country: 'Indonesia',
            startDate: new Date('2025-07-01'),
            endDate: new Date('2025-07-01'),
            status: 'PUBLISHED',
            organizerId: testOrganizer.id,
          },
          {
            title: 'Test Event Pending',
            description: 'This is a pending test event',
            venue: 'Test Venue 2',
            city: 'Bandung',
            province: 'Jawa Barat', 
            country: 'Indonesia',
            startDate: new Date('2025-08-01'),
            endDate: new Date('2025-08-01'),
            status: 'PENDING_REVIEW',
            organizerId: testOrganizer.id,
          },
          {
            title: 'Test Event Draft',
            description: 'This is a draft test event',
            venue: 'Test Venue 3',
            city: 'Surabaya',
            province: 'Jawa Timur',
            country: 'Indonesia',
            startDate: new Date('2025-09-01'),
            endDate: new Date('2025-09-01'),
            status: 'DRAFT',
            organizerId: testOrganizer.id,
          }
        ]
      });

      console.log('✅ Test events created');
    }

    return adminUser;

  } catch (error) {
    console.error('❌ Failed to create admin user:', error instanceof Error ? error.message : String(error));
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
