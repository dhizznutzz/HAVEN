import { CircleChat } from '@/components/circle/CircleChat';

export default function CircleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 h-[calc(100vh-7rem)]">
      <div className="rounded-xl border border-gray-100 bg-white h-full overflow-hidden">
        <CircleChat circleId={params.id} circleName="Study Circle" />
      </div>
    </div>
  );
}
