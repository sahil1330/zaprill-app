import { google } from '@ai-sdk/google'
import { generateText, Output } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { normalizeSkillList } from '@/lib/skill-extractor'
import { hackclub } from '@/lib/hackClubClient'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import db from '@/db'
import { userProfile } from '@/db/schema'
import mammoth from 'mammoth'
import WordExtractor from 'word-extractor'

export const maxDuration = 60

const ResumeSchema = z.object({
  isResume: z.boolean().describe('Whether the provided content is actually a resume/CV'),
  name: z.string().describe('Full name of the candidate'),
  email: z.string().describe('Email address'),
  phone: z.string().optional().describe('Phone number if present'),
  location: z.string().optional().describe('City and State/Country of residence (e.g. "San Francisco, CA")'),
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
    
    const isDoc = file.name.endsWith('.doc')
    const isDocx = file.name.endsWith('.docx')
    const isPdf = file.name.endsWith('.pdf') || file.type === 'application/pdf'
    const isTxt = file.name.endsWith('.txt') || file.type === 'text/plain'

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
    const buffer = Buffer.from(arrayBuffer)
    
    let content: any[] = []
    
    if (isPdf) {
      content.push({
        type: 'file',
        data: new Uint8Array(arrayBuffer),
        mediaType: 'application/pdf',
      })
    } else {
      let extractedText = ''
      
      if (isDocx) {
        const result = await mammoth.extractRawText({ buffer })
        extractedText = result.value
      } else if (isDoc) {
        const extractor = new WordExtractor()
        const doc = await extractor.extract(buffer)
        extractedText = doc.getBody()
      } else if (isTxt) {
        extractedText = buffer.toString('utf-8')
      }
      
      if (!extractedText) {
        throw new Error('Could not extract text from file')
      }

      content.push({
        type: 'text',
        text: `RESUME CONTENT:\n${extractedText}`,
      })
    }

    content.push({
      type: 'text',
      text: `You are an expert HR analyst and resume parser. 

FIRST: Determine if the provided content is actually a resume or CV. If it is just random text, garbage data, a different type of document (like a cookbook, a general book, or a news article), or totally unreadable, set "isResume" to false.

IF IT IS A RESUME, extract ALL information with high accuracy. 

For skills, be comprehensive — include every programming language, framework, library, tool, database, cloud platform, and methodology mentioned anywhere in the resume.

For location, look for the candidate's current residence (City and State/Country).

For inferredJobTitles, think about what roles this person would realistically apply for based on their entire background — include 3-6 specific, searchable job titles (e.g., "Senior React Developer", "Full Stack Engineer", "Node.js Backend Developer").

Be precise and thorough. Do not make up information that isn't in the resume.`,
    })

    const { output: parsed, usage } = await generateText({
      model: hackclub('google/gemini-2.5-flash'),
      output: Output.object({ schema: ResumeSchema }),
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    })

    if (!parsed) {
      return NextResponse.json({ error: 'Failed to extract resume data' }, { status: 500 })
    }

    if (!parsed.isResume) {
      return NextResponse.json(
        { error: 'The uploaded file does not appear to be a valid resume. Please upload a PDF or Word document containing your professional history.' },
        { status: 400 }
      )
    }

    console.log("parse resume usage", usage)
    // Normalize and deduplicate skills across all sections
    const allSkills = normalizeSkillList([
      ...parsed.skills,
      ...parsed.experience.flatMap((e) => e.skillsUsed),
      ...parsed.projects.flatMap((p) => p.technologies),
    ])

    const finalResumeData = { ...parsed, skills: allSkills }

    // Save to user profile if authenticated
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session?.user) {
        await db
          .insert(userProfile)
          .values({
            id: crypto.randomUUID(),
            userId: session.user.id,
            resumeRaw: finalResumeData,
          })
          .onConflictDoUpdate({
            target: userProfile.userId,
            set: {
              resumeRaw: finalResumeData,
              updatedAt: new Date(),
            },
          });
      }
    } catch (saveErr) {
      console.error("Failed to save user profile:", saveErr);
      // We don't want to fail the whole parse if db save fails
    }

    return NextResponse.json(finalResumeData)
  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume. Please try again.' },
      { status: 500 }
    )
  }
}
