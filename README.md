# Jensei Frontend - Setup Guide

This guide will help you set up and deploy the Jensei Healthcare React Frontend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jenseitech/jensei-frontend-react.git
cd jensei-frontend-react
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory (optional for local development):

```env
# API URL for local development
VITE_API_URL=http://localhost:3000
```

**Note**: If `VITE_API_URL` is not set, the app will:
- Use `http://localhost:3000` in development
- Use `https://api.jensei.com` in production (Vercel)

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`


## Production Deployment (Vercel)

### Automatic Deployment

The frontend is automatically deployed to Vercel when you push to the `main` branch **from the jenseitech GitHub account**.

**Important**: Vercel will only deploy if the latest commit is from the `jenseitech` GitHub account.

### Deployment Process

1. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Vercel Auto-Deploy**:
   - Vercel detects the push to `main`
   - Verifies commit author is `jenseitech`
   - Builds the application
   - Deploys to production

3. **Deployment URL**:
   - Production: `https://www.jensei.com`
   - Preview deployments: Automatically generated for PRs

### Environment Variables on Vercel

Configure environment variables in Vercel dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add the following:

```env
VITE_API_URL=https://api.jensei.com
```

**Note**: Changes to environment variables require a new deployment.

### Manual Deployment (if needed)

If you need to trigger a manual deployment:

1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments** tab
4. Click **Redeploy** on the latest deployment

## Project Structure

```
jensei-frontend-react/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts
│   ├── utils/           # Utility functions
│   └── config/          # Configuration files
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
└── vercel.json          # Vercel deployment config
```

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Key Features

- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Protected Routes**: Authentication-based route protection
- **API Integration**: Centralized API configuration

## Environment Variables

### Development

- `VITE_API_URL`: Backend API URL (defaults to `http://localhost:3000`)

### Production

- `VITE_API_URL`: Backend API URL (defaults to `https://api.jensei.com` on Vercel)

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

Verify:
- Backend server is running
- `VITE_API_URL` is correctly set
- CORS is configured on backend

### Vercel Deployment Issues

- Check Vercel build logs
- Verify environment variables are set
- Ensure commit author is `jenseitech` for auto-deploy

## Notes

- The app uses Vite as the build tool
- React Router handles client-side routing
- `vercel.json` configures SPA routing (all routes redirect to `index.html`)
- Environment variables must be prefixed with `VITE_` to be accessible in the app

"# jensieFrontend" 
