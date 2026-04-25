import '../load-env.js';
import { db } from './db.js';
import bcrypt from 'bcryptjs';
import {
  users,
  auth,
  houses,
  houseImages,
  bookings,
  payments,
  locations,
} from './schema.js';

async function seed() {
  console.log('🌱 Scaling database to 200+ records...');
  
  // Clear non-essential logs
  await db.delete(payments);
  await db.delete(bookings);
  await db.delete(houseImages);
  await db.delete(houses);
  await db.delete(auth);
  await db.delete(users);

  const passwordHash = await bcrypt.hash('Temp@123', 12);

  // 1. GENERATE 50 USERS
  console.log('👤 Seeding 50 users...');
  const userData = [];
  for (let i = 0; i < 50; i++) {
    const isLandlord = i % 3 === 0;
    userData.push({
      fullName: `User ${i} ${isLandlord ? '(Landlord)' : '(Tenant)'}`,
      email: `user${i}@example.com`,
      phone: `254700000${i.toString().padStart(2, '0')}`,
      nationalId: `ID${1000 + i}`,
      role: (isLandlord ? 'landlord' : 'tenant') as any,
      accountStatus: (i % 5 === 0 ? 'pending' : 'approved') as any,
      region: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][i % 4],
    });
  }
  const insertedUsers = await db.insert(users).values(userData as any).returning();
  for (const u of insertedUsers) {
    await db.insert(auth).values({ userId: u.userId, passwordHash, isTemporaryPassword: false });
  }

  // 2. GENERATE 100 HOUSES
  console.log('🏠 Seeding 100 houses...');
  const landlords = insertedUsers.filter(u => u.role === 'landlord');
  const locs = await db.query.locations.findMany();
  
  if (locs.length === 0) {
    console.log('⚠️ No locations found. Creating default locations...');
    const defaultLocs = [
      { county: 'Nairobi', subCounty: 'Westlands', town: 'Westlands', neighborhood: 'Riverside' },
      { county: 'Nairobi', subCounty: 'Dagoretti', town: 'Karen', neighborhood: 'Karen End' },
    ];
    await db.insert(locations).values(defaultLocs as any);
  }
  const updatedLocs = await db.query.locations.findMany();

  const houseData = [];
  for (let i = 0; i < 100; i++) {
    const l = landlords[i % landlords.length];
    const loc = updatedLocs[i % updatedLocs.length];
    houseData.push({
      landlordId: l.userId,
      locationId: loc.locationId,
      title: `High-End Asset #${i} - ${loc.town}`,
      bookingFee: (1000 + (i * 50)).toString(),
      monthlyRent: (25000 + (i * 1000)).toString(),
      description: `A GavaConnect verified property asset with premium amenities in ${loc.neighborhood}.`,
      status: (i % 10 === 0 ? 'pending_approval' : 'active') as any,
      isVerified: i % 10 !== 0,
      houseType: 'one_bedroom',
      furnishing: 'unfurnished',
      bedrooms: 1,
      bathrooms: 1,
      addressLine: `Street ${i}, ${loc.town}`,
      amenities: JSON.stringify(['wifi', 'security']),
    });
  }
  const insertedHouses = await db.insert(houses).values(houseData as any).returning();

  // 3. GENERATE 50 BOOKINGS & PAYMENTS
  console.log('🧾 Seeding 50 bookings and payments...');
  const tenants = insertedUsers.filter(u => u.role === 'tenant');
  const activeHouses = insertedHouses.filter(h => h.status === 'active');
  const bookingData = [];
  for (let i = 0; i < 50; i++) {
    const h = activeHouses[i % activeHouses.length];
    const t = tenants[i % tenants.length];
    bookingData.push({
      seekerId: t.userId,
      houseId: h.houseId,
      status: 'confirmed' as any,
      bookingFee: h.bookingFee,
      totalPrice: (parseFloat(h.monthlyRent) * 1.1).toString(),
      moveInDate: new Date().toISOString(),
      confirmedAt: new Date(2026, 0, 1 + (i % 28)),
    });
  }
  const insertedBookings = await db.insert(bookings).values(bookingData as any).returning();
  
  const paymentData = [];
  for (const b of insertedBookings) {
    paymentData.push({
      bookingId: b.bookingId,
      payerId: b.seekerId,
      amount: b.bookingFee,
      status: 'completed' as any,
      method: 'mpesa' as any,
      paidAt: new Date(),
    });
  }
  await db.insert(payments).values(paymentData as any);

  console.log(`🚀 Stress Test Ready: 50 Users, 100 Houses, 50 Bookings, 50 Payments. Total: 250 records.`);
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
