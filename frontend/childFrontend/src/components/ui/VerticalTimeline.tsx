import React from 'react'
import './VerticalTimeline.css'
import type { TimelineStep } from './HorizontalTimeline'

interface VerticalTimelineProps {
  steps: TimelineStep[]
  compact?: boolean
}

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({ steps, compact = false }) => {
  if (!steps || steps.length === 0) return null

  return (
    <div className={`vertical-timeline ${compact ? 'compact' : ''}`}>
      {steps.map((step, idx) => {
        const statusClass = `step-${step.status}`
        const isLast = idx === steps.length - 1

        return (
          <div key={step.id || idx} className={`vt-step ${statusClass}`}>
            <div className="vt-marker">
              <div className="vt-dot" />
              {!isLast && <div className="vt-line" />}
            </div>
            <div className="vt-content">
              <div className="vt-label fw-600">{step.label}</div>
              {step.date && <div className="vt-date small text-muted">{new Date(step.date).toLocaleString()}</div>}
              {step.description && <div className="vt-desc small text-muted">{step.description}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default VerticalTimeline
