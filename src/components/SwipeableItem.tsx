import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, Banknote } from 'lucide-react';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    onSell: () => void;
    onClick?: () => void;
}

export function SwipeableItem({ children, onDelete, onSell, onClick }: SwipeableItemProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Sola kaydırınca butonlar açılacak, bu yüzden limit -140px (iki buton genişliği)
    const handleDragEnd = async (_: any, info: PanInfo) => {
        const offset = info.offset.x;

        // Eğer kullanıcı yeterince sola kaydırdıysa menüyü açık tut
        if (offset < -60) {
            controls.start({ x: -140 });
        } else {
            // Değilse kapat
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl group">
            {/* Arka Plan Aksiyonları */}
            <div className="absolute inset-y-0 right-0 w-[140px] flex">
                {/* Sat Butonu (Yeşil) */}
                <button
                    onClick={(e) => { e.stopPropagation(); onSell(); controls.start({ x: 0 }); }}
                    className="w-[70px] bg-apple-green flex items-center justify-center text-white"
                >
                    <Banknote className="h-6 w-6" />
                </button>
                {/* Sil Butonu (Kırmızı) */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); controls.start({ x: 0 }); }}
                    className="w-[70px] bg-apple-red flex items-center justify-center text-white rounded-r-2xl"
                >
                    <Trash2 className="h-6 w-6" />
                </button>
            </div>

            {/* Ön Plan İçeriği */}
            <motion.div
                style={{ x }}
                animate={controls}
                drag="x"
                dragConstraints={{ left: -140, right: 0 }}
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