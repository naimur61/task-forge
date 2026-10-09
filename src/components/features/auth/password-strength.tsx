import { cn } from '@/lib/utils';

/** Score 0–4: length, letter + number, mixed case, symbol. */
function scorePassword(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  return score;
}

const LEVELS = [
  { label: 'Too weak', color: 'bg-destructive' },
  { label: 'Weak', color: 'bg-destructive' },
  { label: 'Fair', color: 'bg-amber-500' },
  { label: 'Good', color: 'bg-emerald-500' },
  { label: 'Strong', color: 'bg-emerald-600' },
];

/** Four-step bar that shows how strong the typed password is. */
export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const score = scorePassword(password);
  const level = LEVELS[score];

  return (
    <div className="space-y-1" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn('h-1 flex-1 rounded-full', i < score ? level.color : 'bg-muted')} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Password strength: <span className="font-medium text-foreground">{level.label}</span>
      </p>
    </div>
  );
}
