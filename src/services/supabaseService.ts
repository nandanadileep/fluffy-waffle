import { supabase } from '../lib/supabase';
import { Folder, Note, Comment } from '../types';

export class SupabaseService {
    private mapFolder(data: any): Folder {
        return {
            id: data.id,
            name: data.name,
            createdAt: data.created_at,
            createdBy: data.created_by
        };
    }

    private mapNote(data: any): Note {
        return {
            id: data.id,
            folderId: data.folder_id,
            title: data.title,
            content: data.content,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            createdBy: data.created_by,
            createdByName: data.created_by_name
        };
    }

    private mapComment(data: any): Comment {
        return {
            id: data.id,
            noteId: data.note_id,
            content: data.content,
            createdAt: data.created_at,
            createdBy: data.created_by,
            createdByName: data.created_by_name
        };
    }

    async getFolders() {
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.mapFolder);
    }

    async createFolder(name: string, email: string) {
        const { data, error } = await supabase
            .from('folders')
            .insert([{ name, created_by: email, user_id: (await supabase.auth.getUser()).data.user?.id }])
            .select()
            .single();

        if (error) throw error;
        return this.mapFolder(data);
    }

    async deleteFolder(id: string) {
        const { error } = await supabase
            .from('folders')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getNotes() {
        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapNote);
    }

    async createNote(folderId: string | null, title: string, content: string, email: string, name: string) {
        const { data, error } = await supabase
            .from('notes')
            .insert([{
                folder_id: folderId,
                title,
                content,
                created_by: email,
                created_by_name: name,
                user_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapNote(data);
    }

    async updateNote(id: string, title: string, content: string) {
        const { data, error } = await supabase
            .from('notes')
            .update({ title, content, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return this.mapNote(data);
    }

    async deleteNote(id: string) {
        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async getComments(noteId: string) {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('note_id', noteId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.mapComment);
    }

    async addComment(noteId: string, content: string, email: string, name: string) {
        const { data, error } = await supabase
            .from('comments')
            .insert([{
                note_id: noteId,
                content,
                created_by: email,
                created_by_name: name,
                user_id: (await supabase.auth.getUser()).data.user?.id
            }])
            .select()
            .single();

        if (error) throw error;
        return this.mapComment(data);
    }
}
