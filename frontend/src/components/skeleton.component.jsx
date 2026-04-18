import { motion } from "framer-motion";

export const BlogCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-grey/50 dark:border-zinc-800 p-5 mb-6 shadow-sm overflow-hidden relative">
            {/* Shimmer Effect wrapper */}
            <div className="animate-pulse">
                {/* Banner Placeholder */}
                <div className="w-full h-48 bg-grey/30 dark:bg-zinc-800/50 rounded-2xl mb-5" />

                {/* Author Info */}
                <div className="flex gap-3 items-center mb-4">
                    <div className="w-9 h-9 rounded-full bg-grey/30 dark:bg-zinc-800/50" />
                    <div className="flex flex-col gap-2">
                        <div className="w-32 h-3 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                        <div className="w-24 h-2 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                    </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-3 mb-4">
                    <div className="w-full h-5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                    <div className="w-3/4 h-5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                    
                    <div className="pt-2">
                        <div className="w-full h-3 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                        <div className="w-full h-3 bg-grey/20 dark:bg-zinc-800/30 rounded-full mt-2" />
                    </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 mb-4">
                    <div className="w-16 h-6 bg-purple/10 dark:bg-purple/5 rounded-full" />
                    <div className="w-20 h-6 bg-purple/10 dark:bg-purple/5 rounded-full" />
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-grey dark:border-zinc-800">
                    <div className="flex gap-4">
                        <div className="w-12 h-6 bg-grey/20 dark:bg-zinc-800/30 rounded-lg" />
                        <div className="w-12 h-6 bg-grey/20 dark:bg-zinc-800/30 rounded-lg" />
                    </div>
                    <div className="w-16 h-4 bg-purple/10 dark:bg-purple/5 rounded-full" />
                </div>
            </div>
            
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};

export const MinimalBlogSkeleton = () => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-grey/30 dark:border-zinc-800 p-4 mb-2 shadow-sm overflow-hidden relative">
            <div className="animate-pulse flex gap-3">
                {/* Index Placeholder */}
                <div className="w-8 h-8 rounded-lg bg-purple/10 dark:bg-purple/5 flex-shrink-0" />
                
                <div className="flex-1 space-y-3">
                    {/* Author & Date line */}
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-grey/30 dark:bg-zinc-800/50" />
                        <div className="w-32 h-2.5 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <div className="w-full h-3.5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                        <div className="w-4/5 h-3.5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                    </div>
                </div>
            </div>
            
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};
