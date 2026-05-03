// @ts-nocheck
import React from 'react';

export default function ProjectSkeleton() {
    return (
        <div className="flex flex-col h-full bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            {/* Image Placeholder */}
            <div className="aspect-[16/10] bg-gray-200" />

            {/* Content Area */}
            <div className="p-4 pt-5 flex flex-col flex-1 space-y-4">
                {/* Meta Area */}
                <div className="flex items-center justify-between">
                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                    <div className="h-4 w-16 bg-gray-50 rounded" />
                </div>

                {/* Title Line 1 */}
                <div className="h-6 w-3/4 bg-gray-100 rounded" />
                {/* Title Line 2 */}
                <div className="h-6 w-1/2 bg-gray-100 rounded" />

                {/* Description Space */}
                <div className="space-y-2 pt-2">
                    <div className="h-3 w-full bg-gray-50 rounded" />
                    <div className="h-3 w-full bg-gray-50 rounded" />
                    <div className="h-3 w-2/3 bg-gray-50 rounded" />
                </div>

                {/* Footer / Read More */}
                <div className="mt-auto pt-4 border-t border-gray-50">
                    <div className="h-5 w-20 bg-gray-100 rounded" />
                </div>
            </div>
        </div>
    );
}

export function ProjectSkeletonGrid({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[...Array(count)].map((_, i) => (
                <ProjectSkeleton key={i} />
            ))}
        </div>
    );
}




