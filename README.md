# 🦄 Just Note-taLking

A collaborative, ultra-secure, and suspiciously aesthetic workspace for you and your friends (real or imaginary). Built with a love for pastel colors and a deep respect for privacy.

---

## ✨ The Vibe
**Just Note-taLking** isn't just a notepad; it's a private digital garden. No one can see your notes unless you explicitly invite them into your world. It's clean, fast, and uses the **JetBrains Mono** font because we like feeling like 10x developers even when just writing a grocery list.

---

## 🚀 What can it do?

### 🔐 Iron-Clad Privacy
Every user gets their own private vault. Your data is protected by **Row Level Security (RLS)** at the database level. That’s fancy talk for: *"Even the database won't show your notes to a stranger."*

### 🤝 Smart Collaboration
*   **Selective Sharing**: Invite friends to a single note or an entire folder.
*   **Real-time Comments**: Discuss your world-domination plans right inside the note.
*   **Deep Linking**: Share a link that takes your friend **directly** to the shared note. No more "where is it?" messages.

### 🎨 Premium Aesthetics
*   **Pastel Power**: Every folder and note gets its own unique, calming pastel personality.
*   **Dark Mode**: For those 2 AM "I just had a genius idea" moments.
*   **Live Sync Indicators**: Know exactly when your thoughts are safe in the cloud.

---

## 🛠 The Toolbox (Under the Hood)

We didn't just build a website; we built a system. Here is the magic we used:

*   **[React](https://reactjs.org/) + [Vite](https://vitejs.dev/)**: The lightning-fast engine for the UI.
*   **[Supabase](https://supabase.com/)**: 
    *   **Auth**: Secure Google Sign-in.
    *   **Postgres Database**: Where your notes live their best life.
    *   **RLS Policies**: The "Security Guard" that keeps your notes private.
*   **[Lucide React](https://lucide.dev/)**: For those crisp, minimalist icons.
*   **CSS Custom Properties**: A custom design system built from scratch to ensure perfect pastel harmony.
*   **URL Schemas**: Handing off the sharing work to your computer's native mail app like a pro.

---

## 🔐 The "Secret Sauce" (How it works)

When you hit that **"Share"** button:
1.  **Supabase** adds your friend's email to a hidden "VIP list" on that note.
2.  **The App** generates a **Deep Link** (e.g., `?noteId=123`).
3.  **Your OS** pops open your mail client with a beautifully formatted draft.
4.  When your friend clicks the link, the app **auto-detects** the ID and jumps straight to that note.

---

## 🍱 Let's run it locally!

1.  **Clone it**: `git clone https://github.com/nandanadileep/fluffy-waffle.git`
2.  **Install the magic**: `npm install`
3.  **Setup the environment**: Create a `.env` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4.  **Launch**: `npm run dev`

---

Built with ❤️ by **Nandana Dileep** 🚀
Check it out live: [jotdowntogether.nandanadileep.com](https://jotdowntogether.nandanadileep.com)