import { useState, useRef } from "react";
import PropTypes from "prop-types";

const Tooltip = ({ content, children, side = "top", delay = 0.5 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (!content) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay * 1000);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const sideToTransform = {
    top: "translate(-50%, -0.5rem) scale-95",
    bottom: "translate(-50%, 0.5rem) scale-95",
    left: "translate(-0.5rem, -50%) scale-95",
    right: "translate(0.5rem, -50%) scale-95",
  };

  const sideToPositionStyle = {
    top: { left: "50%", bottom: "100%" },
    bottom: { left: "50%", top: "100%" },
    left: { right: "100%", top: "50%" },
    right: { left: "100%", top: "50%" },
  };

  const transformStyle = isVisible
    ? sideToTransform[side]
        .replace("scale-95", "scale-100")
        .replace(/-0.5rem/, "0rem")
        .replace(/0.5rem/, "0rem")
    : sideToTransform[side];

  if (!content) {
    return children;
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        className={`absolute z-50 pointer-events-none px-2 py-1 text-xs font-medium bg-sparkle-card text-sparkle-text rounded-md shadow-lg border border-sparkle-border whitespace-nowrap transition-all duration-150 ease-out`}
        style={{
          ...sideToPositionStyle[side],
          transform: transformStyle,
          opacity: isVisible ? 1 : 0,
        }}
      >
        {content}
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node.isRequired,
  side: PropTypes.oneOf(["top", "bottom", "left", "right"]),
  delay: PropTypes.number,
};

export default Tooltip;
