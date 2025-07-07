# MindMend Build Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **pnpm**
3. **Git**

## Environment Variables Setup

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# API Keys
YOUTUBE_API_KEY=your_youtube_api_key_here
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Video Call Services
DAILY_API_KEY=your_daily_api_key_here
STREAM_API_KEY=your_stream_api_key_here
STREAM_API_SECRET=your_stream_api_secret_here

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Build Process

### Option 1: Using PowerShell Script (Recommended)

```powershell
.\build.ps1
```

### Option 2: Manual Build

```bash
# Install dependencies
npm install

# Type check
npx tsc --noEmit

# Build
npm run build
```

### Option 3: Development Mode

```bash
npm run dev
```

## Common Issues and Solutions

### 1. Permission Errors

- **Issue**: `EPERM: operation not permitted`
- **Solution**: Run PowerShell as Administrator or use the build script

### 2. Missing Dependencies

- **Issue**: Module not found errors
- **Solution**: Run `npm install` to install missing packages

### 3. TypeScript Errors

- **Issue**: Type errors during build
- **Solution**: Fix type issues or temporarily set `ignoreBuildErrors: true` in `next.config.ts`

### 4. Environment Variables

- **Issue**: Undefined environment variables
- **Solution**: Ensure all required environment variables are set in `.env.local`

## Build Verification

After successful build:

1. Check that `.next` directory is created
2. Verify no TypeScript errors in console
3. Test the application with `npm start`

## Troubleshooting

### If build fails:

1. Clear `.next` directory: `rm -rf .next`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Try building again: `npm run build`

### For development:

- Use `npm run dev` for hot reloading
- Check browser console for runtime errors
- Use browser dev tools for debugging
