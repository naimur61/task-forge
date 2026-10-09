import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { BrandMark } from '@/components/layouts/brand-mark';
import { siteConfig } from '@/config/site';

interface AuthCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Rendered below the card, e.g. a "Sign in" link. */
  footer?: ReactNode;
}

const HIGHLIGHTS = [
  'Kanban board with drag and drop',
  'Roles for owners, admins and members',
  'Filters, search and a live dashboard',
];

/** Auth page shell: brand panel on large screens, form card on the right. State lives in the *-container.tsx. */
export function AuthCard({ icon, title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-indigo-900 p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2.5 text-lg font-bold">
          <BrandMark className="bg-white/15 from-transparent to-transparent" />
          {siteConfig.name}
        </div>
        <div className="max-w-md space-y-6">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">Plan projects. Ship tasks. Together.</h2>
          <ul className="space-y-3 text-primary-foreground/90">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">© {new Date().getFullYear()} {siteConfig.name}</p>
        {/* Soft decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 right-20 h-96 w-96 rounded-full bg-white/5" aria-hidden />
      </aside>

      {/* Form side */}
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">{icon}</div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="mt-1 text-muted-foreground">{subtitle}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">{children}</div>
          {footer && <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </main>
  );
}
