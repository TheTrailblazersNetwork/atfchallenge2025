// components/end-of-queue.tsx
import { Button } from "@/components/ui/button";

export function EndOfQueue() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed bg-muted/50">
      <div className="text-center space-y-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto h-12 w-12 text-muted-foreground"
        >
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        <h3 className="text-xl font-semibold">Queue Completed</h3>
        <p className="text-sm text-muted-foreground">
          All patients have been attended to. The queue is now empty.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={handleRefresh}
        >
          Refresh Queue
        </Button>
      </div>
    </div>
  );
}