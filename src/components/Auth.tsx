import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthProps {
    onSuccess: (credentialResponse: CredentialResponse) => void;
    onError: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onError }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-gray-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="card max-w-md w-full mx-4 text-center p-8">
                <h1 className="text-4xl font-light text-gray-800 dark:text-gray-100 mb-2">
                    Just Notes
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">
                    Simple, collaborative note-taking for two
                </p>

                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={onSuccess}
                        onError={onError}
                        useOneTap
                        theme="outline"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                    />
                </div>

                <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
                    Notes are stored in your Google Drive
                </p>
            </div>
        </div>
    );
};
