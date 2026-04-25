import '../load-env.js';
import { db } from './db.js';
import bcrypt from 'bcryptjs';
import {
  users,
  auth,
} from './schema.js';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  console.log('👤 Seeding Universal Admins...');
  
  const admins = [
    { email: 'Admin@gmail.com', password: 'Admin123', phone: '254700000000' },
    { email: 'admin@example.com', password: 'Admin123', phone: '254711111111' }
  ];

  for (const a of admins) {
    const passwordHash = await bcrypt.hash(a.password, 12);

    // Check if exists
    const existing = await db.query.users.findFirst({ where: eq(users.email, a.email) });
    
    if (existing) {
      console.log(`Admin ${a.email} already exists. Updating password...`);
      await db.update(auth).set({ passwordHash }).where(eq(auth.userId, existing.userId));
    } else {
      const [newAdmin] = await db.insert(users).values({
        fullName: 'System Administrator',
        email: a.email,
        phone: a.phone,
        nationalId: `ADMIN_${a.email.split('@')[0].toUpperCase()}`,
        role: 'admin',
        accountStatus: 'approved',
        region: 'Nairobi',
      }).returning();

      await db.insert(auth).values({
        userId: newAdmin.userId,
        passwordHash,
        isTemporaryPassword: false,
      });
      console.log(`Admin ${a.email} created successfully.`);
    }
  }

  process.exit(0);
}

seedAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
