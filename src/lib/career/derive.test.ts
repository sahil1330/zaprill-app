import assert from "node:assert/strict";
import test from "node:test";
import { deriveCareerDraft } from "@/lib/career/derive";
import { DEFAULT_RESUME_DATA, type ResumeData } from "@/types/resume";

const NOW = new Date("2026-06-15T00:00:00.000Z");

function resume(partial: {
  basics?: Partial<ResumeData["basics"]>;
  work?: ResumeData["work"];
  education?: ResumeData["education"];
  skills?: ResumeData["skills"];
  projects?: ResumeData["projects"];
  inferredJobTitles?: string[];
  totalYearsOfExperience?: number;
}): ResumeData {
  return {
    ...DEFAULT_RESUME_DATA,
    ...partial,
    basics: {
      ...DEFAULT_RESUME_DATA.basics,
      ...partial.basics,
      location: {
        ...DEFAULT_RESUME_DATA.basics.location,
        ...partial.basics?.location,
      },
    },
  };
}

test("empty resume does not invent a segment", () => {
  const draft = deriveCareerDraft({ resume: resume({}), now: NOW });
  assert.equal(draft.segment, null);
  assert.equal(draft.headline, null);
  assert.equal(draft.countryCode, "IN");
  assert.equal(draft.skills.length, 0);
  assert.equal(draft.targetRoles.length, 0);
});

test("ongoing education with no substantive work is a student", () => {
  const studying = deriveCareerDraft({
    resume: resume({
      education: [
        {
          id: "edu-1",
          institution: "IIT Bombay",
          url: "",
          area: "Computer Science",
          studyType: "B.Tech",
          startDate: "2024-08",
          endDate: null,
          score: "8.6 CGPA",
          courses: [],
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(studying.segment, "student");
  assert.equal(studying.academics[0]?.isCurrent, true);
  assert.equal(studying.academics[0]?.score, "8.6 CGPA");

  const internWhileStudying = deriveCareerDraft({
    resume: resume({
      education: [
        {
          id: "edu-1",
          institution: "IIT Bombay",
          url: "",
          area: "Computer Science",
          studyType: "B.Tech",
          startDate: "2024-08",
          endDate: "2027-05",
          score: "",
          courses: [],
        },
      ],
      work: [
        {
          id: "job-1",
          company: "Razorpay",
          position: "Product Intern",
          website: "",
          startDate: "2026-01",
          endDate: null,
          summary: "",
          highlights: [],
          location: "Bengaluru",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(internWhileStudying.segment, "student");
  assert.equal(internWhileStudying.experience[0]?.employmentType, "internship");
});

test("a finished degree or a post-college internship is a fresher", () => {
  const graduated = deriveCareerDraft({
    resume: resume({
      education: [
        {
          id: "edu-1",
          institution: "VJTI",
          url: "",
          area: "IT",
          studyType: "B.Tech",
          startDate: "2020-08",
          endDate: "2024-05",
          score: "",
          courses: [],
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(graduated.segment, "fresher");
  assert.equal(graduated.academics[0]?.isCurrent, false);

  const internAfter = deriveCareerDraft({
    resume: resume({
      education: [
        {
          id: "edu-1",
          institution: "VJTI",
          url: "",
          area: "IT",
          studyType: "B.Tech",
          startDate: "2020-08",
          endDate: "2024-05",
          score: "",
          courses: [],
        },
      ],
      work: [
        {
          id: "job-1",
          company: "Razorpay",
          position: "Product Intern",
          website: "",
          startDate: "2024-06",
          endDate: "2024-08",
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(internAfter.segment, "fresher");
});

test("undated full-time work with no year count stays a fresher", () => {
  const draft = deriveCareerDraft({
    resume: resume({
      work: [
        {
          id: "job-1",
          company: "Postman",
          position: "Software Engineer",
          website: "",
          startDate: "",
          endDate: null,
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(draft.segment, "fresher");
  assert.equal(draft.yearsOfExperience, null);
});

test("substantive work under 2 years is a fresher, then a professional", () => {
  const recent = deriveCareerDraft({
    resume: resume({
      totalYearsOfExperience: 1.4,
      work: [
        {
          id: "job-1",
          company: "Postman",
          position: "Software Engineer",
          website: "",
          startDate: "",
          endDate: null,
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(recent.segment, "fresher");
  assert.equal(recent.yearsOfExperience, 1.4);

  const stillEarly = deriveCareerDraft({
    resume: resume({
      totalYearsOfExperience: 1.9,
      work: [
        {
          id: "job-1",
          company: "Postman",
          position: "Software Engineer",
          website: "",
          startDate: "",
          endDate: null,
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(stillEarly.segment, "fresher");

  const established = deriveCareerDraft({
    resume: resume({
      totalYearsOfExperience: 2,
      work: [
        {
          id: "job-1",
          company: "Postman",
          position: "Software Engineer",
          website: "",
          startDate: "",
          endDate: null,
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(established.segment, "professional");

  const dated = deriveCareerDraft({
    resume: resume({
      work: [
        {
          id: "job-1",
          company: "Postman",
          position: "Software Engineer",
          website: "",
          startDate: "2026-01",
          endDate: null,
          summary: "",
          highlights: [],
          location: "Bengaluru",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(dated.segment, "fresher");
  assert.equal(dated.yearsOfExperience, 0.4);
  assert.equal(dated.experience[0]?.isCurrent, true);
});

test("part-time campus work does not turn a student into a professional", () => {
  const draft = deriveCareerDraft({
    resume: resume({
      education: [
        {
          id: "edu-1",
          institution: "IIT Bombay",
          url: "",
          area: "CSE",
          studyType: "B.Tech",
          startDate: "2024-08",
          endDate: null,
          score: "",
          courses: ["Data Structures"],
        },
      ],
      work: [
        {
          id: "job-1",
          company: "IIT Bombay",
          position: "Part-time Teaching Assistant",
          website: "",
          startDate: "2025-08",
          endDate: null,
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(draft.segment, "student");
  assert.equal(draft.experience[0]?.employmentType, "part_time");
});

test("calendar span is used when the resume has no explicit years", () => {
  const draft = deriveCareerDraft({
    resume: resume({
      work: [
        {
          id: "job-1",
          company: "A",
          position: "Engineer",
          website: "",
          startDate: "2020-01",
          endDate: "2021-01",
          summary: "",
          highlights: [],
          location: "",
        },
        {
          id: "job-2",
          company: "B",
          position: "Engineer",
          website: "",
          startDate: "2023-01",
          endDate: "2024-01",
          summary: "",
          highlights: [],
          location: "",
        },
      ],
    }),
    now: NOW,
  });
  assert.equal(draft.yearsOfExperience, 4);
  assert.equal(draft.segment, "professional");
});

test("skills keep levels and ignore prose false friends", () => {
  const draft = deriveCareerDraft({
    resume: resume({
      skills: [
        {
          id: "lang",
          name: "Languages",
          level: "Advanced",
          keywords: ["TypeScript", "Go", "Java"],
          category: "language",
        },
        {
          id: "front",
          name: "Frontend",
          level: "Intermediate",
          keywords: ["React"],
          category: "framework",
        },
      ],
      work: [
        {
          id: "job-1",
          company: "Acme",
          position: "Engineer",
          website: "",
          startDate: "2022-01",
          endDate: null,
          summary: "",
          highlights: [
            "Owned the go to market plan",
            "Built services in TypeScript",
          ],
          location: "",
        },
      ],
      projects: [
        {
          id: "proj-1",
          name: "Portal",
          description: "A JavaScript portal",
          highlights: [],
          url: "",
          githubUrl: "",
          startDate: "",
          endDate: null,
          keywords: ["React"],
        },
      ],
    }),
    now: NOW,
  });

  const names = draft.skills.map((skill) => skill.name).sort();
  assert.deepEqual(names, ["Go", "Java", "React", "TypeScript"]);

  const typescript = draft.skills.find((skill) => skill.name === "TypeScript");
  assert.equal(typescript?.level, "advanced");
  assert.equal(typescript?.category, "language");
  assert.ok(typescript?.evidence.some((item) => item.kind === "work"));

  const go = draft.skills.find((skill) => skill.name === "Go");
  assert.equal(
    go?.evidence.some((item) => item.kind === "work"),
    false,
  );

  const java = draft.skills.find((skill) => skill.name === "Java");
  assert.equal(
    java?.evidence.some((item) => item.kind === "project"),
    false,
  );

  const react = draft.skills.find((skill) => skill.name === "React");
  assert.equal(react?.level, "intermediate");
  assert.equal(react?.category, "framework");
  assert.ok(react?.evidence.some((item) => item.kind === "project"));
});

test("target roles are deduped and the saved target stays primary", () => {
  const draft = deriveCareerDraft({
    resume: resume({
      basics: {
        name: "Sahil Mane",
        label: "Sahil Mane",
        email: "",
        phone: "",
        url: "",
        summary: "",
        picture: null,
        profiles: [],
        location: { city: "Mumbai", region: "MH", countryCode: "India" },
      },
      inferredJobTitles: [
        "Backend Engineer",
        "backend engineer",
        "Senior Platform Engineer",
      ],
    }),
    targetRole: "Backend Engineer",
    now: NOW,
  });

  assert.equal(draft.headline, null);
  assert.equal(draft.city, "Mumbai");
  assert.equal(draft.countryCode, "IN");
  assert.deepEqual(
    draft.targetRoles.map((role) => [
      role.title,
      role.isPrimary,
      role.seniority,
    ]),
    [
      ["Backend Engineer", true, "unspecified"],
      ["Senior Platform Engineer", false, "senior"],
    ],
  );
});
