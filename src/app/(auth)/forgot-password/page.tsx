import type { Metadata } from 'next';
import ForgotPasswordContainer from './forgot-password-container';

export const metadata: Metadata = { title: 'Reset your password' };

export default function ForgotPasswordPage() {
  return <ForgotPasswordContainer />;
}
