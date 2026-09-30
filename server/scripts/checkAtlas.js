import mongoose from 'mongoose';
import 'dotenv/config';

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB:', mongoose.connection.name);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections in', mongoose.connection.name, ':', collections.map(c => c.name));

    const users = await db.collection('users').find({}).toArray();
    console.log('Total registered users:', users.length);
    console.log('User emails:', users.map(u => ({ id: u._id, name: u.name, email: u.email })));

    const habits = await db.collection('habits').find({}).toArray();
    console.log('Total habits:', habits.length);

    await mongoose.disconnect();
  } catch (err) {
    console.error('DB inspection error:', err);
  }
}

checkDb();
