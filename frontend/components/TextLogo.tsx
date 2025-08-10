import system_data from "@/app/data/system";
import Image from "next/image";

const TextLogo = ({
  classname = "",
  size = "text-5xl",
}: {
  classname?: string;
  size?: string;
  width?: number;
  responsiveSize?: string;
  height?: number;
}) => {
  return (
    <h1 className={`${size} font-bold text-gray-900 ${classname}`}>
      Neuro<span className="text-blue-600">Flow</span>
    </h1>
  );
};

export default TextLogo;
