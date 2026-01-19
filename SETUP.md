# AI Chat App - Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- (Optional) OpenAI API key or Together.ai API key for AI features

## Step 1: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your Project URL and anon/public key
4. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. In Supabase Dashboard, go to SQL Editor
6. Copy and paste the contents of `supabase/schema.sql` and run it
7. Enable Realtime for the `messages` and `typing_indicators` tables:
   - Go to **Database** → **Publications** (in the left sidebar)
   - Click on the `supabase_realtime` publication
   - Under "Tables", toggle ON for `messages` and `typing_indicators`
   - Click **Save**

   **Alternative method (via SQL):**
   - If you prefer SQL, run this in the SQL Editor:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;
   ```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Configure AI (Optional)

To enable AI features, add your API key to `.env.local`:

### Option A: OpenAI
```env
OPENAI_API_KEY=your_openai_api_key
```

Then update `app/api/ai/route.ts` and `app/api/ai/summary/route.ts` to use OpenAI API.

### Option B: Together.ai
```env
TOGETHER_API_KEY=your_together_api_key
```

Then update the API routes to use Together.ai endpoints.

## Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 5: Create Your First User

1. Navigate to `/signup`
2. Create an account
3. You'll be redirected to the chat room

## Features

- ✅ Real-time messaging with Supabase Realtime
- ✅ User authentication with Supabase Auth
- ✅ Typing indicators
- ✅ Theme toggle (light/dark/system)
- ✅ User profiles and avatars
- ✅ AI assistant integration (configure your API)
- ✅ Chat summary generation
- ✅ Public/private AI message modes

## Project Structure

```
├── app/
│   ├── api/ai/          # AI API routes
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   ├── profile/         # User profile page
│   ├── settings/        # Settings page
│   └── page.tsx         # Main chat room
├── components/          # React components
├── lib/
│   ├── supabase/       # Supabase client/server helpers
│   ├── types.ts        # TypeScript types
│   └── theme.ts        # Theme management
└── supabase/
    └── schema.sql      # Database schema
```

## Next Steps

1. Configure your AI API in the API routes
2. Customize the UI styling
3. Add more features like file uploads, emoji reactions, etc.
4. Deploy to Vercel or your preferred hosting platform

## Troubleshooting

### Messages not appearing in real-time
- Make sure Realtime is enabled for the `messages` table in Supabase
- Check browser console for errors

### Authentication not working
- Verify your Supabase credentials in `.env.local`
- Check Supabase Dashboard > Authentication settings

### AI features not working
- Make sure you've configured your AI API key
- Update the API routes with your provider's endpoints
- Check the browser console and server logs for errors
