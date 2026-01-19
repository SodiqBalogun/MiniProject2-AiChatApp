# AI Chat App

A real-time chat application built with Next.js, Supabase, and AI integration. Features include live messaging, typing indicators, user profiles, theme customization, and an AI assistant.

## Features

- ✅ **Real-time Messaging** - Live chat with Supabase Realtime
- ✅ **User Authentication** - Secure auth with Supabase Auth
- ✅ **Typing Indicators** - See when users are typing
- ✅ **Theme Toggle** - Light, dark, and system themes
- ✅ **User Profiles** - Customizable usernames, avatars, and display names
- ✅ **AI Assistant** - Integrated AI chat with public/private modes
- ✅ **Chat Summary** - Generate summaries of recent conversations
- ✅ **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Real-time**: Supabase Realtime
- **AI**: OpenAI/Together.ai (configurable)

## Quick Start

See [SETUP.md](./SETUP.md) for detailed setup instructions.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Add your credentials to `.env.local`

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

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
│   ├── ChatRoom.tsx     # Main chat component
│   ├── MessageList.tsx  # Message display
│   ├── MessageInput.tsx # Message input with AI toggle
│   └── ...
├── lib/
│   ├── supabase/       # Supabase client/server helpers
│   ├── types.ts        # TypeScript types
│   └── theme.ts        # Theme management
└── supabase/
    └── schema.sql      # Database schema
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key  # Optional, for AI features
```

### Supabase Setup

1. Create tables using `supabase/schema.sql`
2. Enable Realtime for `messages` and `typing_indicators` tables
3. Configure Row Level Security policies (included in schema)

## Features in Detail

### Real-time Messaging
Messages sync instantly across all connected clients using Supabase Realtime subscriptions.

### AI Assistant
- Toggle AI mode in the message input
- Choose between public (visible to all) or private (only you) responses
- Configure your AI provider in `app/api/ai/route.ts`

### Typing Indicators
Automatically shows when users are typing, with automatic cleanup after inactivity.

### Theme System
- Light mode
- Dark mode
- System preference (follows OS setting)
- Persisted per user

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
