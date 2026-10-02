import mongoose from 'mongoose';
import 'dotenv/config';
import { runDailyReminderCheck } from '../jobs/dailyReminderJob.js';

async function testWithDb(dbName) {
  const uri = `mongodb+srv://banavathuramkumar_db_user:nJldNvSfE6So3nHH@cluster0.p1cdedi.mongodb.net/${dbName}?retryWrites=true&w=majority`;
  await mongoose.connect(uri);
  console.log('Connected to DB:', mongoose.connection.name);
  console.log('Running daily reminder check on', dbName, '...');
  await runDailyReminderCheck();
  console.log('Finished for', dbName);
  await mongoose.disconnect();
}

async function run() {
  await testWithDb('test');
  process.exit(0);
}

run();
