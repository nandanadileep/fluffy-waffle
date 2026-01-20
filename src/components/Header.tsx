import React, { useState } from 'react';
import { Search, Moon, Sun, LogOut, UserPlus, Wifi, WifiOff } from 'lucide-react';
import { User, ThemeMode } from '../types';

interface HeaderProps {
    user: User;
    theme: ThemeMode;
    onToggleTheme: () => void;
    onLogout: () => void;
    onInviteUser: (email: string) => void;
    canInvite: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    isOnline: boolean;
    lastSyncTime: string | null;
}

export const Header: React.FC<HeaderProps> = ({
    user,
    theme,
    onToggleTheme,
    onLogout,
    onInviteUser,
    canInvite,
    searchQuery,
    onSearchChange,
    isOnline,
    lastSyncTime,
}) => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInvite = () => {
        if (inviteEmail.trim()) {
            onInviteUser(inviteEmail.trim());
            setInviteEmail('');
            setShowInviteModal(false);
        }
    };

    const formatSyncTime = (time: string | null) => {
        if (!time) return 'Never';
        const date = new Date(time);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        return date.toLocaleTimeString();
    };

    return (
        <>
            <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    {/* Left: Title */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-light text-gray-900 dark:text-gray-100">
                            Just Notes
                        </h1>
                        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {isOnline ? (
                                <Wifi size={12} className="text-green-500" />
                            ) : (
                                <WifiOff size={12} className="text-red-500" />
                            )}
                            <span>Last sync: {formatSyncTime(lastSyncTime)}</span>
                        </div>
                    </div>

                    {/* Center: Search */}
                    <div className="flex-1 max-w-md min-w-0">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Search notes..."
                                className="input-field pl-10 text-sm w-full"
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {canInvite && (
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="btn-secondary flex items-center gap-2 text-sm"
                                title="Invite user"
                            >
                                <UserPlus size={16} />
                                Invite
                            </button>
                        )}

                        <button
                            onClick={onToggleTheme}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? (
                                <Moon size={20} className="text-gray-600 dark:text-gray-400" />
                            ) : (
                                <Sun size={20} className="text-gray-400" />
                            )}
                        </button>

                        <div className="flex items-center gap-2 ml-2">
                            <img
                                src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3e8ff&color=6b7280`}
                                alt={user.name}
                                className="w-8 h-8 rounded-full"
                            />
                            <button
                                onClick={onLogout}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                                title="Logout"
                            >
                                <LogOut size={18} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full p-6">
                        <h2 className="text-xl font-light text-gray-900 dark:text-gray-100 mb-4">
                            Invite User
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Enter the Google email address of the person you want to collaborate with.
                            They will get access to all notes and folders.
                        </p>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInvite();
                                if (e.key === 'Escape') setShowInviteModal(false);
                            }}
                            placeholder="email@gmail.com"
                            className="input-field mb-4"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button onClick={handleInvite} className="btn-primary flex-1">
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
        </>
    );
};
