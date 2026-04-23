'use client';

import { useRef, useState } from 'react';
import { X, Send, ImagePlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Pillar } from '@/types';
import { pillarMeta } from '@/lib/colors';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultPillar?: Pillar;
}

export function CreatePostModal({ open, onClose, onCreated, defaultPillar = 'grow' }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [pillar, setPillar] = useState<Pillar>(defaultPillar);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error('Please sign in'); return; }

      const tags = tagsInput
        .split(',')
        .map(t => t.trim().toLowerCase().replace(/^#/, ''))
        .filter(Boolean);

      // Analyze sentiment via API
      let sentiment_score = 0;
      let risk_level = 'none';
      try {
        const res = await fetch('/api/ai/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: content }),
        });
        if (res.ok) {
          const data = await res.json();
          sentiment_score = data.sentiment_score;
          risk_level = data.risk_level;
        }
      } catch {}

      let image_url: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('post-images')
          .upload(path, imageFile, { contentType: imageFile.type });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(path);
        image_url = publicUrl;
      }

      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        content: content.trim(),
        pillar,
        tags,
        is_anonymous: pillar === 'safe_space' ? true : isAnonymous,
        sentiment_score,
        risk_level,
        image_url,
      });

      if (error) throw error;

      // Award points
      await supabase.rpc('increment_points', { user_id: user.id, amount: 10 });

      toast.success('Post shared!');
      setContent('');
      setTagsInput('');
      removeImage();
      onCreated();
      onClose();
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Share something</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Pillar selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(pillarMeta) as Pillar[]).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPillar(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  pillar === p ? pillarMeta[p].badge : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {pillarMeta[p].icon} {pillarMeta[p].label}
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              pillar === 'safe_space'
                ? "Share how you're feeling... this space is safe and anonymous."
                : "What's on your mind?"
            }
            className="w-full min-h-[120px] text-sm text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-sage-100 focus:border-sage-400"
            maxLength={1000}
          />

          {/* Image picker */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="w-full max-h-56 object-cover rounded-xl" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-sage-600 transition-colors"
            >
              <ImagePlus className="w-4 h-4" />
              Add photo
            </button>
          )}

          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="Tags: python, design, wellbeing (comma separated)"
            className="w-full text-sm text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sage-100"
          />

          <div className="flex items-center justify-between">
            {pillar !== 'safe_space' && (
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="rounded"
                />
                Post anonymously
              </label>
            )}
            {pillar === 'safe_space' && (
              <span className="text-xs text-rose-500">Always anonymous in Safe Space</span>
            )}

            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-xl text-sm font-medium hover:bg-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors ml-auto"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
