import mongoose from 'mongoose';
import 'dotenv/config';

async function findUser() {
  try {
    const uri = process.env.MONGO_URI;
    const client = await mongoose.connect(uri);
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();

    for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.client.db(dbInfo.name);
      const users = await db.collection('users').find({}).toArray();
      console.log(`\n=== Database: ${dbInfo.name} (Users: ${users.length}) ===`);
      for (const u of users) {
        console.log(`- Email: ${u.email}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Timezone: ${u.timezone}`);
        console.log(`  Reminder Settings:`, u.notificationSettings);
        console.log(`  Onboarded:`, u.onboarded);
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findUser();
