export function VersionBadge() {
    return (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-landing-surface-light dark:bg-landing-surface-dark border border-gray-200 dark:border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-mono font-semibold">Version 1.0.0 • Closed Beta</span>
        </div>
    );
}