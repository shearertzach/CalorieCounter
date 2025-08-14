# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be set up (this may take a few minutes)

## 2. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth client ID
   - Client Secret: Your Google OAuth client secret
4. Add your redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`

## 3. Set Up the Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-schema.sql` into the editor
3. Run the SQL to create the `food_entries` table and policies

## 4. Get Your Environment Variables

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)

## 5. Configure Your App

1. Create a `.env.local` file in your project root
2. Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 6. Configure Google OAuth (if not already done)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Set the authorized redirect URI to: `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret to your Supabase Google provider settings

## 7. Test Your Setup

1. Run your development server: `npm run dev`
2. Try signing in with Google
3. Add some food entries to test the database integration

## Troubleshooting

- **Authentication errors**: Make sure your Google OAuth redirect URI matches exactly
- **Database errors**: Ensure you've run the SQL schema and RLS policies are in place
- **Environment variables**: Verify your `.env.local` file has the correct Supabase URL and anon key

## Security Notes

- The database uses Row Level Security (RLS) to ensure users can only access their own data
- All database operations are authenticated through Supabase
- The anon key is safe to use in client-side code as it's restricted by RLS policies
