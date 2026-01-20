import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { FolderList } from './components/FolderList';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { DriveService } from './services/driveService';
import { localStorageService } from './utils/storage';
import { User, AppMetadata, Folder, Note, Comment, ThemeMode } from './types';
import './index.css';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
    const [user, setUser] = useState<User | null>(null);
    const [metadata, setMetadata] = useState<AppMetadata | null>(null);
    const [notesFolderId, setNotesFolderId] = useState<string | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [comments, setComments] = useState<Record<string, Comment[]>>({});
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [theme, setTheme] = useState<ThemeMode>('light');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
        if (savedTheme) {
            setTheme(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
        }
    }, []);

    // Apply theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Load cached data on mount
    useEffect(() => {
        const cachedNotes = localStorageService.getNotes();
        const cachedFolders = localStorageService.getFolders();
        const cachedComments = localStorageService.getComments();
        const cachedSyncTime = localStorageService.getLastSync();

        if (cachedNotes.length > 0) setNotes(cachedNotes);
        if (cachedFolders.length > 0) setFolders(cachedFolders);
        if (Object.keys(cachedComments).length > 0) setComments(cachedComments);
        if (cachedSyncTime) setLastSyncTime(cachedSyncTime);
    }, []);

    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            setError(null);

            // Decode JWT to get user info
            const token = credentialResponse.credential;
            if (!token) throw new Error('No credential token');

            const payload = JSON.parse(atob(token.split('.')[1]));

            // Get access token (we need to use gapi for this)
            // For now, we'll use a workaround - request it via Google Identity Services
            const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        throw new Error(tokenResponse.error);
                    }

                    const accessToken = tokenResponse.access_token;

                    const currentUser: User = {
                        id: payload.sub,
                        email: payload.email,
                        name: payload.name,
                        picture: payload.picture,
                        accessToken,
                    };

                    setUser(currentUser);
                    await initializeApp(currentUser);
                },
            });

            tokenClient.requestAccessToken();
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to sign in');
        }
    };

    const initializeApp = async (currentUser: User) => {
        try {
            setIsSyncing(true);
            const driveService = new DriveService(currentUser.accessToken);

            // Initialize NotesData folder
            const folderId = await driveService.initializeNotesFolder();
            setNotesFolderId(folderId);

            // Get or create app metadata
            let appMetadata = await driveService.getAppMetadata(folderId);

            if (!appMetadata) {
                // First user - create metadata
                appMetadata = await driveService.createAppMetadata(folderId, currentUser.email);
            } else {
                // Check if user is allowed
                if (appMetadata.connectedUsers.length >= 2 && !appMetadata.connectedUsers.includes(currentUser.email)) {
                    throw new Error('This app already has 2 connected users. You cannot join.');
                }

                // Check if this is the invited user
                if (appMetadata.invitedUserEmail && appMetadata.invitedUserEmail === currentUser.email) {
                    // Add to connected users
                    if (!appMetadata.connectedUsers.includes(currentUser.email)) {
                        appMetadata.connectedUsers.push(currentUser.email);
                        await driveService.updateAppMetadata(folderId, appMetadata);
                    }
                } else if (!appMetadata.connectedUsers.includes(currentUser.email)) {
                    throw new Error('You are not invited to this app. Please contact the owner.');
                }
            }

            setMetadata(appMetadata);

            // Load folders and notes
            await loadData(driveService, folderId);

            setLastSyncTime(new Date().toISOString());
            localStorageService.setLastSync(new Date().toISOString());
        } catch (err: any) {
            console.error('Initialization error:', err);
            setError(err.message || 'Failed to initialize app');
            setUser(null);
        } finally {
            setIsSyncing(false);
        }
    };

    const loadData = async (driveService: DriveService, folderId: string) => {
        try {
            const [loadedFolders, rootNotes] = await Promise.all([
                driveService.listFolders(folderId),
                driveService.listNotes(folderId),
            ]);

            setFolders(loadedFolders);

            // Map root notes to have null folderId
            const mappedRootNotes = rootNotes.map(note => ({
                ...note,
                folderId: null
            }));

            // Load notes from each folder
            const folderNotesArrays = await Promise.all(
                loadedFolders.map(folder => driveService.listNotes(folder.driveId))
            );

            // Map folder notes to use local folder IDs
            const mappedFolderNotes = folderNotesArrays.flatMap((folderNotes, index) =>
                folderNotes.map(note => ({
                    ...note,
                    folderId: loadedFolders[index].id
                }))
            );

            const allNotes = [...mappedRootNotes, ...mappedFolderNotes];
            setNotes(allNotes);

            // Load comments for all notes
            const commentsMap: Record<string, Comment[]> = {};
            await Promise.all(
                allNotes.map(async (note) => {
                    const noteComments = await driveService.getComments(note.id, folderId);
                    commentsMap[note.id] = noteComments;
                })
            );
            setComments(commentsMap);

            // Cache data
            localStorageService.saveNotes(allNotes);
            localStorageService.saveFolders(loadedFolders);
            localStorageService.saveComments(commentsMap);
        } catch (err) {
            console.error('Failed to load data:', err);
        }
    };

    const handleCreateFolder = async (name: string) => {
        if (!user || !notesFolderId) return;

        try {
            const driveService = new DriveService(user.accessToken);
            const newFolder = await driveService.createFolder(notesFolderId, name);
            newFolder.createdBy = user.email;

            setFolders(prev => [...prev, newFolder]);
            localStorageService.saveFolders([...folders, newFolder]);
        } catch (err) {
            console.error('Failed to create folder:', err);
            setError('Failed to create folder');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!user) return;

        try {
            const folder = folders.find(f => f.id === folderId);
            if (!folder) return;

            const driveService = new DriveService(user.accessToken);
            await driveService.deleteFolder(folder.driveId);

            setFolders(prev => prev.filter(f => f.id !== folderId));
            setNotes(prev => prev.filter(n => n.folderId !== folderId));

            if (selectedFolderId === folderId) {
                setSelectedFolderId(null);
                setSelectedNoteId(null);
            }

            localStorageService.saveFolders(folders.filter(f => f.id !== folderId));
            localStorageService.saveNotes(notes.filter(n => n.folderId !== folderId));
        } catch (err) {
            console.error('Failed to delete folder:', err);
            setError('Failed to delete folder');
        }
    };

    const handleCreateNote = async () => {
        if (!user || !notesFolderId) return;

        // Get the correct Drive parent ID
        let parentDriveId = notesFolderId;
        if (selectedFolderId) {
            const folder = folders.find(f => f.id === selectedFolderId);
            if (folder) {
                parentDriveId = folder.driveId;
            }
        }

        try {
            const driveService = new DriveService(user.accessToken);
            const newNote = await driveService.createNote(
                parentDriveId,
                'Untitled Note',
                '',
                user.email,
                user.name
            );
            newNote.folderId = selectedFolderId;

            setNotes(prev => [...prev, newNote]);
            setSelectedNoteId(newNote.id);
            setComments(prev => ({ ...prev, [newNote.id]: [] }));

            localStorageService.saveNotes([...notes, newNote]);
        } catch (err) {
            console.error('Failed to create note:', err);
            setError('Failed to create note');
        }
    };

    const handleSaveNote = async (noteId: string, title: string, content: string) => {
        if (!user) return;

        try {
            const driveService = new DriveService(user.accessToken);
            const note = notes.find(n => n.id === noteId);
            if (!note) return;

            await driveService.updateNote(note.driveFileId, title, content);

            const updatedNotes = notes.map(n =>
                n.id === noteId
                    ? { ...n, title, content, updatedAt: new Date().toISOString() }
                    : n
            );
            setNotes(updatedNotes);
            localStorageService.saveNotes(updatedNotes);
        } catch (err) {
            console.error('Failed to save note:', err);
            setError('Failed to save note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!user) return;

        try {
            const driveService = new DriveService(user.accessToken);
            const note = notes.find(n => n.id === noteId);
            if (!note) return;

            await driveService.deleteNote(note.driveFileId);

            const updatedNotes = notes.filter(n => n.id !== noteId);
            setNotes(updatedNotes);
            setSelectedNoteId(null);

            localStorageService.saveNotes(updatedNotes);
        } catch (err) {
            console.error('Failed to delete note:', err);
            setError('Failed to delete note');
        }
    };

    const handleAddComment = async (noteId: string, content: string) => {
        if (!user || !notesFolderId) return;

        try {
            const newComment: Comment = {
                id: Date.now().toString(),
                noteId,
                content,
                createdAt: new Date().toISOString(),
                createdBy: user.email,
                createdByName: user.name,
            };

            const driveService = new DriveService(user.accessToken);
            await driveService.addComment(noteId, notesFolderId, newComment);

            const updatedComments = {
                ...comments,
                [noteId]: [...(comments[noteId] || []), newComment],
            };
            setComments(updatedComments);
            localStorageService.saveComments(updatedComments);
        } catch (err) {
            console.error('Failed to add comment:', err);
            setError('Failed to add comment');
        }
    };

    const handleInviteUser = async (email: string) => {
        if (!user || !notesFolderId || !metadata) return;

        try {
            if (metadata.connectedUsers.length >= 2) {
                setError('Maximum 2 users allowed');
                return;
            }

            if (metadata.connectedUsers.includes(email)) {
                setError('User already connected');
                return;
            }

            // Update metadata
            const updatedMetadata = {
                ...metadata,
                invitedUserEmail: email,
            };

            const driveService = new DriveService(user.accessToken);
            await driveService.updateAppMetadata(notesFolderId, updatedMetadata);

            // Share the folder
            await driveService.shareFolder(notesFolderId, email);

            setMetadata(updatedMetadata);
            alert(`Invitation sent to ${email}. They can now sign in with their Google account.`);
        } catch (err: any) {
            console.error('Failed to invite user:', err);
            setError(err.message || 'Failed to invite user');
        }
    };

    const handleLogout = () => {
        setUser(null);
        setMetadata(null);
        setNotesFolderId(null);
        setFolders([]);
        setNotes([]);
        setComments({});
        setSelectedFolderId(null);
        setSelectedNoteId(null);
        localStorageService.clearAll();
    };

    const filteredNotes = notes.filter(note => {
        if (selectedFolderId === null) return note.folderId === null || note.folderId === notesFolderId;
        return note.folderId === selectedFolderId;
    });

    const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;
    const selectedNoteComments = selectedNoteId ? (comments[selectedNoteId] || []) : [];

    const canInvite = metadata ? metadata.ownerEmail === user?.email && metadata.connectedUsers.length < 2 : false;

    if (!CLIENT_ID) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="card max-w-md text-center p-8">
                    <h1 className="text-2xl font-light text-gray-900 dark:text-gray-100 mb-4">
                        Configuration Missing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Please set up your Google OAuth Client ID in the <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env</code> file.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        See <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">.env.example</code> for instructions.
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <Auth
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError('Failed to sign in with Google')}
                />
                {error && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
                        {error}
                    </div>
                )}
            </GoogleOAuthProvider>
        );
    }

    return (
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <div className="h-screen w-screen max-w-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
                <Header
                    user={user}
                    theme={theme}
                    onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    onLogout={handleLogout}
                    onInviteUser={handleInviteUser}
                    canInvite={canInvite}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    isOnline={!isSyncing}
                    lastSyncTime={lastSyncTime}
                />

                <div className="flex-1 flex overflow-hidden min-w-0">
                    {/* Sidebar */}
                    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                        <FolderList
                            folders={folders}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={setSelectedFolderId}
                            onCreateFolder={handleCreateFolder}
                            onDeleteFolder={handleDeleteFolder}
                            currentUserEmail={user.email}
                        />
                    </aside>

                    {/* Notes List */}
                    <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                        <NoteList
                            notes={filteredNotes}
                            selectedNoteId={selectedNoteId}
                            onSelectNote={setSelectedNoteId}
                            onCreateNote={handleCreateNote}
                            searchQuery={searchQuery}
                        />
                    </div>

                    {/* Note Editor */}
                    <main className="flex-1 min-w-0 bg-white dark:bg-gray-800 p-6 overflow-y-auto">
                        {selectedNote ? (
                            <NoteEditor
                                note={selectedNote}
                                comments={selectedNoteComments}
                                currentUserEmail={user.email}
                                onSave={(title, content) => handleSaveNote(selectedNote.id, title, content)}
                                onDelete={() => {
                                    if (confirm('Delete this note?')) {
                                        handleDeleteNote(selectedNote.id);
                                    }
                                }}
                                onAddComment={(content) => handleAddComment(selectedNote.id, content)}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <div className="text-center">
                                    <p className="text-xl font-light mb-2">Select a note to view</p>
                                    <p className="text-sm">or create a new one</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Error Toast */}
                {error && (
                    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-md shadow-lg max-w-md">
                        <div className="flex items-start justify-between gap-3">
                            <p className="text-sm">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-white hover:text-gray-200 font-bold"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </GoogleOAuthProvider>
    );
}

export default App;
