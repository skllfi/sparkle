import { useEffect, forwardRef, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, children }, ref) => {
    useEffect(() => {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape" && onClose) {
          onClose();
        }
      };
      if (open) {
        window.addEventListener("keydown", handleKey);
      }
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    }, [open, onClose]);

    return (
      <div
        ref={ref}
        onClick={onClose}
        className={`
        fixed inset-0 flex justify-center items-center z-50 transition-all
        ${open ? "visible bg-black/60 backdrop-blur-xs" : "invisible bg-black/0"}
      `}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
          transform transition-all
          duration-300 ease-out
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}
        `}
        >
          {children}
        </div>
      </div>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
