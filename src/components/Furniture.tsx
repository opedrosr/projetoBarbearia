// Ilustrações vetoriais dos móveis. Aparecem quando o produto ainda não tem foto.
// Quando a loja colocar a foto no campo `image`, a ilustração some sozinha.

export type Kind = 'armchair' | 'sofa' | 'coffee' | 'bed' | 'nightstand' | 'dining' | 'chair' | 'desk';

export const kindFor: Record<string, Kind> = {
  p1: 'armchair',
  p2: 'sofa',
  p3: 'coffee',
  p4: 'bed',
  p5: 'nightstand',
  p6: 'dining',
  p7: 'chair',
  p8: 'desk',
};

// [estofado/tampo, madeira, sombra do estofado]
const palettes: [string, string, string][] = [
  ['#A9A6A0', '#8A5A36', '#8F8C86'],
  ['#3A3936', '#B98F5E', '#2B2A28'],
  ['#C9BBA3', '#5B3C27', '#B3A58E'],
  ['#7B8066', '#B98F5E', '#666B52'],
  ['#B5763C', '#2A211B', '#9A6330'],
  ['#D8D5CE', '#6B4A30', '#C0BDB5'],
];

export default function Furniture({ kind, tone = 0 }: { kind: Kind; tone?: number }) {
  const [a, w, s] = palettes[tone % palettes.length];
  const hi = 'rgba(255,255,255,0.22)';

  const shapes = (() => {
    switch (kind) {
      case 'armchair':
        return (
          <>
            <rect x="56" y="28" width="88" height="68" rx="22" fill={a} />
            <rect x="62" y="34" width="76" height="14" rx="7" fill={hi} />
            <rect x="34" y="62" width="30" height="54" rx="14" fill={s} />
            <rect x="136" y="62" width="30" height="54" rx="14" fill={s} />
            <rect x="48" y="86" width="104" height="32" rx="14" fill={a} />
            <path d="M62 118 L56 142 M138 118 L144 142" stroke={w} strokeWidth="7" strokeLinecap="round" />
          </>
        );
      case 'sofa':
        return (
          <>
            <rect x="22" y="44" width="156" height="50" rx="20" fill={a} />
            <rect x="12" y="62" width="30" height="58" rx="14" fill={s} />
            <rect x="158" y="62" width="30" height="58" rx="14" fill={s} />
            <rect x="36" y="86" width="128" height="34" rx="12" fill={a} />
            <path d="M100 88 V118" stroke={s} strokeWidth="2" />
            <path d="M32 120 L30 140 M168 120 L170 140" stroke={w} strokeWidth="7" strokeLinecap="round" />
          </>
        );
      case 'coffee':
        return (
          <>
            <ellipse cx="100" cy="86" rx="74" ry="16" fill={a} />
            <ellipse cx="100" cy="82" rx="74" ry="14" fill={hi} />
            <path d="M70 94 V134 M130 94 V134" stroke={w} strokeWidth="7" strokeLinecap="round" />
            <path d="M66 112 Q100 122 134 112" stroke={w} strokeWidth="3" fill="none" />
          </>
        );
      case 'bed':
        return (
          <>
            <rect x="26" y="26" width="148" height="66" rx="14" fill={a} />
            <rect x="34" y="34" width="132" height="12" rx="6" fill={hi} />
            <rect x="18" y="88" width="164" height="30" rx="10" fill={s} />
            <rect x="26" y="78" width="148" height="20" rx="9" fill={a} opacity="0.9" />
            <rect x="18" y="116" width="164" height="10" rx="4" fill={w} />
            <path d="M28 126 V140 M172 126 V140" stroke={w} strokeWidth="7" strokeLinecap="round" />
          </>
        );
      case 'nightstand':
        return (
          <>
            <rect x="58" y="52" width="84" height="74" rx="8" fill={w} />
            <rect x="58" y="52" width="84" height="8" rx="4" fill={hi} />
            <rect x="66" y="66" width="68" height="24" rx="4" fill={a} opacity="0.35" />
            <rect x="66" y="94" width="68" height="24" rx="4" fill={a} opacity="0.35" />
            <rect x="88" y="76" width="24" height="3" rx="1.5" fill={hi} />
            <path d="M68 126 L64 142 M132 126 L136 142" stroke={w} strokeWidth="6" strokeLinecap="round" />
          </>
        );
      case 'dining':
        return (
          <>
            <rect x="20" y="70" width="160" height="12" rx="6" fill={w} />
            <rect x="20" y="70" width="160" height="4" rx="2" fill={hi} />
            <path d="M42 82 L36 138 M158 82 L164 138" stroke={w} strokeWidth="8" strokeLinecap="round" />
            <rect x="52" y="44" width="22" height="18" rx="8" fill={a} />
            <rect x="126" y="44" width="22" height="18" rx="8" fill={a} />
          </>
        );
      case 'chair':
        return (
          <>
            <rect x="68" y="24" width="64" height="58" rx="22" fill={a} />
            <rect x="74" y="30" width="52" height="10" rx="5" fill={hi} />
            <rect x="62" y="84" width="76" height="16" rx="8" fill={s} />
            <path d="M72 100 L64 140 M128 100 L136 140" stroke={w} strokeWidth="7" strokeLinecap="round" />
            <path d="M84 100 L84 136 M116 100 L116 136" stroke={w} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
          </>
        );
      case 'desk':
        return (
          <>
            <rect x="18" y="64" width="164" height="12" rx="5" fill={w} />
            <rect x="18" y="64" width="164" height="4" rx="2" fill={hi} />
            <rect x="124" y="76" width="50" height="52" rx="5" fill={a} />
            <rect x="130" y="86" width="38" height="14" rx="3" fill={hi} opacity="0.5" />
            <rect x="130" y="106" width="38" height="14" rx="3" fill={hi} opacity="0.5" />
            <path d="M30 76 L26 136" stroke={w} strokeWidth="7" strokeLinecap="round" />
          </>
        );
    }
  })();

  return (
    <svg className="furn" viewBox="0 0 200 160" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <ellipse cx="100" cy="143" rx="72" ry="6" fill="rgba(0,0,0,0.13)" />
      {shapes}
    </svg>
  );
}
