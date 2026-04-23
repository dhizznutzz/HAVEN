import { Star } from 'lucide-react';

interface LevelProgressProps {
  level: number;
  points: number;
}

const POINTS_PER_LEVEL = 200;

export function LevelProgress({ level, points }: LevelProgressProps) {
  const pointsInLevel = points % POINTS_PER_LEVEL;
  const progress = (pointsInLevel / POINTS_PER_LEVEL) * 100;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
            <Star className="w-4 h-4 text-purple-600 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Level {level}</p>
            <p className="text-xs text-gray-500">{points} total XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Next level</p>
          <p className="text-xs font-medium text-purple-600">{POINTS_PER_LEVEL - pointsInLevel} XP</p>
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pointsInLevel}/{POINTS_PER_LEVEL} XP to Level {level + 1}</p>
    </div>
  );
}
