import type { Answers } from "./types";

export type JobProfile = {
  title: string;
  category: string;
  rationale: string;
  answers: Answers;
};

type TemplateKey =
  | "routine-admin"
  | "structured-specialist"
  | "strategic-leader"
  | "technical-expert"
  | "adaptive-tech"
  | "creative-role"
  | "relationship-advisor"
  | "balanced-generalist"
  | "systems-thinker"
  | "field-specialist"
  | "routine-sales"
  | "public-service"
  | "research-analyst";

type ProfileTemplate = {
  rationale: string;
  answers: Answers;
};

type ProfileGroup = {
  category: string;
  template: TemplateKey;
  titles: string[];
};

const PROFILE_TEMPLATES: Record<TemplateKey, ProfileTemplate> = {
  "routine-admin": {
    rationale:
      "High routine workload with structured execution and increasing automation pressure.",
    answers: {
      "repetitive-tasks": 90,
      "human-interaction": 45,
      creativity: 20,
      "strategic-decision": 20,
      "specialized-expertise": 45,
      "ai-capable-today": 85,
      "trust-relationships": 40,
      "industry-change": 65,
      adaptability: 50,
      "personal-judgment": 30,
    },
  },
  "structured-specialist": {
    rationale:
      "Process-oriented specialist work with meaningful expertise and moderate strategic interpretation.",
    answers: {
      "repetitive-tasks": 70,
      "human-interaction": 70,
      creativity: 30,
      "strategic-decision": 45,
      "specialized-expertise": 70,
      "ai-capable-today": 65,
      "trust-relationships": 60,
      "industry-change": 65,
      adaptability: 50,
      "personal-judgment": 60,
    },
  },
  "strategic-leader": {
    rationale:
      "Leadership-heavy role with high strategic scope, high trust dependence, and strong contextual judgment.",
    answers: {
      "repetitive-tasks": 40,
      "human-interaction": 95,
      creativity: 60,
      "strategic-decision": 95,
      "specialized-expertise": 70,
      "ai-capable-today": 40,
      "trust-relationships": 90,
      "industry-change": 65,
      adaptability: 75,
      "personal-judgment": 90,
    },
  },
  "technical-expert": {
    rationale:
      "Deep technical expertise and judgment with moderate routine load and lower direct automation replacement.",
    answers: {
      "repetitive-tasks": 50,
      "human-interaction": 45,
      creativity: 50,
      "strategic-decision": 70,
      "specialized-expertise": 95,
      "ai-capable-today": 40,
      "trust-relationships": 50,
      "industry-change": 65,
      adaptability: 75,
      "personal-judgment": 90,
    },
  },
  "adaptive-tech": {
    rationale:
      "Technology-forward role with high adaptability in fast-changing AI environments.",
    answers: {
      "repetitive-tasks": 50,
      "human-interaction": 70,
      creativity: 60,
      "strategic-decision": 70,
      "specialized-expertise": 70,
      "ai-capable-today": 65,
      "trust-relationships": 60,
      "industry-change": 90,
      adaptability: 95,
      "personal-judgment": 80,
    },
  },
  "creative-role": {
    rationale:
      "Creativity-led role with high ideation demand and substantial AI acceleration in production workflows.",
    answers: {
      "repetitive-tasks": 40,
      "human-interaction": 70,
      creativity: 100,
      "strategic-decision": 70,
      "specialized-expertise": 45,
      "ai-capable-today": 65,
      "trust-relationships": 60,
      "industry-change": 90,
      adaptability: 75,
      "personal-judgment": 70,
    },
  },
  "relationship-advisor": {
    rationale:
      "Relationship-intensive advisory work where trust, communication, and contextual judgment are core.",
    answers: {
      "repetitive-tasks": 50,
      "human-interaction": 95,
      creativity: 60,
      "strategic-decision": 70,
      "specialized-expertise": 70,
      "ai-capable-today": 40,
      "trust-relationships": 90,
      "industry-change": 65,
      adaptability: 75,
      "personal-judgment": 90,
    },
  },
  "balanced-generalist": {
    rationale:
      "Generalist profile with mixed routines, moderate strategy, and balanced human and technical demands.",
    answers: {
      "repetitive-tasks": 60,
      "human-interaction": 70,
      creativity: 50,
      "strategic-decision": 45,
      "specialized-expertise": 45,
      "ai-capable-today": 40,
      "trust-relationships": 70,
      "industry-change": 40,
      adaptability: 50,
      "personal-judgment": 60,
    },
  },
  "systems-thinker": {
    rationale:
      "System-level role with high expertise and judgment, lower interpersonal centrality, and architecture focus.",
    answers: {
      "repetitive-tasks": 60,
      "human-interaction": 20,
      creativity: 40,
      "strategic-decision": 70,
      "specialized-expertise": 95,
      "ai-capable-today": 40,
      "trust-relationships": 40,
      "industry-change": 65,
      adaptability: 50,
      "personal-judgment": 90,
    },
  },
  "field-specialist": {
    rationale:
      "Hands-on practical role where applied expertise and in-situ judgment matter more than AI substitution.",
    answers: {
      "repetitive-tasks": 60,
      "human-interaction": 45,
      creativity: 40,
      "strategic-decision": 45,
      "specialized-expertise": 70,
      "ai-capable-today": 15,
      "trust-relationships": 50,
      "industry-change": 40,
      adaptability: 50,
      "personal-judgment": 70,
    },
  },
  "routine-sales": {
    rationale:
      "High-volume customer-facing work with repetitive patterns and increasing AI augmentation.",
    answers: {
      "repetitive-tasks": 70,
      "human-interaction": 70,
      creativity: 50,
      "strategic-decision": 45,
      "specialized-expertise": 45,
      "ai-capable-today": 65,
      "trust-relationships": 80,
      "industry-change": 65,
      adaptability: 75,
      "personal-judgment": 60,
    },
  },
  "public-service": {
    rationale:
      "Public and social service role with high trust requirements and materially lower direct automation replacement.",
    answers: {
      "repetitive-tasks": 60,
      "human-interaction": 95,
      creativity: 50,
      "strategic-decision": 45,
      "specialized-expertise": 70,
      "ai-capable-today": 15,
      "trust-relationships": 90,
      "industry-change": 40,
      adaptability: 50,
      "personal-judgment": 80,
    },
  },
  "research-analyst": {
    rationale:
      "Research-heavy role with synthesis and judgment demands, plus moderate AI acceleration in analysis workflows.",
    answers: {
      "repetitive-tasks": 50,
      "human-interaction": 45,
      creativity: 60,
      "strategic-decision": 70,
      "specialized-expertise": 70,
      "ai-capable-today": 40,
      "trust-relationships": 50,
      "industry-change": 65,
      adaptability: 75,
      "personal-judgment": 80,
    },
  },
};

const PROFILE_GROUPS: ProfileGroup[] = [
  {
    category: "finance/accounting",
    template: "routine-admin",
    titles: [
      "Accounts Payable Specialist",
      "Accounts Receivable Specialist",
      "Bookkeeper",
      "Payroll Specialist",
    ],
  },
  {
    category: "finance/accounting",
    template: "structured-specialist",
    titles: [
      "Tax Accountant",
      "Audit Associate",
      "Budget Analyst",
      "Treasury Analyst",
      "Credit Analyst",
      "Revenue Operations Analyst",
    ],
  },
  {
    category: "finance/accounting",
    template: "strategic-leader",
    titles: [
      "Financial Controller",
      "Finance Manager",
      "FP&A Manager",
      "Risk Manager",
    ],
  },

  {
    category: "legal/compliance",
    template: "routine-admin",
    titles: ["Legal Secretary", "Compliance Analyst", "Contract Administrator"],
  },
  {
    category: "legal/compliance",
    template: "structured-specialist",
    titles: [
      "Contract Paralegal",
      "Litigation Paralegal",
      "Regulatory Compliance Officer",
      "Corporate Governance Analyst",
      "Privacy Compliance Specialist",
    ],
  },
  {
    category: "legal/compliance",
    template: "strategic-leader",
    titles: [
      "Corporate Lawyer",
      "Employment Lawyer",
      "General Counsel",
      "Chief Compliance Officer",
    ],
  },

  {
    category: "software/technology",
    template: "routine-admin",
    titles: [
      "Junior QA Tester",
      "Manual Test Analyst",
      "Technical Support Specialist",
      "Implementation Specialist",
      "IT Helpdesk Analyst",
    ],
  },
  {
    category: "software/technology",
    template: "adaptive-tech",
    titles: [
      "Senior Software Engineer",
      "DevOps Engineer",
      "Site Reliability Engineer",
      "Cloud Engineer",
      "Cybersecurity Engineer",
      "Solutions Architect",
    ],
  },
  {
    category: "software/technology",
    template: "systems-thinker",
    titles: [
      "Database Administrator",
      "Platform Engineer",
      "Infrastructure Engineer",
      "Enterprise Architect",
      "Embedded Systems Engineer",
    ],
  },

  {
    category: "AI/data",
    template: "structured-specialist",
    titles: [
      "Data Annotation Specialist",
      "BI Reporting Analyst",
      "SQL Analyst",
      "Data Quality Analyst",
    ],
  },
  {
    category: "AI/data",
    template: "adaptive-tech",
    titles: [
      "Machine Learning Engineer",
      "Data Scientist",
      "AI Product Analyst",
      "MLOps Engineer",
    ],
  },
  {
    category: "AI/data",
    template: "research-analyst",
    titles: [
      "AI Research Scientist",
      "Applied Scientist",
      "Quantitative Researcher",
      "Computer Vision Engineer",
    ],
  },

  {
    category: "management/leadership",
    template: "relationship-advisor",
    titles: [
      "Project Manager",
      "Program Manager",
      "Operations Manager",
      "Customer Operations Manager",
      "Retail Store Manager",
    ],
  },
  {
    category: "management/leadership",
    template: "strategic-leader",
    titles: [
      "Product Manager",
      "Director of Operations",
      "Chief of Staff",
      "Strategy Manager",
      "Business Unit Director",
    ],
  },
  {
    category: "management/leadership",
    template: "balanced-generalist",
    titles: [
      "Team Lead",
      "Office Manager",
      "Service Delivery Manager",
      "Practice Manager",
    ],
  },

  {
    category: "healthcare",
    template: "relationship-advisor",
    titles: [
      "Registered Nurse",
      "Primary Care Physician",
      "Physical Therapist",
      "Occupational Therapist",
      "Clinical Social Worker",
    ],
  },
  {
    category: "healthcare",
    template: "technical-expert",
    titles: [
      "Radiologist",
      "Pharmacist",
      "Clinical Laboratory Scientist",
      "Anesthesiologist",
    ],
  },
  {
    category: "healthcare",
    template: "balanced-generalist",
    titles: [
      "Medical Coder",
      "Health Information Manager",
      "Care Coordinator",
      "Nurse Practitioner",
      "Public Health Nurse",
    ],
  },

  {
    category: "education",
    template: "relationship-advisor",
    titles: [
      "High School Teacher",
      "Elementary Teacher",
      "Special Education Teacher",
      "Academic Advisor",
    ],
  },
  {
    category: "education",
    template: "creative-role",
    titles: [
      "Instructional Designer",
      "Curriculum Designer",
      "Learning Experience Designer",
      "Educational Content Developer",
    ],
  },
  {
    category: "education",
    template: "balanced-generalist",
    titles: [
      "University Lecturer",
      "School Principal",
      "Corporate Trainer",
      "Education Program Manager",
    ],
  },

  {
    category: "skilled trades",
    template: "routine-admin",
    titles: [
      "CNC Machinist",
      "Assembly Line Operator",
      "Warehouse Equipment Operator",
      "Quality Inspection Technician",
    ],
  },
  {
    category: "skilled trades",
    template: "field-specialist",
    titles: [
      "Electrician",
      "HVAC Technician",
      "Plumber",
      "Automotive Technician",
    ],
  },
  {
    category: "skilled trades",
    template: "technical-expert",
    titles: [
      "Tool and Die Maker",
      "Instrumentation Technician",
      "Maintenance Technician",
      "Field Service Technician",
    ],
  },

  {
    category: "engineering/manufacturing",
    template: "systems-thinker",
    titles: [
      "Mechanical Engineer",
      "Electrical Engineer",
      "Civil Engineer",
      "Process Engineer",
      "Manufacturing Engineer",
    ],
  },
  {
    category: "engineering/manufacturing",
    template: "technical-expert",
    titles: [
      "Quality Engineer",
      "Reliability Engineer",
      "Control Systems Engineer",
      "Industrial Engineer",
      "Hardware Engineer",
    ],
  },
  {
    category: "engineering/manufacturing",
    template: "adaptive-tech",
    titles: [
      "Automation Engineer",
      "Robotics Engineer",
      "Digital Twin Engineer",
      "Manufacturing Data Engineer",
    ],
  },

  {
    category: "sales/customer success",
    template: "relationship-advisor",
    titles: [
      "Account Executive",
      "Customer Success Manager",
      "Enterprise Account Manager",
      "Solutions Consultant",
    ],
  },
  {
    category: "sales/customer success",
    template: "routine-sales",
    titles: [
      "Sales Development Representative",
      "Inside Sales Representative",
      "Sales Operations Coordinator",
      "Lead Generation Specialist",
    ],
  },
  {
    category: "sales/customer success",
    template: "strategic-leader",
    titles: [
      "Sales Manager",
      "Partnerships Manager",
      "Channel Manager",
      "Customer Success Director",
    ],
  },

  {
    category: "marketing/creative",
    template: "creative-role",
    titles: [
      "Graphic Designer",
      "Marketing Copywriter",
      "Content Strategist",
      "Brand Designer",
      "Video Producer",
    ],
  },
  {
    category: "marketing/creative",
    template: "adaptive-tech",
    titles: [
      "Digital Marketing Manager",
      "SEO Specialist",
      "Performance Marketing Analyst",
      "Marketing Automation Manager",
      "Social Media Strategist",
    ],
  },
  {
    category: "marketing/creative",
    template: "strategic-leader",
    titles: [
      "Creative Director",
      "Brand Manager",
      "Communications Director",
      "Product Marketing Manager",
    ],
  },

  {
    category: "HR/people operations",
    template: "relationship-advisor",
    titles: [
      "HR Generalist",
      "Talent Acquisition Partner",
      "People Operations Manager",
    ],
  },
  {
    category: "HR/people operations",
    template: "structured-specialist",
    titles: [
      "HR Analyst",
      "Payroll HR Specialist",
      "Compensation Analyst",
      "Learning and Development Specialist",
    ],
  },
  {
    category: "HR/people operations",
    template: "strategic-leader",
    titles: [
      "HR Business Partner",
      "Head of People",
      "Organizational Development Manager",
    ],
  },

  {
    category: "operations/logistics",
    template: "routine-admin",
    titles: [
      "Logistics Coordinator",
      "Supply Chain Planner",
      "Dispatch Coordinator",
      "Inventory Planner",
      "Procurement Analyst",
    ],
  },
  {
    category: "operations/logistics",
    template: "balanced-generalist",
    titles: [
      "Procurement Specialist",
      "Warehouse Manager",
      "Distribution Manager",
      "Fleet Manager",
      "Operations Coordinator",
    ],
  },
  {
    category: "operations/logistics",
    template: "strategic-leader",
    titles: [
      "Supply Chain Manager",
      "Procurement Manager",
      "Director of Logistics",
      "Fulfillment Operations Manager",
    ],
  },

  {
    category: "administration/support",
    template: "routine-admin",
    titles: [
      "Data Entry Clerk",
      "Administrative Assistant",
      "Receptionist",
      "Scheduling Coordinator",
    ],
  },
  {
    category: "administration/support",
    template: "relationship-advisor",
    titles: [
      "Executive Assistant",
      "Client Services Coordinator",
      "Office Administrator",
    ],
  },
  {
    category: "administration/support",
    template: "balanced-generalist",
    titles: [
      "Case Management Assistant",
      "Project Coordinator",
      "Documentation Specialist",
    ],
  },

  {
    category: "science/research",
    template: "systems-thinker",
    titles: [
      "Research Engineer",
      "Laboratory Research Scientist",
      "Biostatistician",
      "Materials Scientist",
    ],
  },
  {
    category: "science/research",
    template: "technical-expert",
    titles: [
      "Clinical Research Associate",
      "Research Data Manager",
      "Environmental Scientist",
    ],
  },
  {
    category: "science/research",
    template: "research-analyst",
    titles: [
      "Behavioral Scientist",
      "Policy Research Analyst",
      "UX Researcher",
    ],
  },

  {
    category: "public sector/social work",
    template: "public-service",
    titles: [
      "Social Worker",
      "Case Worker",
      "Community Outreach Coordinator",
      "School Counselor",
    ],
  },
  {
    category: "public sector/social work",
    template: "balanced-generalist",
    titles: [
      "Policy Analyst",
      "Public Administration Officer",
      "Emergency Management Coordinator",
    ],
  },
  {
    category: "public sector/social work",
    template: "strategic-leader",
    titles: [
      "City Planner",
      "Public Health Program Manager",
      "Nonprofit Program Director",
    ],
  },
];

export const JOB_PROFILES: JobProfile[] = PROFILE_GROUPS.flatMap((group) => {
  const template = PROFILE_TEMPLATES[group.template];
  return group.titles.map((title) => ({
    title,
    category: group.category,
    rationale: template.rationale,
    answers: { ...template.answers },
  }));
});
