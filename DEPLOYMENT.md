# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Railway or Render account (for backend)
- Supabase account (for database)
- Cloudinary account (for file storage)
- OpenAI API key (for AI features)

## 1. Database Setup (Supabase)

1. Create a new project on [Supabase](https://supabase.com)
2. Note down your database connection string from Settings > Database
3. Run migrations:
```bash
cd backend
npx prisma migrate deploy
```

## 2. File Storage Setup (Cloudinary)

1. Create a new account on [Cloudinary](https://cloudinary.com)
2. From your dashboard, note down:
   - Cloud name
   - API Key
   - API Secret

## 3. Backend Deployment (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the following environment variables:
```
DATABASE_URL=your-supabase-connection-string
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
OPENAI_API_KEY=your-openai-api-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-frontend-domain.vercel.app
```
4. Set the start command in `package.json`:
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "postinstall": "prisma generate && npm run build"
  }
}
```
5. Deploy the backend
6. Note down your backend URL (e.g., https://your-app.railway.app)

## 4. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Set the following environment variables:
```
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXTAUTH_URL=https://your-frontend-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret
DATABASE_URL=your-supabase-connection-string
```
4. Update `next.config.mjs`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '${process.env.NEXT_PUBLIC_API_URL}/api/:path*',
      },
    ];
  },
};

export default nextConfig;
```
5. Deploy the frontend

## 5. Final Configuration

1. Update CORS settings in backend (`backend/src/index.ts`):
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

2. Update API calls in frontend to use environment variables:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
```

## 6. Scaling Considerations

1. **Database (Supabase)**:
   - Free tier includes 500MB storage
   - Upgrade to Pro ($25/month) for 8GB storage
   - Add database indexes for frequently queried fields

2. **Backend (Railway)**:
   - Free tier includes 500 hours/month
   - $5/month for 24/7 uptime
   - Uses container-based deployment for easy scaling

3. **Frontend (Vercel)**:
   - Free tier includes:
     - Unlimited static sites
     - 100GB bandwidth/month
     - Serverless functions
   - Pro plan ($20/month) for more resources

4. **File Storage (Cloudinary)**:
   - Free tier includes 25 credits/month
   - Pay as you go pricing for more storage

## 7. Monitoring and Maintenance

1. Set up logging with Winston or Pino
2. Add error tracking with Sentry (free tier available)
3. Set up uptime monitoring with UptimeRobot (free)
4. Regular database backups (automated with Supabase)

## 8. Security Checklist

1. Enable HTTPS everywhere
2. Set secure cookie options
3. Implement rate limiting
4. Add request validation
5. Keep dependencies updated
6. Enable Supabase Row Level Security
7. Set up proper CORS policies

## Estimated Monthly Costs (Minimum Setup)

- Supabase: $0 (Free tier)
- Railway: $5 (Basic tier)
- Vercel: $0 (Free tier)
- Cloudinary: $0 (Free tier)
- Total: ~$5/month

This setup can handle hundreds of users with moderate usage. Scale up individual components as needed. 