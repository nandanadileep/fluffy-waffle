import { Note, Folder, Comment } from '../types';

const STORAGE_KEYS = {
    NOTES: 'just-notes-cache-notes',
    FOLDERS: 'just-notes-cache-folders',
    COMMENTS: 'just-notes-cache-comments',
    LAST_SYNC: 'just-notes-last-sync',
};

export const localStorageService = {
    // Notes
    saveNotes(notes: Note[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
        } catch (error) {
            console.error('Failed to save notes to localStorage:', error);
        }
    },

    getNotes(): Note[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.NOTES);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get notes from localStorage:', error);
            return [];
        }
    },

    // Folders
    saveFolders(folders: Folder[]): void {
        try {
            localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
        } catch (error) {
            console.error('Failed to save folders to localStorage:', error);
        }
    },

    getFolders(): Folder[] {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get folders from localStorage:', error);
            return [];
        }
    },

    // Comments
    saveComments(comments: Record<string, Comment[]>): void {
        try {
            localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
        } catch (error) {
            console.error('Failed to save comments to localStorage:', error);
        }
    },

    getComments(): Record<string, Comment[]> {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to get comments from localStorage:', error);
            return {};
        }
    },

    // Last sync time
    setLastSync(timestamp: string): void {
        try {
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
        } catch (error) {
            console.error('Failed to save last sync time:', error);
        }
    },

    getLastSync(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
        } catch (error) {
            console.error('Failed to get last sync time:', error);
            return null;
        }
    },

    // Clear all cached data
    clearAll(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    },
};
