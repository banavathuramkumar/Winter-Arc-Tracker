import mongoose from 'mongoose';
import 'dotenv/config';

async function searchAll() {
  try {
    const uri = process.env.MONGO_URI;
    const client = await mongoose.connect(uri);
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('All Databases on Cluster:', dbs.databases.map(d => d.name));

    for (const dbInfo of dbs.databases) {
      if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
      const db = mongoose.connection.client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();
      console.log(`\n--- Database: ${dbInfo.name} ---`);
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`Collection: ${coll.name} (${count} docs)`);
        if (coll.name === 'users') {
          const docs = await db.collection('users').find({}).toArray();
          console.log('Users in', dbInfo.name, ':', docs.map(u => ({ email: u.email, name: u.name, createdAt: u.createdAt })));
        }
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error searching databases:', err);
  }
}

searchAll();
