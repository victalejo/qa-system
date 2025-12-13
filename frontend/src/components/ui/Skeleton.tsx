import './Skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  animation?: 'wave' | 'pulse'
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  variant = 'text',
  animation = 'wave',
  className = '',
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Skeleton para texto con múltiples líneas
interface SkeletonTextProps {
  lines?: number
  lastLineWidth?: string
  className?: string
}

export function SkeletonText({ lines = 3, lastLineWidth = '60%', className = '' }: SkeletonTextProps) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height="0.875rem"
          variant="text"
        />
      ))}
    </div>
  )
}

// Skeleton para cards de aplicación
export function SkeletonAppCard() {
  return (
    <div className="skeleton-app-card">
      <Skeleton height={24} width="70%" variant="text" />
      <Skeleton height={16} width="100%" variant="text" />
      <Skeleton height={16} width="85%" variant="text" />
      <div className="skeleton-app-info">
        <Skeleton height={14} width="40%" variant="text" />
        <Skeleton height={14} width="50%" variant="text" />
      </div>
    </div>
  )
}

// Skeleton para filas de tabla
interface SkeletonTableRowProps {
  columns?: number
}

export function SkeletonTableRow({ columns = 5 }: SkeletonTableRowProps) {
  return (
    <tr className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index}>
          <Skeleton height={16} width={index === 0 ? '80%' : '60%'} variant="text" />
        </td>
      ))}
    </tr>
  )
}

// Skeleton para tabla completa
interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 5 }: SkeletonTableProps) {
  return (
    <table className="table skeleton-table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <Skeleton height={14} width="70%" variant="text" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  )
}

// Skeleton para stats/gráficos
export function SkeletonStats() {
  return (
    <div className="skeleton-stats">
      <div className="skeleton-stat-card">
        <Skeleton height={40} width={80} variant="text" />
        <Skeleton height={16} width="60%" variant="text" />
      </div>
      <div className="skeleton-stat-card">
        <Skeleton height={40} width={80} variant="text" />
        <Skeleton height={16} width="60%" variant="text" />
      </div>
      <div className="skeleton-stat-card">
        <Skeleton height={40} width={80} variant="text" />
        <Skeleton height={16} width="60%" variant="text" />
      </div>
      <div className="skeleton-chart">
        <Skeleton height={200} width="100%" variant="rounded" />
      </div>
    </div>
  )
}

export default Skeleton
