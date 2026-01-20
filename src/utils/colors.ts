// Utility function to generate consistent pastel colors
export const getPastelColor = (id: string): { bg: string; border: string; text: string } => {
    // Pastel color palette with light and dark mode variants
    const pastelColors = [
        {
            bg: 'bg-pink-50 dark:bg-pink-900/10',
            border: 'border-pink-200 dark:border-pink-800/30',
            text: 'text-pink-900 dark:text-pink-100'
        },
        {
            bg: 'bg-purple-50 dark:bg-purple-900/10',
            border: 'border-purple-200 dark:border-purple-800/30',
            text: 'text-purple-900 dark:text-purple-100'
        },
        {
            bg: 'bg-blue-50 dark:bg-blue-900/10',
            border: 'border-blue-200 dark:border-blue-800/30',
            text: 'text-blue-900 dark:text-blue-100'
        },
        {
            bg: 'bg-cyan-50 dark:bg-cyan-900/10',
            border: 'border-cyan-200 dark:border-cyan-800/30',
            text: 'text-cyan-900 dark:text-cyan-100'
        },
        {
            bg: 'bg-teal-50 dark:bg-teal-900/10',
            border: 'border-teal-200 dark:border-teal-800/30',
            text: 'text-teal-900 dark:text-teal-100'
        },
        {
            bg: 'bg-green-50 dark:bg-green-900/10',
            border: 'border-green-200 dark:border-green-800/30',
            text: 'text-green-900 dark:text-green-100'
        },
        {
            bg: 'bg-lime-50 dark:bg-lime-900/10',
            border: 'border-lime-200 dark:border-lime-800/30',
            text: 'text-lime-900 dark:text-lime-100'
        },
        {
            bg: 'bg-yellow-50 dark:bg-yellow-900/10',
            border: 'border-yellow-200 dark:border-yellow-800/30',
            text: 'text-yellow-900 dark:text-yellow-100'
        },
        {
            bg: 'bg-orange-50 dark:bg-orange-900/10',
            border: 'border-orange-200 dark:border-orange-800/30',
            text: 'text-orange-900 dark:text-orange-100'
        },
        {
            bg: 'bg-rose-50 dark:bg-rose-900/10',
            border: 'border-rose-200 dark:border-rose-800/30',
            text: 'text-rose-900 dark:text-rose-100'
        },
        {
            bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/10',
            border: 'border-fuchsia-200 dark:border-fuchsia-800/30',
            text: 'text-fuchsia-900 dark:text-fuchsia-100'
        },
        {
            bg: 'bg-indigo-50 dark:bg-indigo-900/10',
            border: 'border-indigo-200 dark:border-indigo-800/30',
            text: 'text-indigo-900 dark:text-indigo-100'
        },
        {
            bg: 'bg-violet-50 dark:bg-violet-900/10',
            border: 'border-violet-200 dark:border-violet-800/30',
            text: 'text-violet-900 dark:text-violet-100'
        },
        {
            bg: 'bg-sky-50 dark:bg-sky-900/10',
            border: 'border-sky-200 dark:border-sky-800/30',
            text: 'text-sky-900 dark:text-sky-100'
        },
        {
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
            border: 'border-emerald-200 dark:border-emerald-800/30',
            text: 'text-emerald-900 dark:text-emerald-100'
        },
        {
            bg: 'bg-amber-50 dark:bg-amber-900/10',
            border: 'border-amber-200 dark:border-amber-800/30',
            text: 'text-amber-900 dark:text-amber-100'
        }
    ];

    // Generate a consistent index based on the ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;

    return pastelColors[index];
};
