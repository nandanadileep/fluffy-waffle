import { useState, useEffect } from 'react';
import { Save, Trash2, MessageCircle, Send } from 'lucide-react';
import { Note, Comment } from '../types';
import { getPastelColor } from '../utils/colors';

interface NoteEditorProps {
    note: Note;
    comments: Comment[];
    currentUserEmail: string;
    onSave: (title: string, content: string) => void;
    onDelete: () => void;
    onAddComment: (content: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
    note,
    comments,
    currentUserEmail,
    onSave,
    onDelete,
    onAddComment,
}) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [newComment, setNewComment] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isOwnNote = note.createdBy === currentUserEmail;

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setHasChanges(false);
    }, [note.id]);

    useEffect(() => {
        const changed = title !== note.title || content !== note.content;
        setHasChanges(changed);
    }, [title, content, note.title, note.content]);

    const handleSave = async () => {
        if (!hasChanges || !isOwnNote) return;

        setIsSaving(true);
        try {
            await onSave(title, content);
            setHasChanges(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {/* Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title"
                        className="text-2xl font-light w-full bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        disabled={!isOwnNote}
                    />
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span>By {note.createdByName}</span>
                        <span>•</span>
                        <span>Created {formatDate(note.createdAt)}</span>
                        {note.updatedAt !== note.createdAt && (
                            <>
                                <span>•</span>
                                <span>Updated {formatDate(note.updatedAt)}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your note here..."
                        className="w-full min-h-[300px] bg-transparent border-none outline-none resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 font-light leading-relaxed"
                        disabled={!isOwnNote}
                    />
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <MessageCircle size={18} className="text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                            Comments ({comments.length})
                        </h3>
                    </div>

                    <div className="space-y-3 mb-4">
                        {comments.map((comment) => {
                            const colors = getPastelColor(comment.id);
                            return (
                                <div key={comment.id} className={`${colors.bg} border ${colors.border} rounded-lg p-3`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-xs font-medium ${colors.text}`}>
                                            {comment.createdByName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatDate(comment.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-200 font-light">
                                        {comment.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Comment */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment();
                                }
                            }}
                            placeholder="Add a comment..."
                            className="input-field flex-1 text-sm"
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="btn-secondary px-3"
                            title="Send comment"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 flex items-center justify-between">
                {isOwnNote && (
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all text-sm font-medium flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                )}
                {!isOwnNote && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Read-only (not your note)
                    </span>
                )}

                {isOwnNote && (
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`btn-primary flex items-center gap-2 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Save size={16} />
                        {isSaving ? 'Saving...' : hasChanges ? 'Save' : 'Saved'}
                    </button>
                )}
            </div>
        </div>
    );
};
