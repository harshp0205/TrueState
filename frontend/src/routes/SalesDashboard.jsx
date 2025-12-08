import React, { useState } from 'react';
import { useSalesQuery } from '../hooks/useSalesQuery';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import SortDropdown from '../components/SortDropdown';
import TransactionsTable from '../components/TransactionsTable';
import PaginationControls from '../components/PaginationControls';
import './SalesDashboard.css';

function SalesDashboard() {
  // State management - all UI state
  const [search, setSearch] = useState('');
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedGenders, setSelectedGenders] = useState([]);
  const [ageRange, setAgeRange] = useState([null, null]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch data using the custom hook - backend handles ALL filtering, sorting, and pagination
  const { data, loading, error } = useSalesQuery({
    search,
    selectedRegions,
    selectedGenders,
    ageRange,
    selectedCategories,
    selectedTags,
    selectedPaymentMethods,
    dateRange,
    sortBy,
    sortOrder,
    page,
    pageSize,
  });

  // Handlers
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when search changes
  };

  const handleFiltersChange = (updatedFilters) => {
    // Update all filter states
    setSelectedRegions(updatedFilters.selectedRegions);
    setSelectedGenders(updatedFilters.selectedGenders);
    setAgeRange(updatedFilters.ageRange);
    setSelectedCategories(updatedFilters.selectedCategories);
    setSelectedTags(updatedFilters.selectedTags);
    setSelectedPaymentMethods(updatedFilters.selectedPaymentMethods);
    setDateRange(updatedFilters.dateRange);
    setPage(1); // Reset to first page when filters change
  };

  const handleSortChange = ({ sortBy: newSortBy, sortOrder: newSortOrder }) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sorting changes
  };

  const handlePageChange = (newPage) => {
    setPage(newPage); // Only update page, keep filters/search/sort
  };

  return (
    <div className="sales-dashboard">
      {/* Top: Search Bar */}
      <div className="dashboard-header">
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          onSubmit={() => setPage(1)}
        />
      </div>

      {/* Body: Left (Filters) + Right (Main Content) */}
      <div className="dashboard-body">
        {/* Left column: Filter Panel */}
        <FilterPanel
          filters={{
            selectedRegions,
            selectedGenders,
            ageRange,
            selectedCategories,
            selectedTags,
            selectedPaymentMethods,
            dateRange,
          }}
          onFiltersChange={handleFiltersChange}
        />

        {/* Right column: Sort, Table, Pagination */}
        <div className="dashboard-main">
          {/* Sort Dropdown */}
          <div className="sort-section">
            <SortDropdown
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChange={handleSortChange}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">Loading transactions...</div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-state">Error: {error}</div>
          )}

          {/* Invalid Range Warning */}
          {!loading && !error && data?.invalidRange && (
            <div className="warning-state">
              Invalid age range, please adjust filters.
            </div>
          )}

          {/* Content: Table + Pagination (only show when not loading/error) */}
          {!loading && !error && !data?.invalidRange && (
            <>
              {/* Results Summary */}
              {data?.totalItems > 0 && (
                <div className="results-summary">
                  Showing {data.items.length} of {data.totalItems} transactions
                </div>
              )}

              {/* Transactions Table - backend response is single source of truth */}
              <TransactionsTable items={data?.items || []} />

              {/* Pagination Controls */}
              {data?.totalPages > 1 && (
                <PaginationControls
                  page={data?.page || page}
                  totalPages={data?.totalPages || 1}
                  hasNextPage={!!data?.hasNextPage}
                  hasPrevPage={!!data?.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SalesDashboard;
