import { Folder, Note, Comment, AppMetadata } from '../types';

const NOTES_FOLDER_NAME = 'NotesData';
const METADATA_FILE_NAME = '.app_metadata.json';

export class DriveService {
    private accessToken: string;

    constructor(accessToken: string) {
        this.accessToken = accessToken;
    }

    private async makeRequest(url: string, options: RequestInit = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
            throw new Error(error.error?.message || 'Drive API request failed');
        }

        // DELETE requests return 204 No Content, so don't try to parse JSON
        if (response.status === 204 || options.method === 'DELETE') {
            return {};
        }

        return response.json();
    }

    // Initialize the NotesData folder structure
    async initializeNotesFolder(): Promise<string> {
        // Check if NotesData folder exists
        const query = `name='${NOTES_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

        const searchResult = await this.makeRequest(searchUrl);

        if (searchResult.files && searchResult.files.length > 0) {
            return searchResult.files[0].id;
        }

        // Create NotesData folder
        const createUrl = 'https://www.googleapis.com/drive/v3/files';
        const folderMetadata = {
            name: NOTES_FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
        };

        const result = await this.makeRequest(createUrl, {
            method: 'POST',
            body: JSON.stringify(folderMetadata),
        });

        return result.id;
    }

    // Get or create app metadata file
    async getAppMetadata(notesFolderId: string): Promise<AppMetadata | null> {
        const query = `name='${METADATA_FILE_NAME}' and '${notesFolderId}' in parents and trashed=false`;
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;

        const searchResult = await this.makeRequest(searchUrl);

        if (searchResult.files && searchResult.files.length > 0) {
            const fileId = searchResult.files[0].id;
            const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            const content = await fetch(downloadUrl, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` },
            }).then(res => res.json());

            return content;
        }

        return null;
    }

    // Create app metadata
    async createAppMetadata(notesFolderId: string, ownerEmail: string): Promise<AppMetadata> {
        const metadata: AppMetadata = {
            ownerEmail,
            invitedUserEmail: null,
            connectedUsers: [ownerEmail],
            createdAt: new Date().toISOString(),
        };

        const fileMetadata = {
            name: METADATA_FILE_NAME,
            parents: [notesFolderId],
            mimeType: 'application/json',
        };

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            closeDelimiter;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
        });

        if (!response.ok) {
            throw new Error('Failed to create metadata');
        }

        return metadata;
    }

    // Update app metadata
    async updateAppMetadata(notesFolderId: string, metadata: AppMetadata): Promise<void> {
        const query = `name='${METADATA_FILE_NAME}' and '${notesFolderId}' in parents and trashed=false`;
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;

        const searchResult = await this.makeRequest(searchUrl);

        if (!searchResult.files || searchResult.files.length === 0) {
            throw new Error('Metadata file not found');
        }

        const fileId = searchResult.files[0].id;
        const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;

        await fetch(uploadUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        });
    }

    // Share NotesData folder with another user
    async shareFolder(folderId: string, email: string): Promise<void> {
        const permissionUrl = `https://www.googleapis.com/drive/v3/files/${folderId}/permissions`;

        await this.makeRequest(permissionUrl, {
            method: 'POST',
            body: JSON.stringify({
                type: 'user',
                role: 'writer',
                emailAddress: email,
            }),
        });
    }

    // Create a new folder inside NotesData
    async createFolder(notesFolderId: string, folderName: string): Promise<Folder> {
        const folderMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [notesFolderId],
        };

        const result = await this.makeRequest('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            body: JSON.stringify(folderMetadata),
        });

        return {
            id: result.id,
            name: folderName,
            driveId: result.id,
            createdAt: new Date().toISOString(),
            createdBy: '', // Will be set by caller
        };
    }

    // List all folders in NotesData
    async listFolders(notesFolderId: string): Promise<Folder[]> {
        const query = `'${notesFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,properties)`;

        const result = await this.makeRequest(url);

        return (result.files || []).map((file: any) => ({
            id: file.id,
            name: file.name,
            driveId: file.id,
            createdAt: file.createdTime,
            createdBy: file.properties?.createdBy || '',
        }));
    }

    // Create a note (text file)
    async createNote(parentId: string, title: string, content: string, createdBy: string, createdByName: string): Promise<Note> {
        const fileMetadata = {
            name: `${title}.txt`,
            parents: [parentId],
            mimeType: 'text/plain',
            properties: {
                createdBy,
                createdByName,
                noteTitle: title,
            },
        };

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelimiter = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(fileMetadata) +
            delimiter +
            'Content-Type: text/plain\r\n\r\n' +
            content +
            closeDelimiter;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,modifiedTime,properties', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`,
            },
            body: multipartRequestBody,
        });

        if (!response.ok) {
            throw new Error('Failed to create note');
        }

        const result = await response.json();

        return {
            id: result.id,
            folderId: parentId,
            title,
            content,
            driveFileId: result.id,
            createdAt: result.createdTime,
            updatedAt: result.modifiedTime,
            createdBy,
            createdByName,
        };
    }

    // List notes in a folder or root
    async listNotes(parentId: string): Promise<Note[]> {
        const query = `'${parentId}' in parents and mimeType='text/plain' and trashed=false`;
        const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,modifiedTime,properties)`;

        const result = await this.makeRequest(url);

        const notes: Note[] = [];

        for (const file of (result.files || [])) {
            const content = await this.getNoteContent(file.id);
            const title = file.properties?.noteTitle || file.name.replace('.txt', '');

            notes.push({
                id: file.id,
                folderId: parentId,
                title,
                content,
                driveFileId: file.id,
                createdAt: file.createdTime,
                updatedAt: file.modifiedTime,
                createdBy: file.properties?.createdBy || '',
                createdByName: file.properties?.createdByName || '',
            });
        }

        return notes;
    }

    // Get note content
    async getNoteContent(fileId: string): Promise<string> {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        });

        return response.text();
    }

    // Update note content
    async updateNote(fileId: string, title: string, content: string): Promise<void> {
        // Update metadata (title)
        await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                name: `${title}.txt`,
                properties: {
                    noteTitle: title,
                },
            }),
        });

        // Update content
        const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        await fetch(uploadUrl, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'text/plain',
            },
            body: content,
        });
    }

    // Delete note
    async deleteNote(fileId: string): Promise<void> {
        await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            method: 'DELETE',
        });
    }

    // Delete folder
    async deleteFolder(folderId: string): Promise<void> {
        await this.makeRequest(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
            method: 'DELETE',
        });
    }

    // Comments are stored as custom properties or separate files
    // For simplicity, we'll use a separate JSON file per note
    async getComments(noteId: string, notesFolderId: string): Promise<Comment[]> {
        const commentsFileName = `.comments_${noteId}.json`;
        const query = `name='${commentsFileName}' and '${notesFolderId}' in parents and trashed=false`;
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;

        const searchResult = await this.makeRequest(searchUrl);

        if (!searchResult.files || searchResult.files.length === 0) {
            return [];
        }

        const fileId = searchResult.files[0].id;
        const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const content = await fetch(downloadUrl, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` },
        }).then(res => res.json());

        return content.comments || [];
    }

    async addComment(noteId: string, notesFolderId: string, comment: Comment): Promise<void> {
        const commentsFileName = `.comments_${noteId}.json`;
        const query = `name='${commentsFileName}' and '${notesFolderId}' in parents and trashed=false`;
        const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;

        const searchResult = await this.makeRequest(searchUrl);

        let fileId: string;
        let comments: Comment[] = [];

        if (searchResult.files && searchResult.files.length > 0) {
            // File exists, update it
            fileId = searchResult.files[0].id;
            comments = await this.getComments(noteId, notesFolderId);
            comments.push(comment);

            const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
            await fetch(uploadUrl, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comments }),
            });
        } else {
            // Create new comments file
            comments = [comment];
            const fileMetadata = {
                name: commentsFileName,
                parents: [notesFolderId],
                mimeType: 'application/json',
            };

            const boundary = '-------314159265358979323846';
            const delimiter = "\r\n--" + boundary + "\r\n";
            const closeDelimiter = "\r\n--" + boundary + "--";

            const multipartRequestBody =
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(fileMetadata) +
                delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify({ comments }) +
                closeDelimiter;

            await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': `multipart/related; boundary="${boundary}"`,
                },
                body: multipartRequestBody,
            });
        }
    }
}
