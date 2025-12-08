import React from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { Trash2, Banknote } from 'lucide-react';

interface SwipeableItemProps {
    children: React.ReactNode;
    onDelete: () => void;
    onSell?: () => void; // ARTIK OPSİYONEL
    onClick?: () => void;
}

export function SwipeableItem({ children, onDelete, onSell, onClick }: SwipeableItemProps) {
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Eğer onSell yoksa sadece silme butonu gösterileceği için genişlik 70px, varsa 140px
    const actionWidth = onSell ? 140 : 70;
    const dragLimit = -actionWidth;
    const triggerThreshold = dragLimit / 2; // Yarıya kadar çekilince tetiklensin

    const handleDragEnd = async (_: any, info: PanInfo) => {
        const offset = info.offset.x;

        // Eğer kullanıcı yeterince sola kaydırdıysa menüyü açık tut
        if (offset < triggerThreshold) {
            controls.start({ x: dragLimit });
        } else {
            // Değilse kapat
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl group">
            {/* Arka Plan Aksiyonları */}
            <div
                className="absolute inset-y-0 right-0 flex"
                style={{ width: `${actionWidth}px` }}
            >
                {/* Sat Butonu (Yeşil) - Sadece onSell varsa göster */}
                {onSell && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSell(); controls.start({ x: 0 }); }}
                        className="w-[70px] bg-apple-green flex items-center justify-center text-white"
                    >
                        <Banknote className="h-6 w-6" />
                    </button>
                )}

                {/* Sil Butonu (Kırmızı) - Tek buton ise köşeler tam yuvarlak, değilse sağ taraf yuvarlak */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); controls.start({ x: 0 }); }}
                    className={`w-[70px] bg-apple-red flex items-center justify-center text-white ${onSell ? 'rounded-r-2xl' : 'rounded-2xl'}`}
                >
                    <Trash2 className="h-6 w-6" />
                </button>
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
                className="relative bg-apple-light-card dark:bg-apple-dark-card z-10"
                whileTap={{ cursor: "grabbing" }}
            >
                {children}
            </motion.div>
        </div>
    );
}