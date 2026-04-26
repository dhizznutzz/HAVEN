import { redirect } from 'next/navigation';

export default function GuardianPage() {
  redirect('/safe-space?tab=guardian');
}
