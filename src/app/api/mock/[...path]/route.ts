import { handleMockRequest } from '@/mocks/handle-request';

/** Demo API. Turned on by NEXT_PUBLIC_API_URL=/api/mock. All logic lives in src/mocks. */
type Context = { params: Promise<{ path: string[] }> };

async function handle(req: Request, { params }: Context) {
  const { path } = await params;
  return handleMockRequest(req, `/${path.join('/')}`);
}

export const dynamic = 'force-dynamic';
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
