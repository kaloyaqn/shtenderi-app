import React from 'react';

const CashSelect = ({ value, onChange, options = [], className = '' }) => {
  return (
    <select
      className={`border rounded px-3 py-2 ${className}`}
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Изберете каса</option>
      {options.map(cash => (
        <option key={cash.id} value={cash.id}>{cash.name}</option>
      ))}
    </select>
  );
};

export default CashSelect; 