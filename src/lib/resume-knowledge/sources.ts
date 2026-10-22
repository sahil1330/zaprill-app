import type { KnowledgeSource } from "./types";

/** Sources retrieved 22 Oct 2026. The agent cites these ids, not the whole corpus. */
export const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: "harvard-gsas-2024",
    title: "Resumes and Cover Letters for Master's Students",
    publisher: "Harvard FAS Mignone Center for Career Success",
    url: "https://careerservices.fas.harvard.edu/resources/gsas-masters-resume-cover-letter/",
    retrieved: "2026-10-22",
  },
  {
    id: "harvard-college-verbs",
    title: "Harvard College Guide to Creating a Strong Resume",
    publisher: "Harvard FAS Mignone Center for Career Success",
    url: "https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/",
    retrieved: "2026-10-22",
  },
  {
    id: "harvard-phd-2024",
    title: "Resumes and Cover Letters for PhD Students",
    publisher: "Harvard Griffin GSAS / Mignone Center",
    url: "https://careerservices.fas.harvard.edu/resources/resumes-cover-letters-for-phd-students/",
    retrieved: "2026-10-22",
  },
  {
    id: "oxford-cvs",
    title: "CVs",
    publisher: "University of Oxford Careers Service",
    url: "https://www.careers.ox.ac.uk/cvs",
    retrieved: "2026-10-22",
  },
  {
    id: "oxford-academic",
    title: "Academic applications",
    publisher: "University of Oxford Careers Service",
    url: "https://www.ox.ac.uk/careers/careers-guidance/job-search-and-applications/writing-applications/academic-applications",
    retrieved: "2026-10-22",
  },
  {
    id: "stanford-beam",
    title: "Resume FAQs for Undergraduate and Master Students",
    publisher: "Stanford BEAM Career Education",
    url: "https://careered.stanford.edu/sites/g/files/sbiybj22801/files/media/file/resume_faqs_handout.pdf",
    retrieved: "2026-10-22",
  },
  {
    id: "usc-format",
    title: "Resume Format Guidelines",
    publisher: "USC Career Center",
    url: "https://careers.usc.edu/resources/resume-format-guidelines/",
    retrieved: "2026-10-22",
  },
  {
    id: "berkeley-ats",
    title: "Using Jobscan for Applicant Tracking Systems",
    publisher: "UC Berkeley School of Information",
    url: "https://www.ischool.berkeley.edu/careers/students/jobscan",
    retrieved: "2026-10-22",
  },
  {
    id: "greenhouse-parse",
    title: "Unsuccessful resume parse",
    publisher: "Greenhouse Support",
    url: "https://support.greenhouse.io/hc/en-us/articles/200989175-Unsuccessful-resume-parse",
    retrieved: "2026-10-22",
  },
  {
    id: "wharton-bullets",
    title: "General Resume Guidelines",
    publisher: "Wharton MBA Career Management",
    url: "https://students.mbacareers.wharton.upenn.edu/wp-content/uploads/2014/11/GeneralResumeGuidelines.pdf",
    retrieved: "2026-10-22",
  },
  {
    id: "wharton-industries",
    title: "Resume book training, industry excerpts",
    publisher: "Wharton MBA Career Management",
    url: "https://students.mbacareers.wharton.upenn.edu/wp-content/uploads/2018/09/2018-Resume-Tips-and-Resume-Book-Process-FINAL.pdf",
    retrieved: "2026-10-22",
  },
];

export function sourceById(id: string): KnowledgeSource | undefined {
  return KNOWLEDGE_SOURCES.find((source) => source.id === id);
}
