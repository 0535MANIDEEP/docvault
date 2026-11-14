import { redirect } from 'next/navigation';

import { DocumentTable } from '@/components/DocumentTable';
import { getCurrentUser } from '@/lib/auth';

export const instant = false;

export default async function DocumentsPage() {
  const user = await getCurrentUser();

  if (!user) redirect('/login');

  return <DocumentTable />;
}
