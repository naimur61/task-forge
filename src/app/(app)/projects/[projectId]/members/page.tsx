import type { Metadata } from 'next';
import MembersContainer from './members-container';

export const metadata: Metadata = { title: 'Members' };

export default function MembersPage() {
  return <MembersContainer />;
}
