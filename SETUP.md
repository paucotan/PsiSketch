# PsiSketch Setup Guide

This guide will walk you through the process of downloading, setting up, and deploying PsiSketch to Vercel with a PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Downloading the Code](#downloading-the-code)
3. [Local Development Setup](#local-development-setup)
4. [Setting Up PostgreSQL](#setting-up-postgresql)
5. [Deploying to Vercel](#deploying-to-vercel)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have the following:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [GitHub](https://github.com/) account
- [Vercel](https://vercel.com/) account
- [Unsplash API](https://unsplash.com/developers) key (free tier available)

## Downloading the Code

### Option 1: Download from Replit

1. If you're viewing this on Replit, click on the three dots menu in the top-right corner and select "Download as ZIP"
2. Extract the ZIP file to your desired location

### Option 2: Clone from GitHub (if you've already pushed it to your repo)

```bash
git clone https://github.com/yourusername/psisketch.git
cd psisketch
```

## Local Development Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/psisketch
UNSPLASH_API_KEY=your_unsplash_api_key
```

3. Start the development server:

```bash
npm run dev
```

4. The application should now be running at `http://localhost:5000`

## Setting Up PostgreSQL

### Option 1: Local PostgreSQL

1. [Install PostgreSQL](https://www.postgresql.org/download/) on your machine
2. Create a new database:

```sql
CREATE DATABASE psisketch;
```

3. Update your `.env` file with your PostgreSQL connection string:

```
DATABASE_URL=postgresql://username:password@localhost:5432/psisketch
```

4. Run database migrations:

```bash
npm run db:push
```

### Option 2: Managed PostgreSQL with Neon (Recommended for Vercel deployment)

1. Create a free account at [Neon](https://neon.tech/)
2. Create a new project and database
3. Get your connection string from the Neon dashboard
4. Update your `.env` file:

```
DATABASE_URL=postgresql://username:password@db.example.neon.tech/psisketch
```

5. Run database migrations:

```bash
npm run db:push
```

## Deploying to Vercel

### Setting Up Your GitHub Repository

1. Create a new repository on GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/psisketch.git
git push -u origin main
```

### Deploying with Vercel

1. Go to [Vercel](https://vercel.com/) and sign up/login (you can use your GitHub account)
2. Click "New Project"
3. Select your GitHub repository
4. Configure the project:
   - Framework Preset: Custom (Build Command & Output Directory)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Root Directory: `./` (leave as default)

5. Add environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `UNSPLASH_API_KEY`: Your Unsplash API key

6. Click "Deploy"

## Environment Variables

PsiSketch requires the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://username:password@db.example.neon.tech/psisketch` |
| `UNSPLASH_API_KEY` | API key for Unsplash image service | `abc123def456ghi789` |

## Troubleshooting

### Database Connection Issues

- Make sure your PostgreSQL server is running
- Verify your connection string is correct
- For Neon, make sure you've allowed connections from your IP or Vercel's IP range
- Check if your database user has the correct permissions

### Deployment Issues

- Check Vercel's deployment logs for errors
- Make sure all environment variables are properly set in Vercel
- If you're using a different build command or output directory, adjust accordingly

### CORS Issues

If you're experiencing CORS issues when connecting to your API:

1. Make sure your frontend and backend are deployed on the same domain
2. If you're using separate domains, update the CORS configuration in `server/index.ts`

## Getting Help

If you encounter any issues not covered in this guide:

1. Check the [GitHub repository](https://github.com/yourusername/psisketch) for issues or discussions
2. Consult the [Vercel documentation](https://vercel.com/docs) for deployment troubleshooting
3. Review the [Neon documentation](https://neon.tech/docs) for database setup help

## Next Steps

Once your application is deployed, you may want to:

1. Set up a custom domain in Vercel
2. Configure automatic deployments from your GitHub repository
3. Add monitoring and analytics
4. Implement user authentication for multi-user support