import React, { useState } from 'react';
import { Folder as FolderIcon, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { Folder } from '../types';

interface FolderListProps {
    folders: Folder[];
    selectedFolderId: string | null;
    onSelectFolder: (folderId: string | null) => void;
    onCreateFolder: (name: string) => void;
    onDeleteFolder: (folderId: string) => void;
    currentUserEmail: string;
}

export const FolderList: React.FC<FolderListProps> = ({
    folders,
    selectedFolderId,
    onSelectFolder,
    onCreateFolder,
    onDeleteFolder,
    currentUserEmail,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const handleCreate = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Folders
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-1 hover:bg-purple-50 dark:hover:bg-gray-700 rounded transition-colors"
                    title="New folder"
                >
                    <Plus size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            {/* All Notes (Root) */}
            <div
                onClick={() => onSelectFolder(null)}
                className={`sidebar-item flex items-center justify-between group ${selectedFolderId === null ? 'sidebar-item-active' : ''
                    }`}
            >
                <div className="flex items-center gap-2">
                    <FolderIcon size={16} />
                    <span className="text-sm">All Notes</span>
                </div>
            </div>

            {/* Folder List */}
            {folders.map((folder) => (
                <div
                    key={folder.id}
                    className={`sidebar-item flex items-center justify-between group ${selectedFolderId === folder.id ? 'sidebar-item-active' : ''
                        }`}
                >
                    <div
                        onClick={() => onSelectFolder(folder.id)}
                        className="flex items-center gap-2 flex-1 cursor-pointer"
                    >
                        <ChevronRight size={14} className="text-gray-400" />
                        <FolderIcon size={16} />
                        <span className="text-sm">{folder.name}</span>
                    </div>
                    {folder.createdBy === currentUserEmail && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete folder "${folder.name}"?`)) {
                                    onDeleteFolder(folder.id);
                                }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                            title="Delete folder"
                        >
                            <Trash2 size={14} className="text-red-500" />
                        </button>
                    )}
                </div>
            ))}

            {/* Create New Folder */}
            {isCreating && (
                <div className="card p-2 space-y-2">
                    <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') setIsCreating(false);
                        }}
                        placeholder="Folder name"
                        className="input-field text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button onClick={handleCreate} className="btn-primary text-xs flex-1">
                            Create
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
