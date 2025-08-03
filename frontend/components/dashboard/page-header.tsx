const DashboardPageHeader = ({
  title,
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}: {
  title: string;
  subtitle: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) => {
  return (
    <div className={`${className}`}>
      <h2 className={`text-2xl font-bold ${titleClassName}`}>{title}</h2>
      <p className={`text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>
    </div>
  );
};

export default DashboardPageHeader;
