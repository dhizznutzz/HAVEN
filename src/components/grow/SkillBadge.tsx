interface SkillBadgeProps {
  skill: string;
  verified?: boolean;
  size?: 'sm' | 'md';
}

export function SkillBadge({ skill, verified = false, size = 'md' }: SkillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      } ${verified ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
    >
      {skill}
      {verified && <span className="text-purple-500">✓</span>}
    </span>
  );
}
