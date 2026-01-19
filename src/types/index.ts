// Core data types for Just Notes

export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    accessToken: string;
}

export interface AppMetadata {
    ownerEmail: string;
    invitedUserEmail: string | null;
    connectedUsers: string[]; // Array of emails (max 2)
    createdAt: string;
}

export interface Folder {
    id: string;
    name: string;
    driveId: string; // Google Drive folder ID
    createdAt: string;
    createdBy: string; // user email
}

export interface Note {
    id: string;
    folderId: string | null; // null for root notes
    title: string;
    content: string;
    driveFileId: string; // Google Drive file ID
    createdAt: string;
    updatedAt: string;
    createdBy: string; // user email
    createdByName: string;
}

export interface Comment {
    id: string;
    noteId: string;
    content: string;
    createdAt: string;
    createdBy: string; // user email
    createdByName: string;
}

export interface SyncStatus {
    isSyncing: boolean;
    lastSyncTime: string | null;
    error: string | null;
}

export type ThemeMode = 'light' | 'dark';

export interface AppState {
    user: User | null;
    metadata: AppMetadata | null;
    folders: Folder[];
    notes: Note[];
    comments: Record<string, Comment[]>; // noteId -> comments
    selectedFolderId: string | null;
    selectedNoteId: string | null;
    theme: ThemeMode;
    syncStatus: SyncStatus;
    searchQuery: string;
}
