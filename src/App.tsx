import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Header } from './components/Header';
import { FolderList } from './components/FolderList';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { SupabaseService } from './services/supabaseService';
import { User, Folder, Note, Comment, ThemeMode } from './types';
import './index.css';

const supabaseService = new SupabaseService();

function App() {
    const [user, setUser] = useState<User | null>(null);
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
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

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

    // Parse URL for deep linking
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const folderId = params.get('folderId');
        const noteId = params.get('noteId');

        if (folderId) setSelectedFolderId(folderId);
        if (noteId) setSelectedNoteId(noteId);
    }, []);

    // Handle Auth Session
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const currentUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    picture: session.user.user_metadata.avatar_url,
                    accessToken: session.access_token,
                };
                setUser(currentUser);
                loadData(currentUser.email);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const currentUser: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
                    picture: session.user.user_metadata.avatar_url,
                    accessToken: session.access_token,
                };
                setUser(currentUser);
                loadData(currentUser.email);
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadData = async (userEmail?: string) => {
        const email = userEmail || user?.email;
        if (!email) return;

        try {
            setIsSyncing(true);
            const [loadedFolders, loadedNotes] = await Promise.all([
                supabaseService.getFolders(email),
                supabaseService.getNotes(email),
            ]);

            setFolders(loadedFolders);
            setNotes(loadedNotes);

            // Load comments for selected note if any
            if (selectedNoteId) {
                const noteComments = await supabaseService.getComments(selectedNoteId);
                setComments(prev => ({ ...prev, [selectedNoteId]: noteComments }));
            }

            setLastSyncTime(new Date().toISOString());
        } catch (err: any) {
            console.error('Initialization error:', err);
            setError(err.message || 'Failed to sync data');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateFolder = async (name: string) => {
        if (!user) return;
        try {
            const newFolder = await supabaseService.createFolder(name, user.email);
            setFolders(prev => [...prev, newFolder]);
        } catch (err) {
            console.error('Failed to create folder:', err);
            setError('Failed to create folder');
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        if (!user) return;
        try {
            await supabaseService.deleteFolder(folderId);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            setNotes(prev => prev.filter(n => n.folderId !== folderId));
            if (selectedFolderId === folderId) {
                setSelectedFolderId(null);
                setSelectedNoteId(null);
            }
        } catch (err) {
            console.error('Failed to delete folder:', err);
            setError('Failed to delete folder');
        }
    };

    const handleCreateNote = async () => {
        if (!user) return;
        try {
            const newNote = await supabaseService.createNote(
                selectedFolderId,
                'Untitled Note',
                '',
                user.email,
                user.name
            );
            setNotes(prev => [newNote, ...prev]);
            setSelectedNoteId(newNote.id);
        } catch (err) {
            console.error('Failed to create note:', err);
            setError('Failed to create note');
        }
    };

    const handleSaveNote = async (noteId: string, title: string, content: string) => {
        if (!user) return;
        try {
            const updatedNote = await supabaseService.updateNote(noteId, title, content);
            setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n));
        } catch (err) {
            console.error('Failed to save note:', err);
            setError('Failed to save note');
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!user) return;
        try {
            await supabaseService.deleteNote(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
            setSelectedNoteId(null);
        } catch (err) {
            console.error('Failed to delete note:', err);
            setError('Failed to delete note');
        }
    };

    const handleInviteUser = async (email: string) => {
        if (!user) return;
        const productionUrl = 'https://jotdowntogether.nandanadileep.com';

        const folder = folders.find(f => f.id === selectedFolderId);
        const note = notes.find(n => n.id === selectedNoteId);

        try {
            let subject = '';
            let body = '';

            if (selectedFolderId && folder) {
                await supabaseService.shareFolder(selectedFolderId, email);
                const shareLink = `${productionUrl}?folderId=${selectedFolderId}`;
                subject = `I shared a folder with you: ${folder.name}`;
                body = `Hey! I've shared my folder "${folder.name}" with you on Just Note-taLking.\n\nClick here to view it and all notes inside: ${shareLink}\n\n(Sign in with ${email} to see it!)`;
            } else if (selectedNoteId && note) {
                await supabaseService.shareNote(selectedNoteId, email);
                const shareLink = `${productionUrl}?noteId=${selectedNoteId}`;
                subject = `I shared a note with you: ${note.title || 'Untitled'}`;
                body = `Hey! I've shared my note "${note.title || 'Untitled'}" with you on Just Note-taLking.\n\nClick here to view it: ${shareLink}\n\n(Sign in with ${email} to see it!)`;
            } else {
                // Global invite: Just copy link
                navigator.clipboard.writeText(productionUrl);
                alert(`App link copied! Send this to your friend: ${productionUrl}`);
                setInviteEmail('');
                setShowInviteModal(false);
                return;
            }

            // Open email client with specific context
            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            setError("Successfully shared! 🚀");
            setTimeout(() => setError(null), 3000);
            setInviteEmail('');
            setShowInviteModal(false);
            loadData();
        } catch (err) {
            console.error('Failed to share:', err);
            setError('Failed to share! Did you run the SQL in Supabase to add the sharing columns?');
        }
    };

    const handleAddComment = async (noteId: string, content: string) => {
        if (!user) return;
        try {
            const newComment = await supabaseService.addComment(noteId, content, user.email, user.name);
            setComments(prev => ({
                ...prev,
                [noteId]: [...(prev[noteId] || []), newComment]
            }));
        } catch (err) {
            console.error('Failed to add comment:', err);
            setError('Failed to add comment');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setFolders([]);
        setNotes([]);
        setComments({});
        setSelectedFolderId(null);
        setSelectedNoteId(null);
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase());

        // If All Notes is selected (null), show everything. Otherwise, match folder ID.
        const matchesFolder = selectedFolderId === null ? true : (note.folderId === selectedFolderId);

        return matchesSearch && matchesFolder;
    });

    const selectedNote = selectedNoteId ? notes.find(n => n.id === selectedNoteId) : null;

    useEffect(() => {
        if (selectedNoteId && !comments[selectedNoteId]) {
            supabaseService.getComments(selectedNoteId).then(noteComments => {
                setComments(prev => ({ ...prev, [selectedNoteId]: noteComments }));
            });
        }
    }, [selectedNoteId]);

    const selectedNoteComments = selectedNoteId ? (comments[selectedNoteId] || []) : [];

    if (!user) {
        return (
            <>
                <Auth />
                {error && (
                    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-[100]">
                        {error}
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="h-screen w-screen max-w-full flex flex-col bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
            <Header
                user={user}
                theme={theme}
                onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                onLogout={handleLogout}
                onOpenInvite={() => {
                    setSelectedFolderId(null);
                    setSelectedNoteId(null);
                    setShowInviteModal(true);
                }}
                canInvite={true}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isOnline={!isSyncing}
                lastSyncTime={lastSyncTime}
            />

            <div className="flex-1 flex overflow-hidden min-w-0">
                <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                    <FolderList
                        folders={folders}
                        selectedFolderId={selectedFolderId}
                        onSelectFolder={setSelectedFolderId}
                        onCreateFolder={handleCreateFolder}
                        onDeleteFolder={handleDeleteFolder}
                        onShareFolder={(id) => {
                            setSelectedFolderId(id);
                            setSelectedNoteId(null);
                            setShowInviteModal(true);
                        }}
                        currentUserEmail={user.email}
                    />
                </aside>

                <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                    <NoteList
                        notes={filteredNotes}
                        selectedNoteId={selectedNoteId}
                        onSelectNote={setSelectedNoteId}
                        onCreateNote={handleCreateNote}
                        searchQuery={searchQuery}
                    />
                </div>

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
                            onShare={() => setShowInviteModal(true)}
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

            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full p-6">
                        <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-4">
                            {(() => {
                                const folder = folders.find(f => f.id === selectedFolderId);
                                const note = notes.find(n => n.id === selectedNoteId);
                                if (folder) return `Share Folder: ${folder.name}`;
                                if (note) return `Share Note: ${note.title || 'Untitled'}`;
                                return 'Invite Friend';
                            })()}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {(() => {
                                if (selectedFolderId) return `Enter an email to give them access to this folder and ALL notes inside it.`;
                                if (selectedNoteId) return `Enter an email to give them access to this specific note.`;
                                return 'Enter your friend\'s email to send them a magic link to join your workspace.';
                            })()}
                        </p>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInviteUser(inviteEmail);
                                if (e.key === 'Escape') setShowInviteModal(false);
                            }}
                            placeholder="email@gmail.com"
                            className="input-field mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button onClick={() => handleInviteUser(inviteEmail)} className="btn-primary flex-1">
                                Send Invite
                            </button>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-md shadow-lg max-w-md z-[100]">
                    <div className="flex items-start justify-between gap-3">
                        <p className="text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="text-white hover:text-gray-200 font-bold">×</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
