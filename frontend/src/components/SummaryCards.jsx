import React from 'react';
import './SummaryCards.css';

function SummaryCards({ data }) {
  // Safe data extraction with fallbacks
  const items = data?.items || [];
  const totalUnits = data?.totalItems || 0;
  
  // Calculate total amount with safe number handling
  const totalAmount = items.reduce((sum, item) => {
    const amount = Number(item?.totalAmount || item?.finalAmount || 0);
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);
  
  // Calculate total discount: totalAmount - finalAmount for each item
  const totalDiscount = items.reduce((sum, item) => {
    const itemTotal = Number(item?.totalAmount || 0);
    const itemFinal = Number(item?.finalAmount || 0);
    const discountAmount = (isNaN(itemTotal) || isNaN(itemFinal)) ? 0 : (itemTotal - itemFinal);
    return sum + Math.max(0, discountAmount); // Ensure non-negative
  }, 0);
  
  const itemCount = items.length;

  return (
    <div className="summary-cards">
      <div className="summary-card">
        <div className="summary-label">
          Total units sold
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="info-icon">
            <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M8 7.5V11.5M8 5.5H8.005" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="summary-value">{itemCount}</div>
      </div>

      <div className="summary-card">
        <div className="summary-label">
          Total Amount
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="info-icon">
            <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M8 7.5V11.5M8 5.5H8.005" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="summary-value">
          ₹{totalAmount.toLocaleString('en-IN')} <span className="summary-count">({itemCount} SRs)</span>
        </div>
      </div>

      <div className="summary-card">
        <div className="summary-label">
          Total Discount
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="info-icon">
            <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.5"/>
            <path d="M8 7.5V11.5M8 5.5H8.005" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="summary-value">
          ₹{totalDiscount.toLocaleString('en-IN')} <span className="summary-count">({itemCount} SRs)</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
