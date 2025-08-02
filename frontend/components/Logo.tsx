import system_data from "@/app/data/system";
import Image from "next/image";

const Logo = ({
  classname = "",
  width = 150,
  height = 150,
}: {
  classname?: string;
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      src={"/assets/logo.jpg"}
      className={`${classname}`}
      width={width}
      height={height}
      alt={system_data.shortname}
      quality={100}
      priority
    />
  );
};

export default Logo;
