import type { Metadata } from 'next';
import ActivityContainer from './activity-container';

export const metadata: Metadata = { title: 'Activity' };

export default function ActivityPage() {
  return <ActivityContainer />;
}
