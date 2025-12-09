import { useState, useEffect, useRef } from 'react';
import { fetchSales } from '../services/api';

/**
 * Custom hook for querying sales data with filters, sorting, and pagination
 * @param {Object} options - Query options
 * @returns {Object} - { data, loading, error }
 */
export function useSalesQuery({
  search = '',
  selectedRegions = [],
  selectedGenders = [],
  ageRange = { min: undefined, max: undefined },
  selectedCategories = [],
  selectedTags = [],
  selectedPaymentMethods = [],
  dateRange = { from: '', to: '' },
  sortBy = 'date',
  sortOrder = 'desc',
  page = 1,
  pageSize = 10,
} = {}) {
  // State management
  const [data, setData] = useState({
    items: [],
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track abort controller for cancellation
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const loadSales = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build params object
        const params = {
          search,
          regions: selectedRegions,
          genders: selectedGenders,
          ageMin: ageRange.min,
          ageMax: ageRange.max,
          productCategories: selectedCategories,
          tags: selectedTags,
          paymentMethods: selectedPaymentMethods,
          dateFrom: dateRange.from,
          dateTo: dateRange.to,
          sortBy,
          sortOrder,
          page,
          pageSize,
        };

        // Fetch data
        const result = await fetchSales(params);
        
        // Only update state if request wasn't cancelled
        if (!abortControllerRef.current.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        // Only set error if request wasn't cancelled
        if (!abortControllerRef.current.signal.aborted) {
          // Handle different error types
          let errorMessage = 'Failed to load data';
          if (err.response) {
            // Server responded with error
            errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
          } else if (err.request) {
            // Request made but no response
            errorMessage = 'No response from server. Please check your connection.';
          } else {
            // Error in request setup
            errorMessage = err.message || 'An unexpected error occurred';
          }
          setError(errorMessage);
          console.error('Error loading sales:', err);
        }
      } finally {
        // Only update loading if request wasn't cancelled
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadSales();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [
    search,
    JSON.stringify(selectedRegions),
    JSON.stringify(selectedGenders),
    ageRange.min,
    ageRange.max,
    JSON.stringify(selectedCategories),
    JSON.stringify(selectedTags),
    JSON.stringify(selectedPaymentMethods),   
    dateRange.from,
    dateRange.to,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  return { data, loading, error };
}
