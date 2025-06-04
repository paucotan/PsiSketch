# PsiSketch Setup Guide

This guide will walk you through the process of setting up and running PsiSketch locally, and deploying it to production with a PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Architecture](#project-architecture)
3. [Local Development Setup](#local-development-setup)
4. [Production Database Setup](#production-database-setup)
5. [Deploying to Production](#deploying-to-production)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have the following:

- [Node.js](https://nodejs.org/) (v18 or higher, v22+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)
- [GitHub](https://github.com/) account (for deployment)
- [Unsplash API](https://unsplash.com/developers) key (free tier available)

## Project Architecture

PsiSketch uses a **monorepo architecture**:

```
PsiSketch/
├── client/           # React frontend (minimal config)
│   ├── src/         # React components and pages
│   ├── index.html   # Main HTML file
│   └── package.json # Minimal client config
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── package.json     # Main dependencies (root)
├── tailwind.config.ts # Shared Tailwind configuration
└── .env            # Environment variables
```

**Key Points:**
- All dependencies are managed in the root `package.json`
- Client runs through the server in development
- Memory storage is used for local development
- PostgreSQL is only required for production

## Local Development Setup

### 1. Clone or Download the Repository

```bash
git clone https://github.com/yourusername/psisketch.git
cd psisketch
```

### 2. Install Dependencies

Install all dependencies from the root directory:

```bash
npm install
```

This installs all dependencies for both the client and server since we use a monorepo architecture.

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Required for API functionality
UNSPLASH_API_KEY=your_unsplash_api_key_here

# Optional: Only needed for production PostgreSQL
# DATABASE_URL=postgresql://username:password@host:port/database
```

**Important Notes:**
- **For local development**, you only need the `UNSPLASH_API_KEY`
- The app uses **memory storage** locally, so no database setup is required
- Get your free Unsplash API key from [Unsplash Developers](https://unsplash.com/developers)

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at:
- **Frontend & Backend**: `http://localhost:3000`

**What happens when you run `npm run dev`:**
- Express server starts and serves the API routes
- Vite development server is integrated to serve the React frontend
- Hot module replacement (HMR) is enabled for fast development
- All styling and components should work properly

## Production Database Setup

**Note**: PostgreSQL is only required for production deployments. Local development uses memory storage.

### Recommended: Managed PostgreSQL with Neon

1. Create a free account at [Neon](https://neon.tech/)
2. Create a new project and database
3. Get your connection string from the Neon dashboard
4. For production deployment, you'll use this as your `DATABASE_URL`

### Alternative: Local PostgreSQL (for production testing)

1. [Install PostgreSQL](https://www.postgresql.org/download/) on your machine
2. Create a new database:

```sql
CREATE DATABASE psisketch;
```

3. Update your `.env` file to use PostgreSQL instead of memory storage:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/psisketch
```

4. Restart your development server to use PostgreSQL:

```bash
npm run dev
```

### Database Migrations

When using PostgreSQL, run migrations to set up the database schema:

```bash
npm run db:push
```

## Deploying to Production

### Setting Up Your GitHub Repository

1. Push your code to GitHub:

```bash
git add .
git commit -m "Initial PsiSketch setup"
git branch -M main
git remote add origin https://github.com/yourusername/psisketch.git
git push -u origin main
```

### Deploying with Vercel

1. Go to [Vercel](https://vercel.com/) and sign up/login (you can use your GitHub account)
2. Click "New Project"
3. Select your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
   - **Root Directory**: `./` (leave as default)

5. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `UNSPLASH_API_KEY`: Your Unsplash API key
   - `NODE_ENV`: `production`

6. Click "Deploy"

### Post-Deployment

After deployment:
1. Run database migrations on your production database:
   ```bash
   npm run db:push
   ```
2. Test your deployed application
3. Set up automatic deployments (Vercel does this by default)

## Environment Variables

### Required Variables

| Variable | Purpose | Required For | Example |
|----------|---------|--------------|---------|
| `UNSPLASH_API_KEY` | Fetches random target images | All environments | `abc123def456ghi789` |
| `DATABASE_URL` | PostgreSQL connection | Production only | `postgresql://user:pass@host/db` |
| `NODE_ENV` | Environment setting | Production | `production` |

### Environment-Specific Setup

**Local Development:**
```bash
# .env file
UNSPLASH_API_KEY=your_api_key_here
# DATABASE_URL not needed - uses memory storage
```

**Production (Vercel):**
```bash
# Set in Vercel dashboard
UNSPLASH_API_KEY=your_api_key_here
DATABASE_URL=postgresql://user:pass@neon.host/database
NODE_ENV=production
```

## Troubleshooting

### Common Local Development Issues

**Port 3000 already in use:**
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Styling/Components not working:**
- Ensure you're in the root directory when running `npm install`
- All dependencies should install to the root `node_modules`
- If components look unstyled, restart the dev server

**Module resolution errors:**
- Make sure you're running `npm run dev` from the project root
- Check that `.env` file is in the root directory

### Database Issues

**Local development database errors:**
- By default, the app uses memory storage locally
- Only add `DATABASE_URL` if you specifically want to test with PostgreSQL

**Production database connection:**
- Verify your Neon connection string includes the correct database name
- Check that your database allows connections from Vercel's IP ranges
- Run `npm run db:push` after setting up the database

### Build/Deployment Issues

**Vercel deployment fails:**
- Check that environment variables are set in Vercel dashboard
- Verify build command is `npm run build`
- Look at Vercel function logs for detailed error messages

**CSS/Styling issues in production:**
- Ensure Tailwind configuration is processing client files correctly
- Check that all dependencies are listed in root `package.json`

## Quick Start Summary

**For immediate local development:**
1. `git clone <your-repo-url>`
2. `cd psisketch`
3. `npm install`
4. Create `.env` with your `UNSPLASH_API_KEY`
5. `npm run dev`
6. Open `http://localhost:3000`

**For production deployment:**
1. Set up Neon PostgreSQL database
2. Push code to GitHub
3. Connect GitHub repo to Vercel
4. Add environment variables in Vercel
5. Deploy

## Getting Help

If you encounter any issues not covered in this guide:

1. Check the project's GitHub repository for issues or discussions
2. Consult the [Vercel documentation](https://vercel.com/docs) for deployment troubleshooting
3. Review the [Neon documentation](https://neon.tech/docs) for database setup help
4. For Unsplash API issues, check the [Unsplash API documentation](https://unsplash.com/documentation)

## Next Steps

Once your application is running:

1. **Development**: The app includes hot reloading for fast development
2. **Customization**: Modify components in `client/src/components/`
3. **Styling**: Update `tailwind.config.ts` and `client/src/index.css`
4. **API**: Extend server routes in `server/routes.ts`
5. **Database**: Add new tables/schemas in `shared/schema.ts`

## Features

PsiSketch includes:
- 🎨 **Drawing Canvas**: Interactive canvas for remote viewing practice
- 🖼️ **Random Images**: Fetches random target images from Unsplash
- 📊 **Session Tracking**: Saves and analyzes practice sessions
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Theme**: Modern dark UI design
- ⚡ **Fast Development**: Hot module reloading and modern tooling