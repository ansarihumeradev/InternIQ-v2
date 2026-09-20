# InternIQ — Advanced Hiring & Internship Platform

InternIQ is an internship and hiring platform built for freshers and recruiters, designed as an advanced evolution of traditional internship listing platforms. It combines smart matching, a unified Skill Graph system, career guidance tools, and a trust-driven community layer to make internship discovery smarter and safer for students.

## Live Demo

https://interniq-delta.vercel.app/

## Features

### For Students
- Secure authentication with Email/Password and **Sign in with Google**
- Personal profile with editable details, education, and social links
- Resume upload and AI-assisted **Resume Builder** with multiple formats
- **Skill Graph** — a unified skill profile built from:
  - GitHub activity (repos, languages, commit history)
  - Resume parsing
  - Manually added skills
- Internship & job matching based on Skill Graph data
- Course recommendations to close identified skill gaps
- **Career Guidance** hub with mock interview scheduling (real email confirmations via Resend) and curated resources
- Internship/job search with filters (location, stipend, skills, duration)
- Application tracking with live status updates
- **Community Reviews & Scam Reporting** — verified applicants can rate companies and flag suspicious listings, keeping the platform trustworthy

### For Recruiters
- Dedicated recruiter dashboard with real-time stats: active listings, total applicants, shortlisted candidates, positions filled
- Post, edit, and manage internship/job listings
- Applicant pipeline with status tracking (Applied → Shortlisted → Interviewed → Selected/Rejected)
- Editable company profile with logo upload

### Platform-Wide
- Fully redesigned, modern UI across all pages
- Role-based access control (Student / Recruiter / Admin) enforced via Supabase Row Level Security
- Responsive design across devices

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS |
| Backend / Database | Supabase (Postgres, Auth, Storage, Edge Functions) |
| Authentication | Supabase Auth (Email/Password + Google OAuth) |
| Email Service | Resend (via Supabase Edge Functions) |
| Hosting | Vercel |
| Version Control | Git + GitHub |
| Project Management | Jira |

## Getting Started

### Prerequisites
- Node.js and npm installed
- A Supabase project (URL + anon key)

### Installation

```bash
git clone https://github.com/ansarihumeradev/InternIQ-v2.git
cd InternIQ-v2
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Database Setup

Run the SQL migration files in `supabase/` (or the schema provided in the project) against your Supabase project via the SQL Editor to set up all required tables, Row Level Security policies, and Storage buckets.

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com). Connect your GitHub repository, add the environment variables listed above in the Vercel project settings, and deploy. Every merge to `main` triggers an automatic redeployment.

## Team

This project was built by a team of 5 as part of our Software Project Management coursework.

| Name | Roll Number | Role |
|---|---|---|
| Humera Ansari | 53013240086 | Product Owner |
| Aafiya Shaikh | 53013240126 | Frontend Developer |
| Rashi Pandya | 53013240097 | System Designer |
| Zainab Khilji | 53013240115 | Tester |
| Tanish Patel | 53013240068 | Backend Developer |

## Project Management

This project was planned and tracked using Jira, with feature work organized into Epics (Backend Development, Frontend Development, System Design, Testing & QA) and broken down into Stories and Tasks. Development followed a feature-branch workflow with pull request reviews before merging into `main`.

## License

This project was built for educational purposes as part of a college course.

## Acknowledgements

Built on top of an initial internship-platform template, extended significantly with a custom Skill Graph system, community trust features, recruiter tooling, and a redesigned UI.
