import { notFound } from 'next/navigation';
import { ALL_CIRCLES } from '@/data/circles-data';
import { CircleChat } from '@/components/circle/CircleChat';

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  const circle = ALL_CIRCLES.find(c => c.id === params.id);
  if (!circle) notFound();

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      <CircleChat circle={circle} />
    </div>
  );
}
