'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ResumeUploader from '@/components/ResumeUploader'
import { Sparkles, Target, TrendingUp, Map, ArrowRight, Zap, Shield, Globe } from 'lucide-react'

const FEATURES = [
  {
    icon: Target,
    title: 'AI Resume Parsing',
    description: 'Gemini AI extracts every skill, project, and experience from your resume with surgical precision.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.1)',
  },
  {
    icon: Globe,
    title: 'Real Job Search',
    description: 'Live job listings from LinkedIn, Indeed, Google Jobs — matched to your exact skill profile.',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
  },
  {
    icon: TrendingUp,
    title: 'Skill Match Score',
    description: 'See your compatibility percentage for each role. Know exactly where you stand before applying.',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.1)',
  },
  {
    icon: Map,
    title: 'Learning Roadmap',
    description: 'Personalized action plan: skills to learn, resources to use, and timeline to get job-ready.',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
  },
]

const STATS = [
  { value: '200+', label: 'Skills tracked' },
  { value: '10k+', label: 'Jobs searched' },
  { value: '< 60s', label: 'Full analysis' },
]

export default function HomePage() {
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback((file: File) => {
    setSelectedFile(file)
    setError(null)
  }, [])

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setIsAnalyzing(true)
    setError(null)

    try {
      // Parse resume
      const formData = new FormData()
      formData.append('resume', selectedFile)

      const parseRes = await fetch('/api/parse-resume', { method: 'POST', body: formData })
      if (!parseRes.ok) {
        const err = await parseRes.json()
        throw new Error(err.error ?? 'Failed to parse resume')
      }
      const resume = await parseRes.json()

      // Store in sessionStorage so analyze page can read it without re-parsing
      sessionStorage.setItem('ai_job_god_resume', JSON.stringify(resume))
      router.push('/analyze')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsAnalyzing(false)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(5,8,17,0.8)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--gradient-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AI Job God
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="glow-dot" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Powered by Gemini AI</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        flex: 1, paddingTop: 120, paddingBottom: 80,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: '120px 24px 80px',
      }}>
        <div className="animate-fade-in" style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 16px', borderRadius: 999,
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.25)',
            fontSize: '13px', fontWeight: 500, color: '#a5b4fc',
            marginBottom: 24,
          }}>
            <Sparkles size={13} />
            Not just an ATS checker — your AI career GPS
          </span>
        </div>

        <h1
          className="animate-slide-up"
          style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            maxWidth: 800,
            marginBottom: 24,
            animationDelay: '100ms',
            animationFillMode: 'both',
          }}
        >
          Your Resume,{' '}
          <span className="gradient-text">Decoded by AI</span>
        </h1>

        <p
          className="animate-slide-up"
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 48,
            animationDelay: '200ms',
            animationFillMode: 'both',
          }}
        >
          Upload your resume. We'll find real jobs matching your skills, show you exactly where you fall short, and build a personalized roadmap to get you hired.
        </p>

        {/* Stats */}
        <div
          className="animate-slide-up"
          style={{
            display: 'flex', gap: 40, marginBottom: 64,
            animationDelay: '300ms', animationFillMode: 'both',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Card */}
        <div
          className="glass-card-static animate-slide-up"
          style={{
            width: '100%', maxWidth: 560, padding: '32px',
            animationDelay: '400ms', animationFillMode: 'both',
            boxShadow: 'var(--shadow-glow)',
          }}
          id="upload-section"
        >
          <div style={{ marginBottom: 8 }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
              Upload Your Resume
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              PDF, DOC, or DOCX · Analyzed privately, never stored
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            <Shield size={12} color="#10b981" />
            <span style={{ fontSize: '12px', color: '#34d399' }}>100% private — processed on your request, never saved</span>
          </div>

          <ResumeUploader onUpload={handleUpload} disabled={isAnalyzing} />

          {error && (
            <div className="animate-fade-in" style={{
              marginTop: 12, padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, color: '#f87171', fontSize: '13px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn-primary"
            id="analyze-resume-btn"
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            style={{ width: '100%', marginTop: 16, justifyContent: 'center', fontSize: '15px', padding: '14px' }}
          >
            {isAnalyzing ? (
              <>
                <span className="animate-spin-slow" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Parsing Resume...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Analyze My Resume
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Not Your Boring <span className="gradient-text">ATS Checker</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: 480, margin: '0 auto' }}>
              We don't just scan keywords. We understand your career trajectory and build you a path forward.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {FEATURES.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.title}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    animationDelay: `${i * 100}ms`,
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: feat.bg,
                    border: `1px solid ${feat.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <Icon size={20} color={feat.color} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {feat.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px', borderTop: '1px solid var(--border-subtle)',
        textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        Built with Vercel AI SDK · Google Gemini · JSearch API · Next.js 16
      </footer>
    </main>
  )
}