import { Button } from "@/components/ui/button";

const ErrorPage = ({ error, reset }: { error: Error; reset: () => void }) => {
  return (
    <div className="h-fit py-10 px-4 w-[70%] lg:w-[40%] shadow-lg border p-4 rounded-md">
      <div className="text-center">
        <h2 className="my-3 text-lg lg:text-2xl font-bold text-destructive">
          Something went wrong!
        </h2>
        <div className="pb-6 text-center text-sm text-muted-foreground p-3 overflow-hidden">
          {error?.message}
        </div>
        <Button variant="default" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;