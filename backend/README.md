# Backend - Job Application Assistant

The backend of the Job Application Assistant is built with Express.js and TypeScript, providing a robust API for job application management, resume tailoring, and cover letter generation.

## Overview

The backend application provides:
- RESTful API endpoints
- User authentication and authorization
- Database management with Prisma
- AI-powered resume and cover letter generation
- File storage and management

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **AI Integration**: Python scripts with OpenAI API
- **File Storage**: Local file system
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Route controllers
│   │   ├── auth.ts     # Authentication controller
│   │   ├── jobs.ts     # Job management controller
│   │   ├── resumes.ts  # Resume management controller
│   │   └── coverLetters.ts # Cover letter controller
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts     # Authentication middleware
│   │   └── error.ts    # Error handling middleware
│   ├── routes/         # API routes
│   │   ├── auth.ts    # Authentication routes
│   │   ├── jobs.ts    # Job routes
│   │   └── resumes.ts # Resume routes
│   ├── services/       # Business logic
│   │   ├── auth.ts    # Authentication service
│   │   └── ai.ts      # AI service
│   └── utils/         # Utility functions
├── scripts/           # Python scripts
│   ├── resume_generator.py
│   └── cover_letter_generator.py
└── prisma/           # Database schema and migrations
```

## Key Components

### Authentication System
- JWT-based authentication
- User registration and login
- Password hashing and validation
- Session management

### Job Management
- CRUD operations for jobs
- Job status tracking
- Job search and filtering
- Application tracking

### Resume Management
- Resume storage and retrieval
- Resume tailoring service
- File upload and download
- PDF generation

### Cover Letter Generation
- AI-powered cover letter creation
- Template management
- Customization options
- File storage

### AI Integration
- OpenAI API integration
- Python script execution
- Model configuration
- Error handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Resumes
- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - List resumes
- `POST /api/resumes/tailor/:jobId` - Generate tailored resume
- `GET /api/resumes/:id` - Get resume
- `DELETE /api/resumes/:id` - Delete resume

### Cover Letters
- `POST /api/cover-letters/:jobId/generate` - Generate cover letter
- `GET /api/cover-letters` - List cover letters
- `GET /api/cover-letters/:id` - Get cover letter

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.8+
- PostgreSQL
- OpenAI API key

### Installation

1. Install dependencies:
```bash
npm install
pip install -r requirements.txt
```

2. Set up environment variables:
Create a `.env` file with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jobapp
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key
PORT=5001
```

3. Set up the database:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Development

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript type checking

### Code Style
- Follow TypeScript best practices
- Use async/await for asynchronous operations
- Implement proper error handling
- Write meaningful comments
- Follow RESTful API design principles

### Testing
- Unit tests for controllers and services
- Integration tests for API endpoints
- E2E tests for critical paths

## Deployment

The backend can be deployed to various platforms:
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean
- Custom server

## Security Considerations

- Implement rate limiting
- Use HTTPS in production
- Validate all user input
- Sanitize file uploads
- Implement proper CORS policies
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
