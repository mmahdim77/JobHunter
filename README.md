# Job Application Assistant

A full-stack application that helps users manage their job applications, generate tailored resumes, and create personalized cover letters using AI.

## Overview

The Job Application Assistant is a comprehensive tool designed to streamline the job application process. It combines modern web technologies with AI capabilities to help users:
- Track and manage job applications
- Generate tailored resumes for specific job postings
- Create personalized cover letters
- Store and organize application materials
- Track application status and follow-ups

## Key Features

### Job Management
- Add and track job applications
- Store job descriptions and requirements
- Track application status and follow-ups
- Organize jobs by status (applied, interviewing, rejected, etc.)

### AI-Powered Resume Tailoring
- Upload your base resume
- Automatically tailor your resume for specific job postings
- Highlight relevant skills and experiences
- Optimize resume content based on job requirements

### Cover Letter Generation
- Generate personalized cover letters using AI
- Customize tone and style based on company culture
- Highlight relevant experiences and skills
- Maintain consistency with your resume

### User Management
- Secure authentication system
- Profile management
- API key configuration for AI services
- Personal dashboard

## Architecture

The application follows a modern full-stack architecture:

```
job-application/
├── frontend/          # Next.js frontend application
│   └── src/          # Source code for the frontend
├── backend/          # Express.js backend
│   └── src/          # Source code for the backend
└── scripts/          # Python scripts for AI features
```

### Frontend
- Built with Next.js 14 and TypeScript
- Modern UI with Tailwind CSS
- Client-side state management
- Secure authentication with NextAuth.js

### Backend
- Express.js server with TypeScript
- RESTful API architecture
- Prisma ORM for database management
- Python integration for AI features

### AI Integration
- OpenAI API for content generation
- Custom Python scripts for resume and cover letter generation
- Configurable AI models and parameters

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd job-application
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
pip install -r requirements.txt
```

4. Set up environment variables:
Create `.env` files in both frontend and backend directories with the following variables:

Frontend (.env):
```env
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/jobapp
```

Backend (.env):
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobapp
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key
```

5. Set up the database:
```bash
cd backend
npx prisma migrate dev
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

## API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create a new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Resumes
- `POST /api/resumes/tailor/:jobId` - Generate tailored resume
- `GET /api/resumes` - Get all resumes
- `POST /api/resumes` - Upload new resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume

### Cover Letters
- `POST /api/cover-letters/:jobId/generate` - Generate cover letter
- `GET /api/cover-letters` - Get all cover letters
- `GET /api/cover-letters/:id` - Get cover letter by ID

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI capabilities
- Next.js and Express.js communities for their excellent documentation
- All contributors who have helped improve this project
