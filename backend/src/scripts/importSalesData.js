import fs from 'fs';
import csv from 'csv-parser';
import 'dotenv/config';
import { connectDB } from '../utils/db.js';
import { SaleRecord } from '../models/saleRecord.js';

/**
 * Import sales data from CSV into MongoDB
 */
async function importSalesData() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');

    // Optionally wipe existing data
    if (process.env.WIPE_BEFORE_IMPORT === 'true') {
      console.log('Wiping existing sales data...');
      await SaleRecord.deleteMany({});
      console.log('Existing data cleared');
    }

    let records = [];
    let totalInserted = 0;
    const batchSize = 5000; // Process 5k records at a time
    const maxRecords = 1000000; // Import all 1 million records
    let recordCount = 0;
    const csvPath = 'data/truestate_assignment_dataset.csv';

    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV file not found at: ${csvPath}`);
      process.exit(1);
    }

    console.log(`Reading CSV from: ${csvPath}`);
    console.log(`Importing up to ${maxRecords} records in batches of ${batchSize}...`);

    // Read and parse CSV with streaming batch inserts
    await new Promise((resolve, reject) => {
      const stream = fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', async (row) => {
          // Stop if we've reached max records
          if (recordCount >= maxRecords) {
            stream.pause();
            stream.destroy();
            resolve();
            return;
          }

          recordCount++;

          // Parse tags (split by comma and trim)
          const tags = row['Tags'] 
            ? row['Tags'].split(',').map(tag => tag.trim()).filter(Boolean)
            : [];

          // Map CSV row to SaleRecord schema
          const record = {
            // Customer fields
            customerId: row['Customer ID'],
            customerName: row['Customer Name'],
            phoneNumber: row['Phone Number'],
            gender: row['Gender'],
            age: row['Age'] ? parseInt(row['Age']) : undefined,
            customerRegion: row['Customer Region'],
            customerType: row['Customer Type'],

            // Product fields
            productId: row['Product ID'],
            productName: row['Product Name'],
            brand: row['Brand'],
            productCategory: row['Product Category'],
            tags: tags,

            // Sales fields
            quantity: row['Quantity'] ? parseInt(row['Quantity']) : undefined,
            pricePerUnit: row['Price per Unit'] ? parseFloat(row['Price per Unit']) : undefined,
            discountPercentage: row['Discount Percentage'] ? parseFloat(row['Discount Percentage']) : undefined,
            totalAmount: row['Total Amount'] ? parseFloat(row['Total Amount']) : undefined,
            finalAmount: row['Final Amount'] ? parseFloat(row['Final Amount']) : undefined,

            // Operational fields
            date: row['Date'] ? new Date(row['Date']) : undefined,
            paymentMethod: row['Payment Method'],
            orderStatus: row['Order Status'],
            deliveryType: row['Delivery Type'],
            storeId: row['Store ID'],
            storeLocation: row['Store Location'],
            salespersonId: row['Salesperson ID'],
            employeeName: row['Employee Name']
          };

          records.push(record);

          // Insert batch when it reaches batchSize
          if (records.length >= batchSize) {
            stream.pause(); // Pause stream while inserting
            try {
              await SaleRecord.insertMany(records, { ordered: false });
              totalInserted += records.length;
              console.log(`Inserted ${totalInserted} documents...`);
              records = []; // Clear the batch
            } catch (err) {
              console.error('Error inserting batch:', err.message);
            }
            stream.resume(); // Resume stream
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Insert remaining records
    if (records.length > 0) {
      await SaleRecord.insertMany(records, { ordered: false });
      totalInserted += records.length;
    }

    console.log(`✅ Successfully inserted ${totalInserted} documents into MongoDB`);

    process.exit(0);
  } catch (error) {
    console.error('Error importing sales data:', error);
    process.exit(1);
  }
}

// Run the import
importSalesData();
