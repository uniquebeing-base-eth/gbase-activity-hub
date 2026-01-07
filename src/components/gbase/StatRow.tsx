
interface StatRowProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

const StatRow = ({ label, value, highlight }: StatRowProps) => {
  return (
    <div className="stat-row">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-primary font-semibold" : "font-semibold"}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
};

export default StatRow;
