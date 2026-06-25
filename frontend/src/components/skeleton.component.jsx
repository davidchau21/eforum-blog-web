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

export const GroupDetailsSkeleton = () => {
    return (
        <div className="min-h-screen pb-20 bg-[#F8FAFC] dark:bg-[#09090B] transition-colors duration-500 font-inter">
            {/* Cover & Banner Section Skeleton */}
            <div className="relative w-full h-[320px] md:h-[400px] bg-slate-200 dark:bg-zinc-800 animate-pulse">
                {/* Group details floating overlay banner skeleton (Glassmorphism style but skeleton version) */}
                <div className="absolute bottom-6 left-[5vw] right-[5vw] p-6 backdrop-blur-xl bg-black/40 border border-white/10 rounded-[32px] flex flex-col md:flex-row md:items-end justify-between gap-6 w-[90vw]">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left w-full">
                        {/* Avatar Skeleton */}
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white/20 shrink-0" />
                        
                        <div className="space-y-3 flex-1 w-full max-w-md">
                            {/* Tags Skeleton */}
                            <div className="flex gap-2 justify-center md:justify-start">
                                <div className="w-16 h-5 bg-white/20 rounded-full" />
                                <div className="w-20 h-5 bg-white/20 rounded-full" />
                            </div>
                            {/* Name Skeleton */}
                            <div className="w-3/4 h-8 bg-white/20 rounded-xl mx-auto md:mx-0" />
                            {/* Stats Skeleton */}
                            <div className="w-1/2 h-4 bg-white/15 rounded-lg mx-auto md:mx-0" />
                        </div>
                    </div>
                    {/* Action button skeleton */}
                    <div className="w-full md:w-32 h-12 bg-white/20 rounded-2xl shrink-0" />
                </div>
            </div>

            {/* Content Workspace Layout Skeleton */}
            <div className="max-w-[1400px] mx-auto mt-8 px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                {/* Main Workspace (Left Column) */}
                <div className="lg:col-span-9 space-y-6">
                    {/* Tabs navigation skeleton */}
                    <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[24px] p-2 flex gap-2 h-14" >
                        <div className="flex-1 bg-grey/30 dark:bg-zinc-800/50 rounded-xl" />
                        <div className="flex-1 bg-grey/30 dark:bg-zinc-800/50 rounded-xl" />
                        <div className="flex-1 bg-grey/30 dark:bg-zinc-800/50 rounded-xl" />
                        <div className="flex-1 bg-grey/30 dark:bg-zinc-800/50 rounded-xl" />
                    </div>

                    {/* Blog Feed Skeleton */}
                    <div className="space-y-6">
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                    </div>
                </div>

                {/* Sidebar (Right Column) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[32px] p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="w-1/2 h-5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                            <div className="w-full h-3 bg-grey/25 dark:bg-zinc-800/40 rounded-full" />
                            <div className="w-full h-3 bg-grey/25 dark:bg-zinc-800/40 rounded-full" />
                            <div className="w-3/4 h-3 bg-grey/25 dark:bg-zinc-800/40 rounded-full" />
                        </div>
                        <div className="space-y-3 pt-6 border-t border-grey dark:border-zinc-800">
                            <div className="w-1/3 h-4 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded-full bg-grey/30 dark:bg-zinc-800/50" />
                                <div className="w-10 h-10 rounded-full bg-grey/30 dark:bg-zinc-800/50" />
                                <div className="w-10 h-10 rounded-full bg-grey/30 dark:bg-zinc-800/50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const GroupCardSkeleton = () => {
    return (
        <div className="bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/5 rounded-[28px] overflow-hidden shadow-sm flex flex-col h-full relative animate-pulse">
            {/* Banner Placeholder */}
            <div className="h-36 w-full bg-grey/30 dark:bg-zinc-800/50" />
            
            {/* Content Placeholder */}
            <div className="p-6 flex flex-col flex-grow relative">
                {/* Avatar Offset */}
                <div className="w-16 h-16 rounded-2xl bg-grey/30 dark:bg-zinc-800/50 -mt-14 mb-4 z-10 border-[3px] border-white dark:border-[#111113]" />
                
                {/* Text lines */}
                <div className="space-y-3 flex-grow">
                    <div className="w-3/4 h-5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                    <div className="w-1/3 h-3.5 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                    <div className="pt-2 space-y-2">
                        <div className="w-full h-3 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                        <div className="w-full h-3 bg-grey/20 dark:bg-zinc-800/30 rounded-full mt-2" />
                    </div>
                </div>

                {/* Footer Placeholder */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <div className="w-24 h-4 bg-grey/25 dark:bg-zinc-800/40 rounded-full" />
                    <div className="w-20 h-8 bg-grey/30 dark:bg-zinc-800/50 rounded-xl" />
                </div>
            </div>
            
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};

export const TrendingTopicsSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse relative overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5 p-1">
                    <div className="w-24 h-2.5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                    <div className="w-16 h-3.5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                </div>
            ))}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};

export const TopContributorsSkeleton = () => {
    return (
        <div className="space-y-4 animate-pulse relative overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-1.5">
                    <div className="w-8 h-8 rounded-full bg-grey/30 dark:bg-zinc-800/50 shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="w-28 h-3.5 bg-grey/30 dark:bg-zinc-800/50 rounded-full" />
                        <div className="w-14 h-2.5 bg-grey/20 dark:bg-zinc-800/30 rounded-full" />
                    </div>
                    <div className="w-7 h-7 bg-grey/30 dark:bg-zinc-800/50 rounded-full shrink-0" />
                </div>
            ))}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent pointer-events-none" />
        </div>
    );
};
