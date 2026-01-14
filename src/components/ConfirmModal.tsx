import { Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Sil',
    cancelText = 'İptal'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
            <div className="w-full max-w-sm bg-apple-light-card dark:bg-apple-dark-card rounded-3xl p-6 text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-red/20 flex items-center justify-center">
                    <Trash2 className="h-8 w-8 text-apple-red" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-apple-light-text-primary dark:text-apple-dark-text-primary mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-6">
                    {message}
                </p>

                {/* Buttons */}
                <div className="flex space-x-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-800 text-apple-blue font-semibold rounded-xl transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 py-3 px-4 bg-apple-red/10 text-apple-red font-semibold rounded-xl transition-colors hover:bg-apple-red/20"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
