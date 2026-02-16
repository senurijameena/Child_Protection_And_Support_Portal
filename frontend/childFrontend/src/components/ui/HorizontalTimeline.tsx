import React from 'react'
import './HorizontalTimeline.css'

export interface TimelineStep {
  id: string
  label: string
  status: 'completed' | 'active' | 'pending'
  date?: string
  description?: string
  icon?: string
}

interface HorizontalTimelineProps {
  steps: TimelineStep[]
  compact?: boolean
  showDates?: boolean
}

const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
  steps,
  compact = false,
  showDates = true,
}) => {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <div className={`horizontal-timeline ${compact ? 'compact' : ''}`}>
      <div className="timeline-track">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          const statusClass = `step-${step.status}`

          return (
            <React.Fragment key={step.id}>
              <div className={`timeline-step ${statusClass}`}>
                <div className="step-indicator">
                  <div className="step-dot">
                    {step.icon && <span className="step-icon">{step.icon}</span>}
                  </div>
                </div>
                <div className="step-content">
                  <div className="step-label">{step.label}</div>
                  {showDates && step.date && (
                    <div className="step-date">{step.date}</div>
                  )}
                  {step.description && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
              </div>

              {!isLast && (
                <div className={`timeline-connector ${statusClass}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default HorizontalTimeline
