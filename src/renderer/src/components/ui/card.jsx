import { cn } from "@/lib/utils";
import PropTypes from "prop-types";
import React from "react";

const Card = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-sparkle-card border border-sparkle-border rounded-xl hover:border-sparkle-primary transition group",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
