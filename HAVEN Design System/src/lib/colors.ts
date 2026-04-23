export const colors = {
  purple: { light: '#EEEDFE', mid: '#7F77DD', dark: '#534AB7', text: '#3C3489' },
  teal: { light: '#E1F5EE', mid: '#1D9E75', dark: '#0F6E56', text: '#085041' },
  coral: { light: '#FAECE7', mid: '#D85A30', dark: '#993C1D', text: '#712B13' },
  amber: { light: '#FAEEDA', mid: '#BA7517', dark: '#854F0B', text: '#633806' },
  gray: { light: '#F1EFE8', mid: '#888780', dark: '#5F5E5A', text: '#444441' },
};

export const pillarColors = {
  grow: colors.purple,
  connect: colors.teal,
  circle: colors.amber,
  safe_space: colors.coral,
};

export const pillarMeta = {
  grow: {
    label: 'Grow',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    icon: '🌱',
  },
  connect: {
    label: 'Connect',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    icon: '🔗',
  },
  circle: {
    label: 'Circle',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    icon: '⭕',
  },
  safe_space: {
    label: 'Safe Space',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    icon: '💙',
  },
};
