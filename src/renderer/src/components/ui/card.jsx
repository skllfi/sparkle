import { cn } from "@/lib/utils";
import PropTypes from "prop-types";

function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "bg-sparkle-card border border-sparkle-border rounded-xl hover:border-sparkle-primary transition group",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;
