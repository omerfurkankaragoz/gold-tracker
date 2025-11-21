import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    onClick?: () => void;
}

export function SwipeableItem({ children, onDelete, onClick }: SwipeableItemProps) {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
    const bgOpacity = useTransform(x, [-100, 0], [1, 0]);

    // Threshold to trigger delete
    const deleteThreshold = -100;

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x < deleteThreshold) {
            onDelete();
        } else {
            // Reset position
            // We can't imperatively reset x with framer-motion easily without animation controls
            // But since we are using drag constraints, it snaps back if we don't do anything?
            // Actually, dragSnapToOrigin might be needed or just letting it spring back.
            // Framer motion handles spring back if we don't modify x.
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl">
            {/* Background Action Layer */}
            <motion.div
                style={{ opacity: bgOpacity }}
                className="absolute inset-y-0 right-0 w-full bg-red-500 flex items-center justify-end pr-6 rounded-2xl"
            >
                <Trash2 className="text-white h-6 w-6" />
            </motion.div>

            {/* Foreground Content Layer */}
            <motion.div
                style={{ x }}
                drag="x"
                dragConstraints={{ left: -200, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={onClick}
                className="relative bg-apple-light-card dark:bg-apple-dark-card z-10"
                whileTap={{ cursor: "grabbing" }}
            >
                {children}
            </motion.div>
        </div>
    );
}
