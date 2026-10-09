import type { Metadata } from 'next';
import AccountContainer from './account-container';

export const metadata: Metadata = { title: 'Account' };

export default function AccountPage() {
  return <AccountContainer />;
}
