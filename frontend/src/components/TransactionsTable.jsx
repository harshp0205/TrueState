import React from 'react';
import './TransactionsTable.css';

function TransactionsTable({ items = [] }) {
  // Format date as DD MMM YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (error) {
      return '-';
    }
  };

  // Format number with thousand separators
  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) return '-';
    try {
      return num.toLocaleString('en-IN');
    } catch (error) {
      return '-';
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="no-transactions">
        <p>📊 No transactions found</p>
        <p className="sub-text">Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="transactions-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Customer name</th>
            <th>Phone Number</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Product Category</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Customer region</th>
            <th>Product ID</th>
            <th>Employee name</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            // Safe accessor with fallbacks for missing fields
            const safeItem = item || {};
            return (
              <tr key={safeItem._id || index}>
                <td>{safeItem.transactionId || safeItem._id?.slice(-7) || '-'}</td>
                <td>{formatDate(safeItem.date)}</td>
                <td>{safeItem.customerId || '-'}</td>
                <td>{safeItem.customerName || '-'}</td>
                <td>
                  {safeItem.phoneNumber || '-'}
                  {safeItem.phoneNumber && (
                    <button className="copy-btn" title="Copy" onClick={() => navigator.clipboard?.writeText(safeItem.phoneNumber)}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M5 5V3.5C5 2.67157 5.67157 2 6.5 2H12.5C13.3284 2 14 2.67157 14 3.5V9.5C14 10.3284 13.3284 11 12.5 11H11M3.5 5H9.5C10.3284 5 11 5.67157 11 6.5V12.5C11 13.3284 10.3284 14 9.5 14H3.5C2.67157 14 2 13.3284 2 12.5V6.5C2 5.67157 2.67157 5 3.5 5Z" stroke="#6B7280" strokeWidth="1.5"/>
                      </svg>
                    </button>
                  )}
                </td>
                <td>{safeItem.gender || '-'}</td>
                <td>{safeItem.age !== undefined && safeItem.age !== null ? safeItem.age : '-'}</td>
                <td>{safeItem.productCategory || '-'}</td>
                <td>{formatNumber(safeItem.quantity)}</td>
                <td className="amount">₹ {formatNumber(safeItem.totalAmount || safeItem.finalAmount)}</td>
                <td>{safeItem.customerRegion || '-'}</td>
                <td>{safeItem.productId || '-'}</td>
                <td>{safeItem.employeeName || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionsTable;
