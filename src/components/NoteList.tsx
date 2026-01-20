import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Note } from '../types';
import { getPastelColor } from '../utils/colors';

interface NoteListProps {
    notes: Note[];
    selectedNoteId: string | null;
    onSelectNote: (noteId: string) => void;
    onCreateNote: () => void;
    searchQuery: string;
}

export const NoteList: React.FC<NoteListProps> = ({
    notes,
    selectedNoteId,
    onSelectNote,
    onCreateNote,
    searchQuery,
}) => {
    const filteredNotes = notes.filter((note) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-gray-800 dark:text-gray-200">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                </h2>
                <button onClick={onCreateNote} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} />
                    New Note
                </button>
            </div>

            {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-30" />
                    <p className="font-light">
                        {searchQuery ? 'No notes found' : 'No notes yet'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredNotes.map((note) => {
                        const colors = getPastelColor(note.id);
                        return (
                            <div
                                key={note.id}
                                onClick={() => onSelectNote(note.id)}
                                className={`${colors.bg} border ${colors.border} rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${selectedNoteId === note.id
                                        ? 'ring-2 ring-purple-300 dark:ring-purple-500/40 scale-[1.02]'
                                        : ''
                                    }`}
                            >
                                <h3 className={`font-medium ${colors.text} mb-2`}>
                                    {note.title || 'Untitled'}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                    {note.content || 'No content'}
                                </p>
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>{note.createdByName}</span>
                                    <span>{formatDate(note.updatedAt)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
