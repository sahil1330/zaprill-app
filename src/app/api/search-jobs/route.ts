import { NextResponse } from 'next/server'
import { extractSkillsFromText } from '@/lib/skill-extractor'
import type { JobListing } from '@/types'

export const maxDuration = 30

interface JSearchResult {
  job_id: string
  job_title: string
  employer_name: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_description: string
  job_apply_link: string
  job_salary_currency?: string
  job_min_salary?: number
  job_max_salary?: number
  job_employment_type?: string
  job_is_remote?: boolean
  job_posted_at_datetime_utc?: string
  job_publisher?: string
}

function buildSalaryString(result: JSearchResult): string | undefined {
  if (result.job_min_salary && result.job_max_salary) {
    const currency = result.job_salary_currency ?? 'USD'
    return `${currency} ${result.job_min_salary.toLocaleString()} – ${result.job_max_salary.toLocaleString()}`
  }
  return undefined
}

function buildLocation(result: JSearchResult): string {
  if (result.job_is_remote) return 'Remote'
  const parts = [result.job_city, result.job_state, result.job_country].filter(Boolean)
  return parts.join(', ') || 'Location not specified'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { skills, jobTitles, location } = body as {
      skills: string[]
      jobTitles: string[]
      location?: string
    }

    if (!skills?.length || !jobTitles?.length) {
      return NextResponse.json({ error: 'Skills and job titles are required' }, { status: 400 })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'JSearch API key not configured' }, { status: 500 })
    }

    // Build search queries: just search the role titles (skill matching is handled locally)
    const queries = jobTitles
      .slice(0, 3)
      .map((title) => `${title}${location ? ` in ${location}` : ''}`)

    const allJobs: JobListing[] = []
    const seenIds = new Set<string>()

    for (const query of queries) {
      try {
        const url = new URL('https://jsearch.p.rapidapi.com/search')
        url.searchParams.set('query', query)
        url.searchParams.set('num_pages', '2')
        url.searchParams.set('date_posted', 'month')
        url.searchParams.set('employment_types', 'FULLTIME,PARTTIME,CONTRACTOR')

        const res = await fetch(url.toString(), {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          },
        })

        const data = await res.json()

        if (!res.ok) {
          if (data.message === 'You are not subscribed to this API.') {
            return NextResponse.json(
              { error: 'API_SUBSCRIPTION_REQUIRED', details: 'You need to subscribe to the JSearch API on RapidAPI (it has a free tier).' },
              { status: 403 }
            )
          }
          console.error(`JSearch API error: ${res.status}`, data)
          continue
        }
        const results: JSearchResult[] = data?.data ?? []

        for (const result of results) {
          if (seenIds.has(result.job_id)) continue
          seenIds.add(result.job_id)

          // Extract skills from job description using our taxonomy
          const requiredSkills = extractSkillsFromText(result.job_description ?? '')

          allJobs.push({
            id: result.job_id,
            title: result.job_title,
            company: result.employer_name,
            location: buildLocation(result),
            description: result.job_description ?? '',
            requiredSkills,
            url: result.job_apply_link,
            salary: buildSalaryString(result),
            postedAt: result.job_posted_at_datetime_utc,
            employmentType: result.job_employment_type,
            isRemote: result.job_is_remote,
            publisher: result.job_publisher,
          })
        }
      } catch (err) {
        console.error(`Error fetching jobs for query "${query}":`, err)
      }
    }

    // Deduplicate by title+company as secondary filter
    const deduplicated = allJobs.filter((job, idx, arr) =>
      arr.findIndex(
        (j) => j.title === job.title && j.company === job.company
      ) === idx
    )

    return NextResponse.json({ jobs: deduplicated.slice(0, 40) })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json({ error: 'Failed to search jobs' }, { status: 500 })
  }
}
