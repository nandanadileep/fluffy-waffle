# Just Note-talking

A collaborative note-taking application designed for private and shared workspaces.

## Features

- **Account Specific Access**: Each user has their own workspace after signing in with Google.
- **Note and Folder Sharing**: Users can share specific notes or entire folders with other users by email.
- **Direct Linking**: Shared links take users directly to the specific note or folder after login.
- **Collaborative Comments**: Support for discussions within each note.
- **Real-time Sync**: Automatic data synchronization across sessions.

## Technical Stack

- **Frontend**: React and Vite.
- **Database and Auth**: Supabase (PostgreSQL with Row Level Security).
- **Icons**: Lucide React.
- **Deployment**: Vercel.

## How Sharing Works

Sharing is managed at the database level using Row Level Security (RLS) policies. When an item is shared, the recipient's email is added to an access list in the database. The application generates a URL with the specific item's ID, which is then sent via the user's native mail application.

## Local Setup

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Add your Supabase credentials to a `.env` file.
4. Run `npm run dev` to start the local development server.

---
Live Application: [jotdowntogether.nandanadileep.com](https://jotdowntogether.nandanadileep.com)