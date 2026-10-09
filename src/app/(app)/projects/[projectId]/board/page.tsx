import type { Metadata } from 'next';
import BoardContainer from './board-container';

export const metadata: Metadata = { title: 'Board' };

export default function BoardPage() {
  return <BoardContainer />;
}
