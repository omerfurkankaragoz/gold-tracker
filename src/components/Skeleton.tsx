import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({ className = '', width, height, variant = 'rectangular' }: SkeletonProps) {
    const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700 rounded";
    const variantClasses = {
        text: "rounded",
        circular: "rounded-full",
        rectangular: "rounded-md",
    };

    const style = {
        width,
        height,
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4 flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="space-y-2">
                    <Skeleton width={100} height={20} />
                </div>
            </div>
            <div className="flex items-center space-x-5">
                <Skeleton width={80} height={24} />
                <Skeleton width={80} height={24} />
            </div>
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
