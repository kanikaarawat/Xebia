# MindMend - Mental Wellness Platform

A comprehensive mental wellness and teletherapy platform built with Next.js and Supabase, offering secure, accessible, and stigma-free virtual consultations.

## Features

- **User Authentication**: JWT + Google OAuth integration
- **Role-Based Access**: Separate dashboards for therapists and users
- **Online Therapy Booking**: Schedule and manage appointments
- **Mood Tracking**: AI-powered mood analysis and insights
- **Resource Library**: Curated self-help materials and guides
- **Community Support**: Anonymous peer support forums
- **Emergency Help**: Quick access to crisis support resources

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with JWT + Google OAuth
- **Real-time**: Supabase Realtime
- **Video Calls**: Jitsi Meet SDK (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mindmend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key from Settings > API
   - Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Configure Google OAuth (Optional)**

   - Go to your Supabase project dashboard
   - Navigate to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
mindmend/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── auth/              # Authentication routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   └── auth/              # Authentication components
│   └── lib/                   # Utility functions
│       └── supabaseClient.ts  # Supabase client configuration
├── public/                    # Static assets
├── .env.local                 # Environment variables
└── package.json               # Dependencies and scripts
```

## Database Schema

The following tables will need to be created in your Supabase database:

### Users (extends Supabase auth.users)

- `id` (UUID, primary key)
- `email` (text)
- `role` (enum: 'user', 'therapist')
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Profiles

- `id` (UUID, primary key, references auth.users.id)
- `first_name` (text)
- `last_name` (text)
- `bio` (text)
- `avatar_url` (text)
- `specialization` (text, for therapists)
- `license_number` (text, for therapists)

### Appointments

- `id` (UUID, primary key)
- `patient_id` (UUID, references profiles.id)
- `therapist_id` (UUID, references profiles.id)
- `scheduled_at` (timestamp)
- `duration` (integer, minutes)
- `status` (enum: 'scheduled', 'completed', 'cancelled')
- `notes` (text)

### Mood_Entries

- `id` (UUID, primary key)
- `user_id` (UUID, references profiles.id)
- `mood_score` (integer, 1-10)
- `notes` (text)
- `created_at` (timestamp)

### Resources

- `id` (UUID, primary key)
- `title` (text)
- `description` (text)
- `type` (enum: 'video', 'article', 'exercise')
- `url` (text)
- `category` (text)
- `created_at` (timestamp)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@mindmend.com or create an issue in the repository.

## Roadmap

- [ ] Video call integration with Jitsi Meet
- [ ] AI-powered mood analysis
- [ ] Mobile app (React Native)
- [ ] Advanced appointment scheduling
- [ ] Payment processing
- [ ] HIPAA compliance features
- [ ] Multi-language support
