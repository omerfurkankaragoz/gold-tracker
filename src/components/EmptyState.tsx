import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center py-16 px-4 bg-apple-light-card/50 dark:bg-apple-dark-card rounded-3xl border border-dashed border-gray-300 dark:border-gray-700"
        >
            <div className="bg-apple-blue/10 p-4 rounded-full mb-4">
                <Icon className="h-12 w-12 text-apple-blue" />
            </div>
            <h3 className="text-lg font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary mb-2">
                {title}
            </h3>
            <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary max-w-xs mb-6">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2 bg-apple-blue text-white rounded-full font-medium hover:bg-apple-blue/90 transition-colors shadow-lg shadow-apple-blue/20"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}
