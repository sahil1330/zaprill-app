'use client'

import type { AnalysisStep } from '@/types'
import { CheckCircle, Loader, Circle } from 'lucide-react'

interface Step {
  key: AnalysisStep
  label: string
  description: string
}

const STEPS: Step[] = [
  { key: 'parsing', label: 'Parsing Resume', description: 'Gemini AI extracts your skills & experience' },
  { key: 'searching', label: 'Searching Jobs', description: 'Scanning thousands of real job listings' },
  { key: 'analyzing', label: 'Analyzing Gaps', description: 'Computing match scores & building roadmap' },
  { key: 'done', label: 'Done!', description: 'Your personalized career report is ready' },
]

const STEP_ORDER: AnalysisStep[] = ['idle', 'uploading', 'parsing', 'searching', 'analyzing', 'done']

function stepIndex(step: AnalysisStep): number {
  return STEP_ORDER.indexOf(step)
}

interface ProgressTimelineProps {
  currentStep: AnalysisStep
}

export default function ProgressTimeline({ currentStep }: ProgressTimelineProps) {
  const currentIdx = stepIndex(currentStep)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {STEPS.map((step, idx) => {
        const stepIdx = stepIndex(step.key)
        const isCompleted = currentIdx > stepIdx
        const isActive = currentIdx === stepIdx
        const isPending = currentIdx < stepIdx

        return (
          <div key={step.key} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isCompleted
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isActive
                  ? 'rgba(99, 102, 241, 0.15)'
                  : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${
                  isCompleted ? 'rgba(16,185,129,0.4)'
                  : isActive ? 'rgba(99,102,241,0.5)'
                  : 'var(--border-subtle)'
                }`,
                transition: 'all 0.4s ease',
              }}>
                {isCompleted ? (
                  <CheckCircle size={16} color="#10b981" />
                ) : isActive ? (
                  <Loader size={16} color="#a5b4fc" className="animate-spin-slow" />
                ) : (
                  <Circle size={16} color="var(--text-muted)" />
                )}
              </div>

              {/* Label */}
              <div>
                <p style={{
                  fontSize: '14px', fontWeight: isActive ? 600 : 500,
                  color: isCompleted ? '#10b981' : isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  marginBottom: 2,
                  transition: 'color 0.3s',
                }}>
                  {step.label}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {step.description}
                </p>
              </div>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div style={{
                width: 2, height: 28, marginLeft: 17,
                background: isCompleted
                  ? 'linear-gradient(to bottom, rgba(16,185,129,0.5), rgba(16,185,129,0.2))'
                  : 'var(--border-subtle)',
                transition: 'background 0.5s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
