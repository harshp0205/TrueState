import mongoose from 'mongoose';
import 'dotenv/config';

async function checkData() {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = conn.connection.db;
    
    // List all collections in current database
    console.log('\n📊 Current Database:', db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in current database:');
    
    for (const coll of collections) {
      const count = await db.collection(coll.name).countDocuments();
      console.log(`   - ${coll.name}: ${count.toLocaleString()} documents`);
      
      // Show sample document
      if (count > 0) {
        const sample = await db.collection(coll.name).findOne();
        console.log('     Sample fields:', Object.keys(sample).join(', '));
      }
    }
    
    // Check admin database for list of all databases
    console.log('\n🗄️  All Databases:');
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    
    for (const dbInfo of dbs.databases) {
      console.log(`\n   Database: ${dbInfo.name} (${(dbInfo.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
      
      // Connect to each database and list collections
      const tempDb = conn.connection.client.db(dbInfo.name);
      const dbCollections = await tempDb.listCollections().toArray();
      
      for (const coll of dbCollections) {
        const count = await tempDb.collection(coll.name).countDocuments();
        if (count > 0) {
          console.log(`      - ${coll.name}: ${count.toLocaleString()} documents`);
        }
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkData();
