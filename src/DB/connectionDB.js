import mongoose from 'mongoose';
import { DB_URL_ONLINE, DB_URI } from '../../config/config.service.js';
export default async function connectionDB(timeout = 10000) {
  const uri = DB_URL_ONLINE || DB_URI;
  if (!uri) throw new Error('Missing DB_URL_ONLINE in config/.env.development');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: timeout });
  console.log('Connected to MongoDB');
}
