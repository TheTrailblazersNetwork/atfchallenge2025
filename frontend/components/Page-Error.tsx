import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import Logo from "./Logo";

const PageError = ({
  title,
  text,
  link = "/",
  linkText = "Go to Homepage",
}: {
  title: string;
  text: string;
  link?: string;
  linkText?: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="w-full text-center nf-glass-bg">
        <Logo classname="mb-5 h-10 mx-auto w-auto" />
        <h1 className="text-xl font-semibold text-destructive">{title}</h1>
        <p className="text-muted-foreground text-sm mb-4">{text}</p>
        <Button variant={"outline"} asChild size="lg" className="w-full">
          <Link href={link}>{linkText}</Link>
        </Button>
      </div>
    </div>
  );
};

export default PageError;
