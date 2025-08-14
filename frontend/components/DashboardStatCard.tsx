const DashboardStatCard = ({ text, value }:{ text: string, value: string }) => {
  return (
    <div className="flex flex-col items-center justify-center nf-glass-bg">
      <p className="text-4xl font-bold">
        {value}
      </p>
      <p>{text}</p>
    </div>
  );
}

export default DashboardStatCard