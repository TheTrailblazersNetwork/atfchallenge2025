import { SidebarTrigger } from "../ui/sidebar";

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
    <div
      className={`${className} nf-glass-bg text-center p-6 rounded-lg shadow-md`}
    >
      <div className="float-left">
        <SidebarTrigger />
      </div>
      <h2 className={`text-2xl font-bold ${titleClassName}`}>{title}</h2>
      <p className={`text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>
    </div>
  );
};

export default DashboardPageHeader;
