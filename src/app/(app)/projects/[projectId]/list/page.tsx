import type { Metadata } from 'next';
import ListContainer from './list-container';

export const metadata: Metadata = { title: 'Tasks' };

export default function ListPage() {
  return <ListContainer />;
}
