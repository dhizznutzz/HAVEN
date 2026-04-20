'use client';

import { MapPin, Calendar, Users, Zap } from 'lucide-react';
import { Opportunity } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

const typeColors: Record<string, string> = {
  volunteer: 'bg-teal-100 text-teal-800',
  internship: 'bg-blue-100 text-blue-800',
  program: 'bg-purple-100 text-purple-800',
  event: 'bg-amber-100 text-amber-800',
};

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const handleApply = () => {
    toast.success('Application submitted!');
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:border-teal-200 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[opportunity.type]}`}>
              {opportunity.type}
            </span>
            {opportunity.match_score !== undefined && (
              <span className="flex items-center gap-1 text-xs text-teal-600 font-medium">
                <Zap className="w-3 h-3" />
                {opportunity.match_score}% match
              </span>
            )}
          </div>
          <h3 className="text-sm font-medium text-gray-900">{opportunity.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{opportunity.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-400">
        {opportunity.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {opportunity.location}
          </span>
        )}
        {opportunity.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Closes {formatDistanceToNow(new Date(opportunity.deadline), { addSuffix: true })}
          </span>
        )}
        {opportunity.slots && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {opportunity.slots} slots
          </span>
        )}
      </div>

      {opportunity.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {opportunity.skills_required.map(skill => (
            <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {skill}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={handleApply}
        className="mt-3 w-full py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
      >
        Apply Now
      </button>
    </div>
  );
}
