import React, { useState, useRef, useEffect } from 'react';
import './FilterDropdown.css';

function FilterDropdown({ label, options, selected, onChange, isMulti = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value) => {
    if (isMulti) {
      const newSelected = selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value];
      onChange(newSelected);
    } else {
      // Single select mode
      if (selected.includes(value)) {
        onChange([]); // Deselect if already selected
      } else {
        onChange([value]); // Select only this one
      }
      setIsOpen(false);
    }
  };

  // Display text shows selected items for better UX
  const displayText = () => {
    if (selected.length === 0) return label;
    
    if (isMulti) {
      // For multi-select, show first item and count if more
      if (selected.length === 1) {
        return selected[0];
      } else {
        return `${selected[0]} +${selected.length - 1}`;
      }
    } else {
      // For single-select, show the selected item
      return selected[0];
    }
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className={`filter-dropdown-button ${selected.length > 0 ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={selected.length > 1 ? selected.join(', ') : ''}
      >
        <span>{displayText()}</span>
        <svg
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
        >
          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          {options.map((option) => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleToggle(option)}
              />
              <span className="checkbox-custom"></span>
              <span className="option-label">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
