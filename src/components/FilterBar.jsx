import React from 'react';

export default function FilterBar({ 
  filterConfig,
  selectedFilters, 
  onFilterChange,
  searchKeyword,
  onSearchChange,
  onApply 
}) {
  if (!filterConfig) return null;

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      marginBottom: '30px'
    }}>
      <div style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
      }}>
        {/* Dynamic filter dropdowns */}
        {filterConfig.filters.map(filter => (
          <div key={filter.key} style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#133a5c',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              {filter.label}
            </label>
            <select
              value={selectedFilters[filter.key] || 'Tất cả'}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: '#fff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {filter.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        
        {/* Search box */}
        <div style={{ flex: '2', Width: '200px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            color: '#133a5c',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Tìm kiếm
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              🔍
            </span>
          </div>
        </div>
        
        {/* Apply button */}
        <button
          onClick={onApply}
          style={{
            padding: '10px 30px',
            background: '#4ba3d6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: '120px'
          }}
        >
          Áp dụng
        </button>
      </div>
      
      {/* Active filters display */}
      {(Object.values(selectedFilters).some(v => v !== 'Tất cả') || searchKeyword) && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f5f5f5',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#2d4a67'
        }}>
          <strong>Bộ lọc:</strong>{' '}
          {Object.entries(selectedFilters)
            .filter(([, value]) => value !== 'Tất cả')
            .map(([, value]) => value)
            .join(' • ')}
          {searchKeyword && ` • Từ khóa: "${searchKeyword}"`}
        </div>
      )}
    </div>
  );
}
