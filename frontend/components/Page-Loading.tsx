import React from "react";
import Logo from "./Logo";
import LoadingIcon from "./Loading-Icon";

const PageLoading = ({ title, text }: { title?: string; text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6 md:p-10">
      <div className="w-full max-w-sm rounded-lg p-8 text-center">
        <Logo classname="mx-auto mb-10" />
        <LoadingIcon />
        {title !== "" && (
          <h1 className="text-lg text-black/80 font-medium mt-4">{title}</h1>
        )}
        {text !== "" && <p className="text-muted-foreground text-sm">{text}</p>}
      </div>
    </div>
  );
};

export default PageLoading;
