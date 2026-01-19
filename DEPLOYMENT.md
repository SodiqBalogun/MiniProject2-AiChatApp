# Deploying to Vercel

This guide will walk you through deploying your AI Chat App to Vercel.

## Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
3. **Supabase Project** - Already set up with your database schema
4. **Together.ai API Key** - For AI chat functionality

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import your repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will automatically detect it as a Next.js project

3. **Configure environment variables**
   In the Vercel dashboard, add these environment variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   TOGETHER_API_KEY=your_together_ai_api_key
   ```
   
   **Where to find these:**
   - **Supabase URL & Key**: Go to your Supabase project → Settings → API
   - **Together.ai API Key**: Go to [together.ai](https://together.ai) → API Keys section

4. **Configure build settings** (usually auto-detected)
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install`

5. **Deploy!**
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your app will be live at `your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new one
   - Set up environment variables when prompted

4. **Set environment variables** (if not done during deployment)
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add TOGETHER_API_KEY
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Post-Deployment

### 1. Update Supabase Settings

After deployment, you need to update your Supabase project to allow your Vercel domain:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Under **URL Configuration**, add your Vercel domain to the allowed origins:
   - `https://your-app-name.vercel.app`
   - If you have a custom domain: `https://your-custom-domain.com`

### 2. Configure Redirect URLs (Supabase Auth)

1. Go to **Authentication** → **URL Configuration** in Supabase
2. Add your Vercel site URL to:
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: Add both:
     - `https://your-app-name.vercel.app/auth/callback`
     - `https://your-app-name.vercel.app/**` (for wildcard matching)

### 3. Test Your Deployment

1. Visit your deployed site: `https://your-app-name.vercel.app`
2. Test authentication (sign up/login)
3. Test real-time messaging
4. Test AI chat functionality

## Environment Variables Reference

| Variable | Description | Required | Where to Get It |
|----------|-------------|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | Supabase Dashboard → Settings → API |
| `TOGETHER_API_KEY` | Together.ai API key for AI features | Yes | Together.ai Dashboard → API Keys |

## Custom Domain (Optional)

1. In Vercel dashboard, go to your project → **Settings** → **Domains**
2. Add your custom domain
3. Follow Vercel's instructions to configure DNS
4. Update Supabase settings with your custom domain

## Troubleshooting

### Build Errors

- **Error: Missing environment variables**
  - Ensure all environment variables are set in Vercel dashboard
  - Go to Project Settings → Environment Variables

### Authentication Issues

- **Cannot login after deployment**
  - Check Supabase redirect URLs are configured correctly
  - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Real-time Features Not Working

- **Messages not updating in real-time**
  - Verify Realtime is enabled in Supabase for your tables
  - Check browser console for WebSocket errors
  - Ensure your Supabase project is not paused (free tier pauses after inactivity)

### AI Features Not Working

- **AI chat returning errors**
  - Verify `TOGETHER_API_KEY` is set correctly
  - Check Together.ai account has sufficient credits
  - Check Vercel function logs for API errors

## Monitoring

- **Vercel Analytics**: Enable in project settings for performance monitoring
- **Function Logs**: View in Vercel dashboard under your project → **Functions**
- **Supabase Logs**: Check Supabase dashboard for database and auth logs

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:
- Push to `main` → Production deployment
- Push to other branches → Preview deployment

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
