import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProjectsContainer from './projects-container';

export const metadata: Metadata = { title: 'Projects' };

// The container reads filters from the URL (useSearchParams), which needs a Suspense boundary.
export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectsContainer />
    </Suspense>
  );
}
