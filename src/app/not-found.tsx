import Link from 'next/link';
import { Compass } from 'lucide-react';

/** Shown for any URL that doesn't match a page. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Compass className="h-7 w-7" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">The page you are looking for doesn&apos;t exist or has moved.</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
