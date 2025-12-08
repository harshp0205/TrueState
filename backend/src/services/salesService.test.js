import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { SaleRecord } from '../models/saleRecord.js';
import { querySales } from './salesService.js';

let mongoServer;

// Setup in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database before each test
beforeEach(async () => {
  await SaleRecord.deleteMany({});
});

// Seed test data
const seedTestData = async () => {
  const testRecords = [
    {
      customerName: 'John Doe',
      phoneNumber: '1234567890',
      gender: 'Male',
      age: 25,
      customerRegion: 'North',
      productCategory: 'Electronics',
      tags: ['premium', 'warranty'],
      paymentMethod: 'Credit Card',
      date: new Date('2023-01-15'),
      quantity: 2
    },
    {
      customerName: 'Jane Smith',
      phoneNumber: '9876543210',
      gender: 'Female',
      age: 30,
      customerRegion: 'South',
      productCategory: 'Beauty',
      tags: ['organic', 'skincare'],
      paymentMethod: 'UPI',
      date: new Date('2023-02-20'),
      quantity: 5
    },
    {
      customerName: 'Bob Johnson',
      phoneNumber: '5555555555',
      gender: 'Male',
      age: 45,
      customerRegion: 'East',
      productCategory: 'Electronics',
      tags: ['warranty', 'discount'],
      paymentMethod: 'Debit Card',
      date: new Date('2023-03-10'),
      quantity: 1
    },
    {
      customerName: 'Alice Brown',
      phoneNumber: '1111222233',
      gender: 'Female',
      age: 28,
      customerRegion: 'West',
      productCategory: 'Fashion',
      tags: ['premium', 'trending'],
      paymentMethod: 'UPI',
      date: new Date('2023-04-05'),
      quantity: 3
    },
    {
      customerName: 'Charlie Wilson',
      phoneNumber: '9999888877',
      gender: 'Male',
      age: 35,
      customerRegion: 'North',
      productCategory: 'Beauty',
      tags: ['organic'],
      paymentMethod: 'Credit Card',
      date: new Date('2023-05-12'),
      quantity: 4
    },
    {
      customerName: 'Diana Prince',
      phoneNumber: '7777666655',
      gender: 'Female',
      age: 40,
      customerRegion: 'South',
      productCategory: 'Fashion',
      tags: ['trending', 'sale'],
      paymentMethod: 'Cash',
      date: new Date('2023-06-18'),
      quantity: 2
    },
    {
      customerName: 'Eve Adams',
      phoneNumber: '3333444455',
      gender: 'Female',
      age: 22,
      customerRegion: 'East',
      productCategory: 'Electronics',
      tags: ['premium'],
      paymentMethod: 'UPI',
      date: new Date('2023-07-25'),
      quantity: 6
    },
    {
      customerName: 'Frank Miller',
      phoneNumber: '6666777788',
      gender: 'Male',
      age: 50,
      customerRegion: 'West',
      productCategory: 'Beauty',
      tags: ['skincare', 'organic'],
      paymentMethod: 'Debit Card',
      date: new Date('2023-08-30'),
      quantity: 1
    }
  ];

  await SaleRecord.insertMany(testRecords);
};

describe('querySales - Search functionality', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should search by customer name (case-insensitive)', async () => {
    const result = await querySales({ search: 'john' });
    
    expect(result.items.length).toBe(2); // John Doe and Bob Johnson
    expect(result.items.some(item => item.customerName.includes('John'))).toBe(true);
  });

  test('should search by phone number substring', async () => {
    const result = await querySales({ search: '1234' });
    
    expect(result.items.length).toBe(1);
    expect(result.items[0].phoneNumber).toBe('1234567890');
  });

  test('should return all records when no search term provided', async () => {
    const result = await querySales({});
    
    expect(result.items.length).toBe(8);
  });
});

describe('querySales - Multi-select filters', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should filter by multiple regions', async () => {
    const result = await querySales({ regions: ['North', 'South'] });
    
    expect(result.items.length).toBe(4); // 2 North + 2 South
    expect(result.items.every(item => 
      ['North', 'South'].includes(item.customerRegion)
    )).toBe(true);
  });

  test('should filter by multiple genders', async () => {
    const result = await querySales({ genders: ['Female'] });
    
    expect(result.items.length).toBe(4);
    expect(result.items.every(item => item.gender === 'Female')).toBe(true);
  });

  test('should filter by multiple product categories', async () => {
    const result = await querySales({ productCategories: ['Electronics', 'Beauty'] });
    
    expect(result.items.length).toBe(6); // 3 Electronics + 3 Beauty
    expect(result.items.every(item => 
      ['Electronics', 'Beauty'].includes(item.productCategory)
    )).toBe(true);
  });

  test('should filter by multiple tags (matches if any tag)', async () => {
    const result = await querySales({ tags: ['premium'] });
    
    expect(result.items.length).toBe(3); // Records with 'premium' tag
    expect(result.items.every(item => item.tags.includes('premium'))).toBe(true);
  });

  test('should filter by multiple payment methods', async () => {
    const result = await querySales({ paymentMethods: ['UPI', 'Cash'] });
    
    expect(result.items.length).toBe(4);
    expect(result.items.every(item => 
      ['UPI', 'Cash'].includes(item.paymentMethod)
    )).toBe(true);
  });

  test('should combine multiple filters (regions + tags + paymentMethods + dateRange)', async () => {
    const result = await querySales({
      regions: ['North', 'South'],
      tags: ['organic'],
      paymentMethods: ['UPI', 'Credit Card'],
      dateFrom: '2023-02-01',
      dateTo: '2023-06-30'
    });
    
    expect(result.items.length).toBe(2); // Jane Smith and Charlie Wilson
    expect(result.items.every(item => 
      ['North', 'South'].includes(item.customerRegion) &&
      item.tags.includes('organic') &&
      ['UPI', 'Credit Card'].includes(item.paymentMethod)
    )).toBe(true);
  });
});

describe('querySales - Age range filtering', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should filter by valid age range', async () => {
    const result = await querySales({ ageMin: 25, ageMax: 35 });
    
    expect(result.items.length).toBe(4); // Ages 25, 28, 30, 35
    expect(result.items.every(item => item.age >= 25 && item.age <= 35)).toBe(true);
  });

  test('should filter by ageMin only', async () => {
    const result = await querySales({ ageMin: 40 });
    
    expect(result.items.length).toBe(3); // Ages 40, 45, 50
    expect(result.items.every(item => item.age >= 40)).toBe(true);
  });

  test('should filter by ageMax only', async () => {
    const result = await querySales({ ageMax: 30 });
    
    expect(result.items.length).toBe(4); // Ages 22, 25, 28, 30
    expect(result.items.every(item => item.age <= 30)).toBe(true);
  });

  test('should return invalidRange when ageMin > ageMax', async () => {
    const result = await querySales({ ageMin: 40, ageMax: 30 });
    
    expect(result.invalidRange).toBe(true);
    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(0);
  });
});

describe('querySales - Date range filtering', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should filter by date range', async () => {
    const result = await querySales({
      dateFrom: '2023-03-01',
      dateTo: '2023-06-30'
    });
    
    expect(result.items.length).toBe(4); // March to June
  });

  test('should filter by dateFrom only', async () => {
    const result = await querySales({ dateFrom: '2023-06-01' });
    
    expect(result.items.length).toBe(3); // June, July, August
  });

  test('should filter by dateTo only', async () => {
    const result = await querySales({ dateTo: '2023-03-31' });
    
    expect(result.items.length).toBe(3); // Jan, Feb, March
  });
});

describe('querySales - Sorting', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should sort by date (newest first by default)', async () => {
    const result = await querySales({ sortBy: 'date', sortOrder: 'desc' });
    
    expect(result.items[0].customerName).toBe('Frank Miller'); // August 30
    expect(result.items[7].customerName).toBe('John Doe'); // January 15
  });

  test('should sort by date (oldest first)', async () => {
    const result = await querySales({ sortBy: 'date', sortOrder: 'asc' });
    
    expect(result.items[0].customerName).toBe('John Doe'); // January 15
    expect(result.items[7].customerName).toBe('Frank Miller'); // August 30
  });

  test('should sort by quantity ascending', async () => {
    const result = await querySales({ sortBy: 'quantity', sortOrder: 'asc' });
    
    expect(result.items[0].quantity).toBe(1);
    expect(result.items[7].quantity).toBe(6);
  });

  test('should sort by quantity descending', async () => {
    const result = await querySales({ sortBy: 'quantity', sortOrder: 'desc' });
    
    expect(result.items[0].quantity).toBe(6);
    expect(result.items[7].quantity).toBe(1);
  });

  test('should sort by customerName A-Z', async () => {
    const result = await querySales({ sortBy: 'customerName', sortOrder: 'asc' });
    
    expect(result.items[0].customerName).toBe('Alice Brown');
    expect(result.items[7].customerName).toBe('John Doe');
  });

  test('should sort by customerName Z-A', async () => {
    const result = await querySales({ sortBy: 'customerName', sortOrder: 'desc' });
    
    expect(result.items[0].customerName).toBe('John Doe');
    expect(result.items[7].customerName).toBe('Alice Brown');
  });
});

describe('querySales - Pagination', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should use default pageSize of 10', async () => {
    const result = await querySales({});
    
    expect(result.pageSize).toBe(10);
    expect(result.items.length).toBe(8); // Less than 10 total records
  });

  test('should paginate with custom pageSize', async () => {
    const result = await querySales({ page: 1, pageSize: 3 });
    
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
    expect(result.items.length).toBe(3);
    expect(result.totalItems).toBe(8);
    expect(result.totalPages).toBe(3); // 8 items / 3 per page = 3 pages
  });

  test('should return correct page 2', async () => {
    const result = await querySales({ page: 2, pageSize: 3 });
    
    expect(result.page).toBe(2);
    expect(result.items.length).toBe(3);
  });

  test('should return correct page 3 (last page with fewer items)', async () => {
    const result = await querySales({ page: 3, pageSize: 3 });
    
    expect(result.page).toBe(3);
    expect(result.items.length).toBe(2); // Only 2 items on last page
  });

  test('should set hasNextPage correctly', async () => {
    const page1 = await querySales({ page: 1, pageSize: 3 });
    const page3 = await querySales({ page: 3, pageSize: 3 });
    
    expect(page1.hasNextPage).toBe(true);
    expect(page3.hasNextPage).toBe(false);
  });

  test('should set hasPrevPage correctly', async () => {
    const page1 = await querySales({ page: 1, pageSize: 3 });
    const page2 = await querySales({ page: 2, pageSize: 3 });
    
    expect(page1.hasPrevPage).toBe(false);
    expect(page2.hasPrevPage).toBe(true);
  });

  test('should calculate totalPages correctly', async () => {
    const result = await querySales({ pageSize: 3 });
    
    expect(result.totalPages).toBe(3); // 8 items / 3 per page = ceil(2.67) = 3
  });

  test('should return correct pagination metadata', async () => {
    const result = await querySales({ page: 2, pageSize: 5 });
    
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(5);
    expect(result.totalItems).toBe(8);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPrevPage).toBe(true);
  });
});

describe('querySales - Edge cases', () => {
  beforeEach(async () => {
    await seedTestData();
  });

  test('should handle empty filters', async () => {
    const result = await querySales({
      regions: [],
      genders: [],
      productCategories: [],
      tags: [],
      paymentMethods: []
    });
    
    expect(result.items.length).toBe(8); // All records
  });

  test('should handle no matches', async () => {
    const result = await querySales({ search: 'NonExistentName' });
    
    expect(result.items).toEqual([]);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  test('should handle page beyond total pages', async () => {
    const result = await querySales({ page: 100, pageSize: 5 });
    
    expect(result.items).toEqual([]);
    expect(result.hasNextPage).toBe(false);
  });
});
