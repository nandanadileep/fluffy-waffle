# Just Notes

A simple, clean, and minimal collaborative note-taking web app for exactly two people. Notes are stored in Google Drive with a beautiful pastel UI.

## Features

- **Dual-User Collaboration**: Designed for exactly two users (owner + invited user)
- **Google Drive Storage**: All notes stored securely in the owner's Google Drive
- **Real-time Sync**: Automatic synchronization across devices
- **Folders & Organization**: Organize notes in custom folders
- **Comments**: Add threaded comments to any note
- **Search**: Quick search across all notes and folders
- **Dark Mode**: Beautiful light and dark themes with pastel colors
- **Offline Viewing**: Recent notes cached for offline access
- **Mobile Responsive**: Works beautifully on all devices

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Google Drive API**
   - **People API** (for user profiles)
4. Create OAuth 2.0 credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Add authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://your-app.vercel.app`)
   - No need to add redirect URIs (we use popup flow)
5. Copy the **Client ID**

### 2. Configure the App

1. Clone this repository
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and paste your Google Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## How It Works

### First User (Owner)

1. Sign in with your Google account
2. The app creates a `NotesData` folder in your Google Drive
3. You can invite a second user by entering their Google email
4. The `NotesData` folder is automatically shared with the invited user

### Second User

1. Sign in with the Google account that was invited
2. You'll have access to all notes and folders
3. You can create, edit, and comment on notes

### Folder Structure in Google Drive

```
/NotesData/
├── .app_metadata.json      (app configuration, hidden)
├── .comments_<noteId>.json (comments for each note, hidden)
├── Note1.txt
├── Note2.txt
├── FolderA/
│   ├── Note3.txt
│   └── Note4.txt
└── FolderB/
    └── Note5.txt
```

### Permissions

- **Notes**: Only the creator can edit or delete their own notes. Others can view and comment.
- **Folders**: Only the creator can delete their own folders.
- **Comments**: Everyone can add comments to any note.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variable:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
4. Update Google Cloud Console:
   - Add your Vercel deployment URL to authorized JavaScript origins
5. Deploy!

### Netlify

1. Push your code to GitHub
2. Import the repository in [Netlify](https://netlify.com)
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variable:
   - `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
5. Update Google Cloud Console:
   - Add your Netlify deployment URL to authorized JavaScript origins
6. Deploy!

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google OAuth** - Authentication
- **Google Drive API** - Storage
- **Lucide React** - Icons

## Design Philosophy

Just Notes embraces calm, lovely minimalism:

- **Pastel Color Palette**: Light lavender (#f3e8ff), pale mint (#e0f7fa), off-white (#fafafa)
- **Soft Rounded Corners**: Medium border radius for gentle aesthetics
- **Inter Font**: Modern, clean typography
- **Generous Whitespace**: Room to breathe
- **No Clutter**: Zero romantic/cutesy elements, just pure functionality

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### "Configuration Missing" Error

Make sure you've created a `.env` file with your Google Client ID.

### "You are not invited to this app" Error

The owner needs to invite you first. Make sure they entered your exact Google email.

### Sync Issues

- Check your internet connection
- Verify Google Drive API is enabled
- Check browser console for detailed errors

## License

MIT

## Credits

Created with care for simple, collaborative note-taking.
