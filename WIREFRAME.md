# Just Notes - UI Wireframe

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            HEADER                                       │
│  [Just Notes]  [Search...............] [Invite] [🌙] [UserAvatar] [↗]  │
│  Sync: 2m ago                                                           │
└─────────────────────────────────────────────────────────────────────────┘
┌──────────────┬─────────────────────┬──────────────────────────────────────┐
│   SIDEBAR    │    NOTES LIST       │         NOTE EDITOR                  │
│              │                     │                                      │
│ FOLDERS      │ [+New Note]         │  Title: ___________________________  │
│ [+ New]      │                     │  By: Alice • Created: Today          │
│              │ ┌─────────────────┐ │  ────────────────────────────────────│
│ 📁 All Notes │ │ Meeting Notes   │ │                                      │
│              │ │ Quick summary.. │ │  Note content goes here...           │
│ 📁 Personal  │ │ Alice • Today   │ │  Multi-line text area                │
│              │ └─────────────────┘ │  Editable if owned by current user   │
│ 📁 Work      │ ┌─────────────────┐ │                                      │
│   [🗑]       │ │ Ideas           │ │  ────────────────────────────────────│
│              │ │ Some thoughts.. │ │  💬 COMMENTS (2)                     │
│ 📁 Projects  │ │ Bob • Yesterday │ │                                      │
│              │ └─────────────────┘ │  ┌────────────────────────────────┐  │
│              │                     │  │ Alice • 10m ago                │  │
│              │                     │  │ Great idea!                    │  │
│              │                     │  └────────────────────────────────┘  │
│              │                     │  ┌────────────────────────────────┐  │
│              │                     │  │ Bob • 5m ago                   │  │
│              │                     │  │ Thanks! Let's discuss more     │  │
│              │                     │  └────────────────────────────────┘  │
│              │                     │                                      │
│              │                     │  [Add comment...........] [Send]     │
│              │                     │                                      │
│              │                     │  [Delete]              [💾 Save]     │
└──────────────┴─────────────────────┴──────────────────────────────────────┘
```

## Color Palette

- **Background**: Off-white (#fafafa) / Dark Gray (#111827)
- **Card Background**: White (#ffffff) / Gray 800 (#1f2937)
- **Accent 1**: Lavender (#f3e8ff)
- **Accent 2**: Mint (#e0f7fa)
- **Text**: Gray 900 (#111827) / Gray 100
- **Subtle Text**: Gray 500 (#6b7280)

## Component Breakdown

### 1. Header
- Left: App title + sync status
- Center: Search bar
- Right: Invite button (owner only), theme toggle, user menu, logout

### 2. Sidebar (Folders)
- Scrollable list of folders
- "All Notes" shows root-level notes
- Each folder has delete button (for creator only)
- New folder button at top

### 3. Notes List
- Displays notes in selected folder
- Each note card shows:
  - Title (bold)
  - Content preview (2 lines max)
  - Creator name + timestamp
- Create new note button at top
- Filtered by search query

### 4. Note Editor
- Title input (large, prominent)
- Metadata: creator, timestamps
- Content textarea (auto-expanding)
- Comments section below
- Action buttons: Delete (left), Save (right)
- Read-only for notes created by others

## Interaction Flow

### New User Sign-In
1. Landing page with Google Sign-In button
2. OAuth consent flow
3. App checks metadata:
   - First user? → Becomes owner, creates NotesData folder
   - Invited user? → Grants access, connects
   - Uninvited? → Shows error

### Creating a Note
1. Click "+ New Note" in notes list
2. New untitled note appears in editor
3. Type title and content
4. Auto-saves on changes (debounced)
5. Note appears in list immediately

### Inviting Second User
1. Owner clicks "Invite" button
2. Modal opens asking for email
3. Enter Google email
4. App updates metadata and shares Drive folder
5. Invited user can now sign in

### Commenting
1. Scroll to comments section
2. Type comment in input field
3. Press Enter or click Send
4. Comment appears immediately with name + timestamp

## Responsive Behavior

### Desktop (> 1024px)
- Three-column layout as shown
- Sidebar: 256px
- Notes list: 320px
- Editor: Flex remaining space

### Tablet (768px - 1024px)
- Collapsible sidebar (hamburger menu)
- Two-column: Notes list + Editor
- Sidebar overlays when opened

### Mobile (< 768px)
- Single column, stack vertically
- Bottom navigation: Folders / Notes / Editor
- Swipe between views

## Accessibility

- Semantic HTML (nav, main, aside, article)
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus visible indicators
- Sufficient color contrast ratios (WCAG AA)

## Animations

- Smooth transitions (200ms) for hover states
- Page transitions: Slide/fade
- Loading states: Subtle pulse
- Auto-save indicator: Brief flash on save

## Empty States

1. **No folders**: "Create your first folder to organize notes"
2. **No notes**: File icon + "No notes yet"
3. **No search results**: "No notes found"
4. **No comments**: Comments section just shows input

All empty states use soft gray text and minimal iconography.
