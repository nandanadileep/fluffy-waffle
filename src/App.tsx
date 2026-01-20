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
                loadData();
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
                loadData();
            } else {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadData = async () => {
        try {
            setIsSyncing(true);
            const [loadedFolders, loadedNotes] = await Promise.all([
                supabaseService.getFolders(),
                supabaseService.getNotes(),
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
        const matchesFolder = selectedFolderId === null ? note.folderId === null : note.folderId === selectedFolderId;
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
                onInviteUser={() => {
                    const url = window.location.origin;
                    navigator.clipboard.writeText(url);
                    alert(`App URL copied! Send this to your friend: ${url}`);
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
