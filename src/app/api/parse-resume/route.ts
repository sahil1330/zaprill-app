import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeSkillList } from '@/lib/skill-extractor'
import { hackclub } from '@/lib/hackClubClient'

export const maxDuration = 60

const ResumeSchema = z.object({
  name: z.string().describe('Full name of the candidate'),
  email: z.string().describe('Email address'),
  phone: z.string().optional().describe('Phone number if present'),
  summary: z.string().optional().describe('Professional summary or objective'),
  skills: z
    .array(z.string())
    .describe('All technical and soft skills mentioned in the resume'),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      duration: z.string().optional(),
      description: z.string(),
      skillsUsed: z
        .array(z.string())
        .describe('Technologies or skills used in this role'),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number().optional(),
      field: z.string().optional(),
    })
  ),
  inferredJobTitles: z
    .array(z.string())
    .describe(
      'Job titles this candidate would be a good fit for based on their experience and skills'
    ),
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No resume file provided' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT' },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const mediaType = (file.type || 'application/pdf') as 'application/pdf'

    const { output: parsed } = await generateText({
      model: hackclub('gemini-3-flash'),
      output: Output.object({ schema: ResumeSchema }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'file',
              data: new Uint8Array(arrayBuffer),
              mediaType,
            },
            {
              type: 'text',
              text: `You are an expert HR analyst and resume parser. Extract ALL information from this resume with high accuracy.

For skills, be comprehensive — include every programming language, framework, library, tool, database, cloud platform, and methodology mentioned anywhere in the resume.

For inferredJobTitles, think about what roles this person would realistically apply for based on their entire background — include 3-6 specific, searchable job titles (e.g., "Senior React Developer", "Full Stack Engineer", "Node.js Backend Developer").

Be precise and thorough. Do not make up information that isn't in the resume.`,
            },
          ],
        },
      ],
    })

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to extract resume data' }, { status: 500 })
    }

    // Normalize and deduplicate skills across all sections
    const allSkills = normalizeSkillList([
      ...parsed.skills,
      ...parsed.experience.flatMap((e) => e.skillsUsed),
      ...parsed.projects.flatMap((p) => p.technologies),
    ])

    return NextResponse.json({ ...parsed, skills: allSkills })
  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume. Please try again.' },
      { status: 500 }
    )
  }
}
