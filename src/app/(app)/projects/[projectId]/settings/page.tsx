import type { Metadata } from 'next';
import SettingsContainer from './settings-container';

export const metadata: Metadata = { title: 'Project settings' };

export default function SettingsPage() {
  return <SettingsContainer />;
}
