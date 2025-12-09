import React from 'react';
import './SummaryCards.css';

function SummaryCards({ data }) {
  // Check if we have overall metrics (when filters are applied)
  const hasOverallMetrics = data?.overallMetrics;
  
  // Use overall metrics if available, otherwise calculate from current page items
  const totalUnits = hasOverallMetrics 
    ? data.overallMetrics.totalQuantity || 0
    : (data?.items || []).reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  
  const totalAmount = hasOverallMetrics
    ? data.overallMetrics.totalAmount || 0
    : (data?.items || []).reduce((sum, item) => {
        const amount = Number(item?.totalAmount || item?.finalAmount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
  
  const totalDiscount = hasOverallMetrics
    ? data.overallMetrics.totalDiscount || 0
    : (data?.items || []).reduce((sum, item) => {
        const itemTotal = Number(item?.totalAmount || 0);
        const itemFinal = Number(item?.finalAmount || 0);
        const discountAmount = (isNaN(itemTotal) || isNaN(itemFinal)) ? 0 : (itemTotal - itemFinal);
        return sum + Math.max(0, discountAmount);
      }, 0);
  
  // Total record count - use overall metrics count if available
  const recordCount = hasOverallMetrics 
    ? data.overallMetrics.totalRecords || 0
    : data?.totalItems || 0;

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
        <div className="summary-value">{totalUnits.toLocaleString('en-IN')}</div>
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
          ₹{totalAmount.toLocaleString('en-IN')} <span className="summary-count">({recordCount.toLocaleString('en-IN')} SRs)</span>
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
          ₹{totalDiscount.toLocaleString('en-IN')} <span className="summary-count">({recordCount.toLocaleString('en-IN')} SRs)</span>
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
