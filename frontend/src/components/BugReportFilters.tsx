import React from 'react';
import './BugReportFilters.css';

interface Application {
  _id: string;
  name: string;
  version: string;
}

export interface FilterValues {
  search: string;
  severity: string[];
  status: string[];
  application: string;
  dateFrom: string;
  dateTo: string;
}

interface BugReportFiltersProps {
  filters: FilterValues;
  applications: Application[];
  onFilterChange: (filters: FilterValues) => void;
  onClear: () => void;
  resultsCount?: number;
}

const BugReportFilters: React.FC<BugReportFiltersProps> = ({
  filters,
  applications,
  onFilterChange,
  onClear,
  resultsCount
}) => {
  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleSeverityToggle = (severity: string) => {
    const newSeverity = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    onFilterChange({ ...filters, severity: newSeverity });
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleApplicationChange = (appId: string) => {
    onFilterChange({ ...filters, application: appId });
  };

  const handleDateFromChange = (date: string) => {
    onFilterChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: string) => {
    onFilterChange({ ...filters, dateTo: date });
  };

  const hasActiveFilters =
    filters.search ||
    filters.severity.length > 0 ||
    filters.status.length > 0 ||
    filters.application ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="bug-filters">
      {/* Búsqueda por texto */}
      <div className="filter-section search-section">
        <div className="search-box">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Buscar por título, descripción, errores..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
          {filters.search && (
            <button
              className="search-clear"
              onClick={() => handleSearchChange('')}
              title="Limpiar búsqueda"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-grid">
        {/* Severidad */}
        <div className="filter-section">
          <label className="filter-label">Severidad</label>
          <div className="filter-options">
            {[
              { value: 'low', label: 'Baja', color: '#28a745' },
              { value: 'medium', label: 'Media', color: '#ffc107' },
              { value: 'high', label: 'Alta', color: '#fd7e14' },
              { value: 'critical', label: 'Crítica', color: '#dc3545' }
            ].map((severity) => (
              <button
                key={severity.value}
                className={`filter-chip ${filters.severity.includes(severity.value) ? 'active' : ''}`}
                onClick={() => handleSeverityToggle(severity.value)}
                style={
                  filters.severity.includes(severity.value)
                    ? { backgroundColor: severity.color, color: 'white', borderColor: severity.color }
                    : {}
                }
              >
                {severity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Estado */}
        <div className="filter-section">
          <label className="filter-label">Estado</label>
          <div className="filter-options">
            {[
              { value: 'open', label: 'Abierto' },
              { value: 'in-progress', label: 'En Progreso' },
              { value: 'resolved', label: 'Resuelto' },
              { value: 'pending-test', label: 'Por Testear' },
              { value: 'closed', label: 'Cerrado' }
            ].map((status) => (
              <button
                key={status.value}
                className={`filter-chip ${filters.status.includes(status.value) ? 'active' : ''}`}
                onClick={() => handleStatusToggle(status.value)}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aplicación */}
        <div className="filter-section">
          <label htmlFor="app-filter" className="filter-label">Aplicación</label>
          <select
            id="app-filter"
            value={filters.application}
            onChange={(e) => handleApplicationChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las aplicaciones</option>
            {applications.map((app) => (
              <option key={app._id} value={app._id}>
                {app.name} v{app.version}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de fechas */}
        <div className="filter-section date-section">
          <label className="filter-label">Rango de Fechas</label>
          <div className="date-inputs">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleDateFromChange(e.target.value)}
              className="filter-date"
              placeholder="Desde"
            />
            <span className="date-separator">-</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleDateToChange(e.target.value)}
              className="filter-date"
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="filters-actions">
        <div className="results-count">
          {resultsCount !== undefined && (
            <span>
              <strong>{resultsCount}</strong> {resultsCount === 1 ? 'resultado' : 'resultados'}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button onClick={onClear} className="clear-filters-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Limpiar Filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default BugReportFilters;
