import React from 'react';
import './FilterPanel.css';

function FilterPanel({ filters, onFiltersChange }) {
  const {
    selectedRegions = [],
    selectedGenders = [],
    ageRange = { min: null, max: null },
    selectedCategories = [],
    selectedTags = [],
    selectedPaymentMethods = [],
    dateRange = { from: '', to: '' },
  } = filters;

  // Multi-select toggle handler
  const toggleSelection = (field, value) => {
    const currentArray = filters[field] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [field]: newArray });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      selectedRegions: [],
      selectedGenders: [],
      ageRange: { min: null, max: null },
      selectedCategories: [],
      selectedTags: [],
      selectedPaymentMethods: [],
      dateRange: { from: '', to: '' },
    });
  };

  // Filter options
  const regions = ['Central', 'East', 'North', 'South', 'West'];
  const genders = ['Male', 'Female', 'Other'];
  const categories = ['Electronics', 'Beauty', 'Fashion', 'Home & Kitchen', 'Sports'];
  const tags = ['accessories', 'beauty', 'casual', 'cotton', 'fashion', 'formal', 'fragrance-free', 'gadgets', 'makeup', 'organic', 'portable', 'skincare', 'smart', 'unisex', 'wireless'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Cash', 'Net Banking'];

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2>Filters</h2>
        <button className="clear-btn" onClick={clearAllFilters}>
          Clear All
        </button>
      </div>

      {/* Customer Region */}
      <div className="filter-section">
        <h3>Customer Region</h3>
        {regions.map((region) => (
          <label key={region} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedRegions.includes(region)}
              onChange={() => toggleSelection('selectedRegions', region)}
            />
            <span>{region}</span>
          </label>
        ))}
      </div>

      {/* Gender */}
      <div className="filter-section">
        <h3>Gender</h3>
        {genders.map((gender) => (
          <label key={gender} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedGenders.includes(gender)}
              onChange={() => toggleSelection('selectedGenders', gender)}
            />
            <span>{gender}</span>
          </label>
        ))}
      </div>

      {/* Age Range */}
      <div className="filter-section">
        <h3>Age Range</h3>
        <div className="range-inputs">
          <input
            type="number"
            placeholder="Min"
            value={ageRange.min || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                ageRange: { ...ageRange, min: e.target.value ? parseInt(e.target.value) : null },
              })
            }
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={ageRange.max || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                ageRange: { ...ageRange, max: e.target.value ? parseInt(e.target.value) : null },
              })
            }
          />
        </div>
      </div>

      {/* Product Category */}
      <div className="filter-section">
        <h3>Product Category</h3>
        {categories.map((category) => (
          <label key={category} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => toggleSelection('selectedCategories', category)}
            />
            <span>{category}</span>
          </label>
        ))}
      </div>

      {/* Tags */}
      <div className="filter-section">
        <h3>Tags</h3>
        {tags.map((tag) => (
          <label key={tag} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => toggleSelection('selectedTags', tag)}
            />
            <span>{tag}</span>
          </label>
        ))}
      </div>

      {/* Payment Method */}
      <div className="filter-section">
        <h3>Payment Method</h3>
        {paymentMethods.map((method) => (
          <label key={method} className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedPaymentMethods.includes(method)}
              onChange={() => toggleSelection('selectedPaymentMethods', method)}
            />
            <span>{method}</span>
          </label>
        ))}
      </div>

      {/* Date Range */}
      <div className="filter-section">
        <h3>Date Range</h3>
        <div className="date-inputs">
          <label>
            From:
            <input
              type="date"
              value={dateRange.from || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...dateRange, from: e.target.value },
                })
              }
            />
          </label>
          <label>
            To:
            <input
              type="date"
              value={dateRange.to || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  dateRange: { ...dateRange, to: e.target.value },
                })
              }
            />
          </label>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
