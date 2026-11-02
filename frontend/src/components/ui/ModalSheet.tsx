import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({ isOpen, onClose, title, children }) => {
  const dragControls = useDragControls();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet Container with Spring Physics */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 320,
              mass: 0.8
            }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className="relative w-full max-w-[420px] max-h-[85vh] bg-revolut-cardSolid rounded-t-modal border-t border-x border-white/[0.08] shadow-float z-10 flex flex-col overflow-hidden"
          >
            {/* Drag Zone (Handle + Header) - Only this area initiates swipe-to-dismiss */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="touch-none select-none cursor-grab active:cursor-grabbing border-b border-white/[0.06]"
            >
              {/* Drag handle pill */}
              <div className="w-full pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1.5 rounded-full bg-white/25 hover:bg-white/40 transition-colors" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-2.5">
                <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
                <button
                  type="button"
                  onClick={onClose}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-revolut-muted hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content body with native scroll - NEVER hijacked by drag */}
            <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
