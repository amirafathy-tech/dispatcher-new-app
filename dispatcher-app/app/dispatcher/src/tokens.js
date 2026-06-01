export const D_TOK = {
  ink:      '#0B1220',
  ink2:     '#3B475C',
  mute:     '#6B7487',
  line:     '#E3E0D8',
  sand:     '#F7F5F0',
  accent:   '#0A6ED1',
  accentBg: '#E4EEFA',
  good:     '#16A34A',
  warn:     '#D97706',
  bad:      '#DC2626',
  white:    '#FFFFFF',
};

export const STATUS_TONE = {
  'on-route': { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A', label: 'On Route' },
  'idle':     { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: 'Idle' },
  'late':     { bg: '#FEE2E2', text: '#B91C1C', dot: '#DC2626', label: 'Late' },
  'break':    { bg: '#FEF3C7', text: '#92400E', dot: '#D97706', label: 'On Break' },
  'depot':    { bg: '#FEF9C3', text: '#713F12', dot: '#CA8A04', label: 'At Depot' },
};

export const PRI_TONE = {
  'P-A': { bg: '#FEE2E2', text: '#B91C1C' },
  'P-B': { bg: '#FEF3C7', text: '#92400E' },
  'P-C': { bg: '#F3F4F6', text: '#6B7280' },
};

export const SEV_TONE = {
  high: { dot: '#DC2626', bold: true },
  med:  { dot: '#D97706', bold: false },
  low:  { dot: '#9CA3AF', bold: false },
};
