const PageFull = ({ children, alt = false }: { children: React.ReactNode, alt?: boolean }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        alt ? "h-svh w-svw" : "h-full w-full"
      } p-6 md:p-10`}
    >
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
};

export default PageFull