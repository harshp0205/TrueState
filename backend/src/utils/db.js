import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose
 * Uses MONGO_URI from environment variables
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'test', // Using 'test' database where the data exists
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.db.databaseName}`);
    
    // List all collections
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📁 Available Collections:`, collections.map(c => c.name));
    
    // Count documents in salerecords collection
    const db = conn.connection.db;
    const collectionNames = collections.map(c => c.name);
    
    for (const collName of collectionNames) {
      const count = await db.collection(collName).countDocuments();
      console.log(`   - ${collName}: ${count} documents`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};
