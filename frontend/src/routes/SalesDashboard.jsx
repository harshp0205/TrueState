import React, { useState } from 'react';
import { useSalesQuery } from '../hooks/useSalesQuery';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import SummaryCards from '../components/SummaryCards';
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
  const [selectedDateOption, setSelectedDateOption] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter options
  const regions = ['Central', 'East', 'North', 'South', 'West'];
  const genders = ['Male', 'Female'];
  const categories = ['Clothing', 'Electronics', 'Home & Garden', 'Beauty', 'Sports', 'Books'];
  const tags = ['accessories', 'beauty', 'casual', 'cotton', 'fashion', 'formal', 'fragrance-free', 'gadgets', 'makeup', 'organic', 'portable', 'skincare', 'smart', 'unisex', 'wireless'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Online Payment'];

  // Fetch data using the custom hook - backend handles ALL filtering, sorting, and pagination
  const { data, loading, error } = useSalesQuery({
    search,
    selectedRegions,
    selectedGenders,
    ageRange: { min: ageRange[0], max: ageRange[1] },
    selectedCategories,
    selectedTags,
    selectedPaymentMethods,
    dateRange: { from: dateRange[0], to: dateRange[1] },
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

  const handlePageChange = (newPage) => {
    setPage(newPage); // Only update page, keep filters/search/sort
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSelectedRegions([]);
    setSelectedGenders([]);
    setAgeRange([null, null]);
    setSelectedCategories([]);
    setSelectedTags([]);
    setSelectedPaymentMethods([]);
    setDateRange([null, null]);
    setSelectedDateOption([]);
    setPage(1);
  };

  const hasActiveFilters = selectedRegions.length > 0 || selectedGenders.length > 0 ||
    selectedCategories.length > 0 || selectedTags.length > 0 ||
    selectedPaymentMethods.length > 0 || ageRange[0] !== null || ageRange[1] !== null ||
    dateRange[0] !== null || dateRange[1] !== null;

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="sales-dashboard">
        {/* Top Bar */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Sales Management System</h1>
          <SearchBar
            value={search}
            onChange={handleSearchChange}
            onSubmit={() => setPage(1)}
          />
        </div>

      {/* Filters Row */}
      <div className="filters-row">
        <div className="filters-left">
          <button className="reset-button" onClick={clearAllFilters} title="Clear all filters">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 2L2 14M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          <FilterDropdown
            label="Region"
            options={regions}
            selected={selectedRegions}
            onChange={(values) => { setSelectedRegions(values); setPage(1); }}
            isMulti={true}
          />

          <FilterDropdown
            label="Gender"
            options={genders}
            selected={selectedGenders}
            onChange={(values) => { setSelectedGenders(values); setPage(1); }}
            isMulti={true}
          />

          <FilterDropdown
            label="Age Range"
            options={['18-25', '26-35', '36-45', '46-60', '60+']}
            selected={ageRange[0] !== null && ageRange[1] !== null ? 
              (ageRange[1] >= 100 ? [`${ageRange[0]}+`] : [`${ageRange[0]}-${ageRange[1]}`]) : []}
            isMulti={false}
            onChange={(values) => {
              if (values.length > 0) {
                const range = values[0];
                if (range.includes('+')) {
                  const min = parseInt(range.replace('+', ''));
                  setAgeRange([min, 100]);
                } else {
                  const [min, max] = range.split('-').map(v => parseInt(v));
                  setAgeRange([min, max]);
                }
              } else {
                setAgeRange([null, null]);
              }
              setPage(1);
            }}
          />

          <FilterDropdown
            label="Product Category"
            options={categories}
            selected={selectedCategories}
            onChange={(values) => { setSelectedCategories(values); setPage(1); }}
            isMulti={true}
          />

          <FilterDropdown
            label="Tags"
            options={tags}
            selected={selectedTags}
            onChange={(values) => { setSelectedTags(values); setPage(1); }}
            isMulti={true}
          />

          <FilterDropdown
            label="Payment Method"
            options={paymentMethods}
            selected={selectedPaymentMethods}
            onChange={(values) => { setSelectedPaymentMethods(values); setPage(1); }}
            isMulti={true}
          />

          <FilterDropdown
            label="Date"
            options={['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year', 'All Time']}
            selected={selectedDateOption}
            isMulti={false}
            onChange={(values) => {
              if (values.length > 0) {
                const option = values[0];
                setSelectedDateOption([option]);
                
                const now = new Date();
                let from = null;
                let to = now.toISOString().split('T')[0];
                
                if (option === 'Last 7 days') {
                  const date = new Date();
                  date.setDate(date.getDate() - 7);
                  from = date.toISOString().split('T')[0];
                } else if (option === 'Last 30 days') {
                  const date = new Date();
                  date.setDate(date.getDate() - 30);
                  from = date.toISOString().split('T')[0];
                } else if (option === 'Last 90 days') {
                  const date = new Date();
                  date.setDate(date.getDate() - 90);
                  from = date.toISOString().split('T')[0];
                } else if (option === 'This Year') {
                  from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
                } else if (option === 'All Time') {
                  from = null;
                  to = null;
                }
                
                setDateRange([from, to]);
              } else {
                setDateRange([null, null]);
                setSelectedDateOption([]);
              }
              setPage(1);
            }}
          />
        </div>

        <div className="filters-right">
          <div className="sort-dropdown-compact">
            <label>Sort by:</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                handleSortChange(field, order);
              }}
            >
              <option value="customerName-asc">Customer Name (A-Z)</option>
              <option value="customerName-desc">Customer Name (Z-A)</option>
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="quantity-desc">Quantity (High to Low)</option>
              <option value="quantity-asc">Quantity (Low to High)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">Loading transactions...</div>
        )}

          {/* Error State */}
          {error && (
            <div className="error-state">
              <strong>Error loading data:</strong> {error}
              <button 
                onClick={() => window.location.reload()} 
                style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
              >
                Retry
              </button>
            </div>
          )}          {/* Invalid Range Warning */}
          {!loading && !error && data?.invalidRange && (
            <div className="warning-state">
              ⚠️ Invalid filter combination detected. Please adjust your age range filter.
              <button 
                onClick={() => setAgeRange([null, null])} 
                style={{ marginLeft: '10px', padding: '4px 12px', cursor: 'pointer' }}
              >
                Clear Age Filter
              </button>
            </div>
          )}        {/* Content: Summary Cards + Table + Pagination */}
        {!loading && !error && !data?.invalidRange && (
          <>
            {/* Summary Cards */}
            <SummaryCards data={data} />

            {/* Transactions Table */}
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
