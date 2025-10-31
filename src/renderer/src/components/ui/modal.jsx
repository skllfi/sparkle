import React, { useEffect, forwardRef } from "react";
import PropTypes from "prop-types";

const Modal = forwardRef(({ open, onClose, children }, ref) => {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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
});

Modal.displayName = "Modal";

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
