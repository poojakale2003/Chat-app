# 🚀 Vercel Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (free)
- MongoDB Atlas account

## Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Make sure all files are committed

## Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: Leave as root
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm run install-all`

## Step 3: Set Environment Variables
In Vercel dashboard, go to Settings > Environment Variables and add:
- `MONGODB_URI`: `mongodb+srv://poojagkale1987_db_user:xqMKMTLMmLfMQeGW@cluster0.3o2htly.mongodb.net/`
- `JWT_SECRET`: `498d4951e83da64eb0edeb27ca78aaf2`
- `JWT_EXPIRES_IN`: `7d`
- `NODE_ENV`: `production`

## Step 4: Update URLs
After deployment, update these files with your actual Vercel URL:
1. Replace `your-app-name.vercel.app` in:
   - `server/index.js` (CORS origins)
   - `server/routes/messages.js` (file URLs)
   - `server/routes/auth.js` (profile pic URLs)
   - `server/models/Message.js` (image/file URLs)

## Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your app will be available at `https://your-app-name.vercel.app`

## Important Notes
- File uploads will work but files are stored temporarily
- For persistent file storage, consider using AWS S3 or Cloudinary
- Socket.io works on Vercel but with some limitations
- Consider using Railway or Heroku for better Socket.io support

## Troubleshooting
- Check Vercel function logs for errors
- Ensure all environment variables are set
- Verify MongoDB connection string is correct
- Check CORS settings match your domain
