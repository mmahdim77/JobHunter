# Frontend - Job Application Assistant

The frontend of the Job Application Assistant is built with Next.js 14, providing a modern, responsive user interface for managing job applications, resumes, and cover letters.

## Overview

The frontend application provides a user-friendly interface for:
- Job application management
- Resume and cover letter generation
- User authentication and profile management
- API key configuration
- Dashboard and analytics

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **State Management**: React Context + Hooks
- **Markdown Rendering**: React Markdown
- **Database**: Prisma ORM
- **API Client**: Fetch API

## Project Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard pages
│   │   └── resumes/         # Resume management pages
│   ├── components/          # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   ├── jobs/           # Job-related components
│   │   └── shared/         # Shared UI components
│   ├── lib/                # Utility functions and hooks
│   │   ├── auth.ts        # Authentication utilities
│   │   └── prisma.ts      # Database utilities
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── prisma/               # Prisma schema and migrations
```

## Key Components

### Authentication
- `AuthModal`: Modal for login and registration
- `SignInButton`: Authentication button component
- `UserProfile`: User profile management

### Job Management
- `JobCard`: Display and manage individual job postings
- `JobSearchForm`: Search and filter jobs
- `JobList`: Display list of jobs with filtering options

### Resume Management
- `ResumeUploader`: Upload and manage resumes
- `ResumePreview`: Preview generated resumes
- `ResumeGenerator`: Interface for resume generation

### Cover Letter Management
- `CoverLetterGenerator`: Interface for cover letter generation
- `CoverLetterPreview`: Preview generated cover letters

## Features

### User Interface
- Responsive design for all screen sizes
- Dark/light mode support
- Modern, clean interface
- Interactive job cards and forms
- Real-time updates and notifications

### Authentication
- Email/password authentication
- Session management
- Protected routes
- User profile management

### Job Management
- Add, edit, and delete job applications
- Track application status
- Store job descriptions and requirements
- Filter and search jobs

### Resume and Cover Letter Generation
- Upload base resumes
- Generate tailored resumes
- Create personalized cover letters
- Preview and download generated documents

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Next.js 14

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/jobapp
```

3. Start the development server:
```bash
npm run dev
```

4. Access the application at `http://localhost:3000`

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Follow accessibility guidelines
- Write meaningful comments

### Testing
- Unit tests for components
- Integration tests for features
- E2E tests for critical paths

## Deployment

The frontend can be deployed to various platforms:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Custom server

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
