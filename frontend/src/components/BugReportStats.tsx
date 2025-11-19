import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../lib/api';
import './BugReportStats.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Stats {
  total: number;
  byStatus: {
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  bySeverity: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
  };
  topApplications: Array<{
    _id: string;
    count: number;
    name: string;
    version: string;
  }>;
}

interface TrendData {
  date: string;
  count: number;
}

const BugReportStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsResponse, trendsResponse] = await Promise.all([
        api.get('/bug-reports/stats/summary'),
        api.get('/bug-reports/stats/trends?days=30')
      ]);
      setStats(statsResponse.data);
      setTrends(trendsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner-large"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="stats-error">
        <p>{error || 'No se pudieron cargar las estadísticas'}</p>
        <button onClick={loadStats} className="btn btn-primary">
          Reintentar
        </button>
      </div>
    );
  }

  // Datos para gráfico de severidad
  const severityData = {
    labels: ['Crítica', 'Alta', 'Media', 'Baja'],
    datasets: [
      {
        label: 'Bugs por Severidad',
        data: [
          stats.bySeverity.critical || 0,
          stats.bySeverity.high || 0,
          stats.bySeverity.medium || 0,
          stats.bySeverity.low || 0
        ],
        backgroundColor: [
          'rgba(220, 53, 69, 0.8)',
          'rgba(253, 126, 20, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(40, 167, 69, 0.8)'
        ],
        borderColor: [
          'rgb(220, 53, 69)',
          'rgb(253, 126, 20)',
          'rgb(255, 193, 7)',
          'rgb(40, 167, 69)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Datos para gráfico de estado (dona)
  const statusData = {
    labels: ['Abiertos', 'En Progreso', 'Resueltos', 'Cerrados'],
    datasets: [
      {
        label: 'Bugs por Estado',
        data: [
          stats.byStatus.open,
          stats.byStatus.inProgress,
          stats.byStatus.resolved,
          stats.byStatus.closed
        ],
        backgroundColor: [
          'rgba(13, 202, 240, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(108, 117, 125, 0.8)'
        ],
        borderColor: [
          'rgb(13, 202, 240)',
          'rgb(255, 193, 7)',
          'rgb(40, 167, 69)',
          'rgb(108, 117, 125)'
        ],
        borderWidth: 3
      }
    ]
  };

  // Datos para gráfico de aplicaciones
  const appsData = {
    labels: stats.topApplications.map(app => `${app.name} v${app.version}`),
    datasets: [
      {
        label: 'Cantidad de Bugs',
        data: stats.topApplications.map(app => app.count),
        backgroundColor: 'rgba(74, 144, 226, 0.8)',
        borderColor: 'rgb(74, 144, 226)',
        borderWidth: 2,
        borderRadius: 8
      }
    ]
  };

  // Datos para gráfico de línea (tendencias)
  const trendsData = {
    labels: trends.map(t => {
      const date = new Date(t.date);
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Bugs Reportados',
        data: trends.map(t => t.count),
        borderColor: 'rgb(74, 144, 226)',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(74, 144, 226)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: 'rgb(74, 144, 226)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3
      }
    ]
  };

  // Opciones para gráfico de barras (severidad)
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Opciones para gráfico de dona
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: {
            size: 13,
            weight: '500' as const
          },
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  // Opciones para gráfico de barras horizontales
  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        ticks: {
          font: {
            size: 12,
            weight: '500' as const
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Opciones para gráfico de línea (tendencias)
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y || 0;
            return `${context.dataset.label}: ${value} bug${value !== 1 ? 's' : ''}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bug-stats">
      <h2 className="stats-title">Dashboard de Estadísticas</h2>

      {/* Resumen General */}
      <div className="stats-summary">
        <div className="stat-card total">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total de Bugs</h3>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card open">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Abiertos</h3>
            <p className="stat-value">{stats.byStatus.open}</p>
          </div>
        </div>

        <div className="stat-card in-progress">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>En Progreso</h3>
            <p className="stat-value">{stats.byStatus.inProgress}</p>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Resueltos</h3>
            <p className="stat-value">{stats.byStatus.resolved}</p>
          </div>
        </div>

        <div className="stat-card closed">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0110 0v4"></path>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Cerrados</h3>
            <p className="stat-value">{stats.byStatus.closed}</p>
          </div>
        </div>
      </div>

      {/* Gráficos con Chart.js */}
      <div className="stats-charts-grid">
        {/* Gráfico de Línea - Tendencia de Bugs */}
        {trends.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">
              <svg className="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              Tendencia de Bugs Reportados (Últimos 30 Días)
            </h3>
            <div className="chart-container">
              <Line data={trendsData} options={lineOptions} />
            </div>
          </div>
        )}

        {/* Gráfico de Barras - Bugs por Severidad */}
        <div className="chart-card">
          <h3 className="chart-title">
            <svg className="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Bugs por Severidad
          </h3>
          <div className="chart-container">
            <Bar data={severityData} options={barOptions} />
          </div>
        </div>

        {/* Gráfico de Dona - Bugs por Estado */}
        <div className="chart-card">
          <h3 className="chart-title">
            <svg className="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 2a10 10 0 0 1 10 10"></path>
            </svg>
            Distribución por Estado
          </h3>
          <div className="chart-container doughnut">
            <Doughnut data={statusData} options={doughnutOptions} />
          </div>
        </div>

        {/* Gráfico de Barras Horizontales - Top Aplicaciones */}
        {stats.topApplications.length > 0 && (
          <div className="chart-card full-width">
            <h3 className="chart-title">
              <svg className="chart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18v18H3zM9 3v18"></path>
                <path d="M3 9h18M3 15h18"></path>
              </svg>
              Top 5 Aplicaciones con Más Bugs
            </h3>
            <div className="chart-container horizontal">
              <Bar data={appsData} options={horizontalBarOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BugReportStats;
