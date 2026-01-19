# Getting Started with Just Notes

## Quick Start (5 minutes)

### Step 1: Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable APIs:
   - Click **"Enable APIs and Services"**
   - Search for and enable **"Google Drive API"**
   - Search for and enable **"People API"**

4. Create OAuth Credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Just Notes` (or any name)
   
5. Add Authorized JavaScript Origins:
   ```
   http://localhost:3000
   ```
   (Add your production URL later when deploying)

6. **Copy your Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 2: Configure the App

1. In the project folder, copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and paste your Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
   ```

### Step 3: Install & Run

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000` 🎉

### Step 4: First Sign-In

1. Click **"Sign in with Google"**
2. Choose your Google account
3. Grant permissions when prompted
4. You're now the **owner**!

### Step 5: Invite Your Teammate

1. Click the **"Invite"** button in the header
2. Enter their **Google email address**
3. They can now sign in with that account
4. Both of you have access to all notes!

## What Happens Behind the Scenes?

1. **First User Signs In**:
   - Creates `NotesData` folder in your Google Drive
   - Stores app configuration in hidden `.app_metadata.json`
   - You become the owner

2. **Owner Invites Second User**:
   - Metadata updated with invited email
   - `NotesData` folder shared with invited user (writer permission)
   - Invited user can sign in and access everything

3. **Notes are Stored**:
   - Each note = `.txt` file in Drive
   - Folders = Real Drive folders
   - Comments = Separate `.json` files
   - Everything syncs via Drive API

## Using the App

### Creating a Folder

1. Click **+** next to "FOLDERS" in sidebar
2. Enter folder name
3. Click "Create"

### Creating a Note

1. Select a folder (or "All Notes" for root)
2. Click **+ New Note**
3. Type your title and content
4. Click **Save**

### Adding Comments

1. Open any note
2. Scroll to comments section
3. Type your comment
4. Press **Enter** or click **Send icon**

### Searching

- Use the search bar in the header
- Searches both titles and content
- Results filter in real-time

### Dark Mode

- Click the **moon/sun icon** in header
- Preference saved in browser

## Permissions Explained

| Action | Your Notes | Others' Notes |
|--------|------------|---------------|
| **View** | ✅ Yes | ✅ Yes |
| **Edit** | ✅ Yes | ❌ No (read-only) |
| **Delete** | ✅ Yes | ❌ No |
| **Comment** | ✅ Yes | ✅ Yes |

Same rules apply to folders!

## Offline Mode

- Recent notes cached in browser
- View cached notes without internet
- Can't create/edit/sync without connection
- Syncs when back online

## Troubleshooting

### "Configuration Missing" Error
- Make sure you created `.env` file
- Check that Client ID is correct
- Restart dev server after changing `.env`

### "You are not invited to this app"
- Only owner + 1 invited user can access
- Ask owner to invite you via email
- Make sure you're signing in with the invited email

### Notes Not Syncing
- Check internet connection
- Check browser console for errors
- Verify Drive API is enabled
- Try signing out and back in

### "This app already has 2 connected users"
- App is limited to 2 users by design
- Owner needs to remove someone first (manual Drive access)

## Building for Production

```bash
# Create optimized production build
npm run build

# Output will be in /dist folder
# Upload to Vercel, Netlify, or any static host
```

### Deploying to Vercel

1. Push code to GitHub
2. Import repo in Vercel
3. Add environment variable: `VITE_GOOGLE_CLIENT_ID`
4. Deploy!
5. **Important**: Update Google Cloud Console:
   - Add your Vercel URL to authorized origins
   - Example: `https://your-app.vercel.app`

### Deploying to Netlify

1. Push code to GitHub
2. Import repo in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_GOOGLE_CLIENT_ID`
6. Deploy!
7. **Important**: Update Google Cloud Console:
   - Add your Netlify URL to authorized origins
   - Example: `https://your-app.netlify.app`

## Tips & Tricks

- **Keyboard Shortcuts**:
  - `Enter` in comment field = Send comment
  - `Esc` when creating folder = Cancel

- **Best Practices**:
  - Create folders for different projects/topics
  - Use descriptive note titles
  - Add comments for async communication
  - Check sync status before going offline

- **Privacy**:
  - All data lives in owner's Google Drive
  - Second user gets writer access (can see everything)
  - No third-party servers (except Google)
  - Delete the `NotesData` folder in Drive to remove all data

## Need Help?

- Check `README.md` for detailed docs
- Review `WIREFRAME.md` for UI reference
- Inspect browser console for errors
- Verify Google Cloud Console setup

---

**Enjoy your minimal, collaborative note-taking! 📝**
