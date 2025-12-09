import { SaleRecord } from '../models/saleRecord.js';

/**
 * Query sales records with filtering, sorting, and pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Paginated sales results
 */
export async function querySales(options = {}) {
  const {
    search,
    regions = [],
    genders = [],
    ageMin,
    ageMax,
    productCategories = [],
    tags = [],
    paymentMethods = [],
    dateFrom,
    dateTo,
    sortBy = 'date',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10
  } = options;

  // Input validation
  const validatedPage = Math.max(1, parseInt(page) || 1);
  const validatedPageSize = Math.min(100, Math.max(1, parseInt(pageSize) || 10)); // Cap at 100
  
  // Validate numeric ranges
  const validatedAgeMin = (ageMin !== undefined && ageMin !== null) ? Math.max(0, parseInt(ageMin)) : undefined;
  const validatedAgeMax = (ageMax !== undefined && ageMax !== null) ? Math.max(0, parseInt(ageMax)) : undefined;

  // Check for invalid age range
  if (validatedAgeMin !== undefined && validatedAgeMax !== undefined && validatedAgeMin > validatedAgeMax) {
    return {
      items: [],
      page: validatedPage,
      pageSize: validatedPageSize,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false,
      invalidRange: true,
      message: 'Invalid age range: minimum age cannot be greater than maximum age'
    };
  }

  // Build filter object
  const filter = {};

  // Validate and sanitize array filters (prevent too many filter items)
  const MAX_FILTER_ITEMS = 50;
  const sanitizeArray = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, MAX_FILTER_ITEMS).filter(item => 
      item !== null && item !== undefined && item !== ''
    );
  };

  // Search filter (customer name or phone number) with length limit
  if (search && typeof search === 'string') {
    const sanitizedSearch = search.trim().slice(0, 100); // Limit search length
    if (sanitizedSearch) {
      filter.$or = [
        { customerName: { $regex: sanitizedSearch, $options: 'i' } },
        { phoneNumber: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
  }

  // Region filter
  const sanitizedRegions = sanitizeArray(regions);
  if (sanitizedRegions.length > 0) {
    filter.customerRegion = { $in: sanitizedRegions };
  }

  // Gender filter
  const sanitizedGenders = sanitizeArray(genders);
  if (sanitizedGenders.length > 0) {
    filter.gender = { $in: sanitizedGenders };
  }

  // Age range filter
  if (validatedAgeMin !== undefined || validatedAgeMax !== undefined) {
    filter.age = {};
    if (validatedAgeMin !== undefined) {
      filter.age.$gte = validatedAgeMin;
    }
    if (validatedAgeMax !== undefined) {
      filter.age.$lte = validatedAgeMax;
    }
  }

  // Product category filter
  const sanitizedCategories = sanitizeArray(productCategories);
  if (sanitizedCategories.length > 0) {
    filter.productCategory = { $in: sanitizedCategories };
  }

  // Tags filter (matches if any selected tag exists)
  const sanitizedTags = sanitizeArray(tags);
  if (sanitizedTags.length > 0) {
    filter.tags = { $in: sanitizedTags };
  }

  // Payment method filter
  const sanitizedPaymentMethods = sanitizeArray(paymentMethods);
  if (sanitizedPaymentMethods.length > 0) {
    filter.paymentMethod = { $in: sanitizedPaymentMethods };
  }

  // Date range filter with validation
  if (dateFrom || dateTo) {
    filter.date = {};
    
    // Validate dates
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;
    
    // Check for invalid dates
    if (fromDate && isNaN(fromDate.getTime())) {
      return {
        items: [],
        page: validatedPage,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        invalidRange: true,
        message: 'Invalid start date format'
      };
    }
    
    if (toDate && isNaN(toDate.getTime())) {
      return {
        items: [],
        page: validatedPage,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        invalidRange: true,
        message: 'Invalid end date format'
      };
    }
    
    // Check for conflicting date range
    if (fromDate && toDate && fromDate > toDate) {
      return {
        items: [],
        page: validatedPage,
        pageSize: validatedPageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
        invalidRange: true,
        message: 'Invalid date range: start date cannot be after end date'
      };
    }
    
    if (fromDate) {
      filter.date.$gte = fromDate;
    }
    if (toDate) {
      filter.date.$lte = toDate;
    }
  }

  // Build sort object
  const sort = {};
  const order = sortOrder === 'asc' ? 1 : -1;
  
  // Validate sortBy field to prevent injection
  const validSortFields = ['date', 'quantity', 'customerName', 'totalAmount', 'age'];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'date';
  
  switch (safeSortBy) {
    case 'quantity':
      sort.quantity = order;
      break;
    case 'customerName':
      sort.customerName = order;
      break;
    case 'totalAmount':
      sort.totalAmount = order;
      break;
    case 'age':
      sort.age = order;
      break;
    case 'date':
    default:
      sort.date = order;
      break;
  }

  // Use validated pagination values
  const skip = (validatedPage - 1) * validatedPageSize;

  try {
    // Execute query with timeout protection
    const [items, totalItems] = await Promise.all([
      SaleRecord.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(validatedPageSize)
        .maxTimeMS(5000) // 5 second timeout for large queries
        .lean(),
      SaleRecord.countDocuments(filter).maxTimeMS(5000)
    ]);

    const totalPages = Math.ceil(totalItems / validatedPageSize);

    // Handle case where requested page exceeds total pages
    if (validatedPage > totalPages && totalPages > 0) {
      return {
        items: [],
        page: validatedPage,
        pageSize: validatedPageSize,
        totalItems,
        totalPages,
        hasNextPage: false,
        hasPrevPage: true,
        message: `Requested page ${validatedPage} exceeds total pages ${totalPages}`
      };
    }

    return {
      items,
      page: validatedPage,
      pageSize: validatedPageSize,
      totalItems,
      totalPages,
      hasNextPage: validatedPage < totalPages,
      hasPrevPage: validatedPage > 1
    };
  } catch (error) {
    console.error('Database query error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      throw new Error('Database query failed. Please try again or simplify your filters.');
    }
    
    throw error;
  }
}
