import Logo from "./Logo";
import TextLogo from "./TextLogo";
import { CardHeader, CardTitle, CardDescription } from "./ui/card";

const TLHeader = ({ title, desc }: { title: string; desc: string }) => {
  return (
    <CardHeader className="flex flex-col items-center justify-center gap-0">
      <Logo width={60} height={60} classname="text-center" />
      <CardTitle className="gap-2 m-0">
        <TextLogo size="text-xl" extra={title} />
      </CardTitle>
      <CardDescription>{desc}</CardDescription>
    </CardHeader>
  );
};

export default TLHeader;
