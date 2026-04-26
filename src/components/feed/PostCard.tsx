'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Post } from '@/types';
import { pillarMeta } from '@/lib/colors';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';

interface PostCardProps {
  post: Post;
  onLike?: (post: Post) => void;
}

export function PostCard({ post, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const supabase = createClient();
  const meta = pillarMeta[post.pillar];

  const displayName = post.is_anonymous
    ? 'Anonymous'
    : post.profiles?.display_name || post.profiles?.username || 'Unknown';

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes(prev => newLiked ? prev + 1 : prev - 1);
    if (newLiked) onLike?.(post);
    await supabase
      .from('posts')
      .update({ likes: newLiked ? likes + 1 : likes - 1 })
      .eq('id', post.id);
  };

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${meta.bg} ${meta.color}`}>
          {post.is_anonymous ? '?' : displayName[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{displayName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${meta.badge}`}>
              {meta.icon} {meta.label}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>

          {/* Content */}
          <p className="mt-2 text-sm text-gray-700 leading-relaxed">{post.content}</p>

          {/* Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt=""
              className="mt-3 w-full max-h-72 object-cover rounded-xl"
            />
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map(tag => (
                <span key={tag} className="text-xs text-sage-600 hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likes > 0 && <span>{likes}</span>}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <MessageCircle className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors ml-auto">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
