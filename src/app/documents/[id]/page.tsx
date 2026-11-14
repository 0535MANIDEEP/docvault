import { redirect } from 'next/navigation';

import { DocumentDetail } from '@/components/DocumentDetail';
import { getCurrentUser } from '@/lib/auth';

export const instant = false;

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  return <DocumentDetail id={id} />;
}
