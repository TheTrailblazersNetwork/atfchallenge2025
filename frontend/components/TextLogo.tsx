import system_data from "@/app/data/system";

const TextLogo = ({
  classname = "",
  size = "text-5xl",
  extra = "",
}: {
  classname?: string;
  size?: string;
  width?: number;
  responsiveSize?: string;
  height?: number;
  extra?: string;
}) => {
  return (
    <h1 className={`${size} font-bold text-gray-900 ${classname}`}>
      {system_data.first_name}<span className="text-blue-600">{system_data.last_name} {extra}</span>
    </h1>
  );
};

export default TextLogo;
