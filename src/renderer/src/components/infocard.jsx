import { cn } from "@/lib/utils";
import Card from "./ui/card.jsx";
import PropTypes from "prop-types";

const InfoCard = ({
  icon: Icon,
  iconBgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  title,
  subtitle,
  items = [],
  className,
  ...props
}) => {
  return (
    <Card
      className={cn(
        "bg-sparkle-card backdrop-blur-xs rounded-xl border border-sparkle-border hover:shadow-xs overflow-hidden p-5",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={cn("p-3 rounded-lg", iconBgColor)}>
          <Icon className={cn("text-lg", iconColor)} size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-sparkle-text mb-1">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sparkle-text-secondary text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index}>
            <p className="text-sparkle-text-secondary text-xs mb-1">
              {item.label}
            </p>
            <p className="text-sparkle-text font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

InfoCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  iconBgColor: PropTypes.string,
  iconColor: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ),
  className: PropTypes.string,
};

export default InfoCard;
