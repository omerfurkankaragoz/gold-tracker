import React, { memo, useCallback } from 'react';
import { motion, useMotionValue, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, Banknote, Pencil } from 'lucide-react';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete?: () => void;
    onSell?: () => void;
    onEdit?: () => void;
    onClick?: () => void;
    className?: string; // Opsiyonel className prop'u
}

export const SwipeableItem = memo(function SwipeableItem({ children, onDelete, onSell, onEdit, onClick, className }: SwipeableItemProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Buton sayısına göre genişlik hesapla
    const buttonCount = [onSell, onDelete, onEdit].filter(Boolean).length;
    const actionWidth = buttonCount * 70;
    const dragLimit = -actionWidth;
    const triggerThreshold = dragLimit / 2;

    const handleDragEnd = useCallback(async (_: unknown, info: PanInfo) => {
        const offset = info.offset.x;

        if (offset < triggerThreshold) {
            controls.start({ x: dragLimit });
        } else {
            controls.start({ x: 0 });
        }
    }, [triggerThreshold, dragLimit, controls]);

    // Default card background class
    const defaultBgClass = "bg-apple-light-card dark:bg-apple-dark-card";
    const bgClass = className || defaultBgClass;

    // Hiç aksiyon yoksa sadece children döndür
    if (buttonCount === 0) {
        return <div className={`rounded-2xl ${className || ''}`}>{children}</div>;
    }

    return (
        <div className="relative overflow-hidden rounded-2xl group">
            {/* Arka Plan Aksiyonları */}
            <div
                className="absolute inset-y-0 right-0 flex"
                style={{ width: `${actionWidth}px` }}
            >
                {/* Düzenle Butonu (Turuncu) */}
                {onEdit && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); controls.start({ x: 0 }); }}
                        className="w-[70px] bg-orange-500 flex items-center justify-center text-white"
                    >
                        <Pencil className="h-6 w-6" />
                    </button>
                )}

                {/* Sat Butonu (Mavi) */}
                {onSell && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSell(); controls.start({ x: 0 }); }}
                        className="w-[70px] bg-apple-blue flex items-center justify-center text-white"
                    >
                        <Banknote className="h-6 w-6" />
                    </button>
                )}

                {/* Sil Butonu (Kırmızı) */}
                {onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); controls.start({ x: 0 }); }}
                        className="w-[70px] bg-apple-red flex items-center justify-center text-white rounded-r-2xl"
                    >
                        <Trash2 className="h-6 w-6" />
                    </button>
                )}
            </div>

            {/* Ön Plan İçeriği */}
            <motion.div
                style={{ x }}
                animate={controls}
                drag="x"
                dragConstraints={{ left: dragLimit, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                onClick={onClick}
                className={`relative z-10 ${bgClass}`}
                whileTap={{ cursor: "grabbing" }}
            >
                {children}
            </motion.div>
        </div>
    );
});