import React from "react";

export default function CommonSkeleton({ rows = 5 }) {
    return (
        <div className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 mb-4">
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
            </div>

            {/* Table Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 mb-3 items-center"
                >
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                </div>
            ))}
        </div>
    );
}
