import type { ReactNode } from 'react';
import { Suspense } from 'react';
import ProjectShellContainer from './project-shell-container';

/** Frame for every project tab: header, tabs, task drawer and "New task" dialog. */
export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <Suspense>
      <ProjectShellContainer projectId={projectId}>{children}</ProjectShellContainer>
    </Suspense>
  );
}
