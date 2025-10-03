import { MongoClient, Db, Collection } from 'mongodb';
import type { InstanceData, TimelineEvent, Photo, InstanceDocument } from '@/types/instance';

let client: MongoClient;
let db: Db;

const connectToDatabase = async (): Promise<{ client: MongoClient; db: Db }> => {
  if (db) {
    return { client, db };
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'studio_app';

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    
    console.log('--- MongoDB Connected Successfully ---');
    console.log('Database:', dbName);
    console.log('------------------------------------');
    
    return { client, db };
  } catch (error) {
    console.error('--- MongoDB Connection Failed ---');
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Get the database instance
export const getDb = async (): Promise<Db> => {
  const { db } = await connectToDatabase();
  return db;
};

// Get specific collections with proper typing
export const getInstancesCollection = async (): Promise<Collection<any>> => {
  const database = await getDb();
  return database.collection('instances');
};

// Graceful shutdown
export const closeConnection = async (): Promise<void> => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
};

// Handle process termination
process.on('SIGINT', closeConnection);
process.on('SIGTERM', closeConnection);
