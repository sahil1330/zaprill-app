'use client'

import { useState } from 'react'
import type { SkillGap, ParsedResume } from '@/types'
import SkillBadge from './SkillBadge'
import { TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface SkillGapPanelProps {
  resume: ParsedResume
  skillGaps: SkillGap[]
  totalJobs: number
}

function PriorityDot({ priority }: { priority: SkillGap['priority'] }) {
  const colors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#6b7280',
  }
  return (
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: colors[priority],
      flexShrink: 0,
      boxShadow: `0 0 6px ${colors[priority]}`,
      display: 'inline-block',
    }} />
  )
}

export default function SkillGapPanel({ resume, skillGaps, totalJobs }: SkillGapPanelProps) {
  const [showAllMissing, setShowAllMissing] = useState(false)
  const [showAllHave, setShowAllHave] = useState(false)

  const highPriority = skillGaps.filter((g) => g.priority === 'high')
  const mediumPriority = skillGaps.filter((g) => g.priority === 'medium')
  const lowPriority = skillGaps.filter((g) => g.priority === 'low')

  const LIMIT = 12
  const displayedGaps = showAllMissing ? skillGaps : skillGaps.slice(0, LIMIT)
  const displayedHave = showAllHave ? resume.skills : resume.skills.slice(0, LIMIT)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* LEFT: Skills You Have */}
      <div className="glass-card-static" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <CheckCircle2 size={16} color="#10b981" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              Skills You Have
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {resume.skills.length} skills detected
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {displayedHave.map((skill) => (
            <SkillBadge key={skill} skill={skill} variant="matched" size="sm" />
          ))}
        </div>

        {resume.skills.length > LIMIT && (
          <button
            className="btn-ghost"
            id="toggle-have-skills-btn"
            onClick={() => setShowAllHave(!showAllHave)}
            style={{ fontSize: '12px', padding: '5px 10px', width: '100%', justifyContent: 'center' }}
          >
            {showAllHave ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{resume.skills.length - LIMIT} more</>}
          </button>
        )}
      </div>

      {/* RIGHT: Skills You're Missing */}
      <div className="glass-card-static" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 0 }}>
              Skills to Learn
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {skillGaps.length} gaps across {totalJobs} jobs
            </p>
          </div>
        </div>

        {/* Priority breakdown */}
        {highPriority.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <PriorityDot priority="high" /> High priority
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {displayedGaps.filter(g => g.priority === 'high').map((g) => (
                <span key={g.skill} className="badge badge-danger" style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PriorityDot priority="high" />
                  {g.skill}
                  <span style={{ opacity: 0.6 }}>{g.frequency}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {mediumPriority.length > 0 && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <PriorityDot priority="medium" /> Medium priority
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {displayedGaps.filter(g => g.priority === 'medium').map((g) => (
                <span key={g.skill} className="badge badge-warning" style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <PriorityDot priority="medium" />
                  {g.skill}
                  <span style={{ opacity: 0.6 }}>{g.frequency}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {lowPriority.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <PriorityDot priority="low" /> Nice to have
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {displayedGaps.filter(g => g.priority === 'low').map((g) => (
                <span key={g.skill} className="badge badge-neutral" style={{ padding: '3px 8px', fontSize: '11px' }}>
                  {g.skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* "Trending" indicator */}
        {highPriority.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
            background: 'rgba(99,102,241,0.08)', borderRadius: 8,
            border: '1px solid rgba(99,102,241,0.15)',
            fontSize: '12px', color: '#a5b4fc',
          }}>
            <TrendingUp size={12} />
            Focus on high-priority skills — they appear in 50%+ of job listings
          </div>
        )}
      </div>
    </div>
  )
}
