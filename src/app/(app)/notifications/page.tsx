import type { Metadata } from 'next';
import { Suspense } from 'react';
import NotificationsContainer from './notifications-container';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return (
    <Suspense>
      <NotificationsContainer />
    </Suspense>
  );
}
