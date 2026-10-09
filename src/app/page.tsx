import { redirect } from 'next/navigation';

/** The app starts at the dashboard. Signed-out users are sent on to /login from there. */
export default function HomePage() {
  redirect('/dashboard');
}
