'use client'

import { useState } from 'react'
import type { RoadmapItem } from '@/types'
import { Clock, ExternalLink, ChevronDown, ChevronUp, BookOpen, Video, Code2, FileText, Dumbbell } from 'lucide-react'

interface LearningRoadmapProps {
  roadmap: RoadmapItem[]
}

const PRIORITY_STYLES = {
  high: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#f87171', label: 'High Priority' },
  medium: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#fbbf24', label: 'Medium' },
  low: { bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)', color: '#9ca3af', label: 'Nice to have' },
}

const RESOURCE_ICONS = {
  course: Video,
  book: BookOpen,
  tutorial: FileText,
  documentation: Code2,
  practice: Dumbbell,
}

function RoadmapCard({ item, index }: { item: RoadmapItem; index: number }) {
  const [expanded, setExpanded] = useState(index < 2)
  const style = PRIORITY_STYLES[item.priority]

  return (
    <div
      className="glass-card-static"
      style={{
        padding: 0, overflow: 'hidden',
        border: `1px solid ${expanded ? style.border : 'var(--border-subtle)'}`,
        transition: 'border-color 0.3s',
      }}
      id={`roadmap-item-${index}`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', padding: '16px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
        id={`roadmap-toggle-${index}`}
        aria-expanded={expanded}
      >
        {/* Step number */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: style.bg, border: `1px solid ${style.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 700, color: style.color,
        }}>
          {index + 1}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {item.skill}
            </span>
            <span style={{
              fontSize: '11px', padding: '2px 7px', borderRadius: 999,
              background: style.bg, border: `1px solid ${style.border}`,
              color: style.color, fontWeight: 500,
            }}>
              {style.label}
            </span>
          </div>
          <div style={{ display: 'flex', align: 'center', gap: 12, fontSize: '12px', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {item.estimatedTime}
            </span>
            <span>·</span>
            <span>{item.resources.length} resources</span>
          </div>
        </div>

        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Why */}
          <p style={{
            fontSize: '13px', color: 'var(--text-secondary)',
            lineHeight: 1.6, padding: '12px 0',
          }}>
            💡 {item.why}
          </p>

          {/* Resources */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {item.resources.map((res, i) => {
              const Icon = RESOURCE_ICONS[res.type] ?? FileText
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: 'rgba(99,102,241,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={13} color="#a5b4fc" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>
                      {res.name}
                    </p>
                    <div style={{ display: 'flex', gap: 8, fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span style={{ textTransform: 'capitalize' }}>{res.type}</span>
                      {res.estimatedTime && <span>· {res.estimatedTime}</span>}
                      <span style={{ color: res.free ? '#34d399' : '#a5b4fc' }}>
                        · {res.free ? '🆓 Free' : '💳 Paid'}
                      </span>
                    </div>
                  </div>
                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`resource-link-${index}-${i}`}
                      style={{ color: 'var(--text-muted)', transition: 'color 0.2s', flexShrink: 0 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LearningRoadmap({ roadmap }: LearningRoadmapProps) {
  if (!roadmap.length) return null

  const sorted = [...roadmap].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {sorted.map((item, idx) => (
        <RoadmapCard key={item.skill} item={item} index={idx} />
      ))}
    </div>
  )
}
