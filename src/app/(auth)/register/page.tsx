import type { Metadata } from 'next';
import RegisterContainer from './register-container';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return <RegisterContainer />;
}
