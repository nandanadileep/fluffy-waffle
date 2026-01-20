# Google OAuth Setup Guide

## Fix "The given origin is not allowed" Error

You're seeing this error because your Google OAuth client doesn't have the correct authorized origins configured.

### Steps to Fix:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Select Your OAuth Client**
   - Find your OAuth 2.0 Client ID: `753603854199-7drgncvqrkua155vvkq46madnr8omg22.apps.googleusercontent.com`
   - Click on it to edit

3. **Add Authorized JavaScript Origins**
   Add these EXACT URLs to the "Authorized JavaScript origins" section:
   
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```
   
   Also add your production URL if you have one deployed:
   ```
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

4. **Add Authorized Redirect URIs**
   Add these to "Authorized redirect URIs":
   
   ```
   http://localhost:3000
   http://127.0.0.1:3000
   ```

5. **Save Changes**
   - Click "SAVE" at the bottom
   - Wait 1-2 minutes for changes to propagate

6. **Refresh Your App**
   - Hard refresh your browser (Cmd+Shift+R on Mac)
   - Try logging in again

### Your Current Configuration:
- **Dev Server Port**: `3000` (configured in vite.config.ts)
- **Client ID**: `753603854199-7drgncvqrkua155vvkq46madnr8omg22.apps.googleusercontent.com`

### Important Notes:
- The error shows the OAuth is trying to use `localhost:3000` which is correct
- You just need to add this to your Google Cloud Console authorized origins
- Make sure to use the EXACT URLs above (including `http://` prefix)

---

## Verification Checklist

- [ ] Opened Google Cloud Console
- [ ] Found the OAuth 2.0 Client ID listed above
- [ ] Added `http://localhost:3000` to Authorized JavaScript origins
- [ ] Added `http://127.0.0.1:3000` to Authorized JavaScript origins
- [ ] Added `http://localhost:3000` to Authorized redirect URIs
- [ ] Clicked SAVE
- [ ] Waited 1-2 minutes
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Tried logging in again

If you still see errors after following these steps, check the browser console for any new error messages.

