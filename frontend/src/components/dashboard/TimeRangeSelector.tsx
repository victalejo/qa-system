import { Calendar } from 'lucide-react'
import './TimeRangeSelector.css'

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

interface TimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
}

const ranges: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: '1y', label: '1 año' },
  { value: 'all', label: 'Todo' }
]

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="time-range-selector">
      <Calendar size={14} className="time-range-icon" />
      <div className="time-range-buttons">
        {ranges.map((range) => (
          <button
            key={range.value}
            className={`time-range-btn ${value === range.value ? 'active' : ''}`}
            onClick={() => onChange(range.value)}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimeRangeSelector
