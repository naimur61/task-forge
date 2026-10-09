import { redirect } from 'next/navigation';

/** `/projects/:id` opens the board tab. */
export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/board`);
}
