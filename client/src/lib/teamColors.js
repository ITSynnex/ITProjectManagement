export const TEAM_COLOR_PALETTE = {
  indigo: { bg: '#EEF2FF', text: '#4F46E5' },
  green:  { bg: '#F0FDF4', text: '#16A34A' },
  orange: { bg: '#FFF7ED', text: '#EA580C' },
  purple: { bg: '#FDF4FF', text: '#9333EA' },
  rose:   { bg: '#FFF1F2', text: '#E11D48' },
  cyan:   { bg: '#ECFEFF', text: '#0891B2' },
  yellow: { bg: '#FEFCE8', text: '#CA8A04' },
};

export const getTeamColors = (colorKey) =>
  TEAM_COLOR_PALETTE[colorKey] ?? { bg: '#F3F4F6', text: '#6B7280' };
