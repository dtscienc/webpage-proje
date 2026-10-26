import { useState, useEffect, useId, type ReactNode } from 'react'

/* ── live clock ── */
function useTime() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

/* ── warped watch — muted charcoal palette ── */
function WarpedClock({ size = 380 }: { size?: number }) {
  const instanceId = useId().replace(/:/g, '')
  const warpId = `warp-${instanceId}`
  const faceId = `face-bg-${instanceId}`
  const glossId = `gloss-${instanceId}`
  const handGlowId = `hand-glow-${instanceId}`
  const time = useTime()
  const s = time.getSeconds()
  const m = time.getMinutes()
  const h = time.getHours() % 12

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  const C = size / 2
  const R = size * 0.44

  const hourMarkers = Array.from({ length: 12 }, (_, i) => {
    const a   = ((i * 30 - 90) * Math.PI) / 180
    const maj = i % 3 === 0
    const r1  = R - 22
    const r2  = R - (maj ? 7 : 13)
    return { a, maj, x1: C + r1 * Math.cos(a), y1: C + r1 * Math.sin(a), x2: C + r2 * Math.cos(a), y2: C + r2 * Math.sin(a) }
  })

  const minMarkers = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null
    const a = ((i * 6 - 90) * Math.PI) / 180
    return { x1: C + (R - 17) * Math.cos(a), y1: C + (R - 17) * Math.sin(a), x2: C + (R - 12) * Math.cos(a), y2: C + (R - 12) * Math.sin(a) }
  }).filter(Boolean) as { x1: number; y1: number; x2: number; y2: number }[]

  return (
    <div className="relative select-none drift" style={{ width: size, height: size }}>
      {/* very quiet ambient glow */}
      <div className="absolute pointer-events-none aura-breathe" style={{ inset: '-20%', background: 'radial-gradient(ellipse at 50% 50%, #78788010 0%, transparent 70%)', borderRadius: '50%' }} />

      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} overflow="visible">
        <defs>
          {/* living warp — subtle displacement */}
          <filter id={warpId} x="-24%" y="-24%" width="148%" height="148%">
            <feTurbulence type="turbulence" baseFrequency="0.006 0.012" numOctaves="3" seed="11" result="noise">
              <animate attributeName="baseFrequency" values="0.006 0.012;0.014 0.021;0.008 0.017;0.006 0.012" dur="16s" repeatCount="indefinite" />
              <animate attributeName="seed" values="11;15;8;11" dur="32s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G">
              <animate attributeName="scale" values="11;17;13;11" dur="13s" repeatCount="indefinite" />
            </feDisplacementMap>
          </filter>

          <radialGradient id={faceId} cx="40%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#131318" />
            <stop offset="100%" stopColor="#060608" />
          </radialGradient>

          <radialGradient id={glossId} cx="30%" cy="18%" r="48%">
            <stop offset="0%"   stopColor="#ffffff06" />
            <stop offset="100%" stopColor="#ffffff00" />
          </radialGradient>

          <filter id={handGlowId} filterUnits="userSpaceOnUse" x="0" y="0" width={size} height={size}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="wide-blur" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="tight-blur" />
            <feMerge>
              <feMergeNode in="wide-blur" />
              <feMergeNode in="tight-blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter={`url(#${warpId})`}>
          {/* outer rings — barely there */}
          <circle cx={C} cy={C} r={R + 10} fill="none" stroke="#2a2a30" strokeWidth="0.5" opacity="0.5" />
          <circle cx={C} cy={C} r={R + 4}  fill="none" stroke="#303038" strokeWidth="0.8" opacity="0.6" />

          {/* face */}
          <circle cx={C} cy={C} r={R} fill={`url(#${faceId})`} />
          <circle cx={C} cy={C} r={R} fill="none" stroke="#303038" strokeWidth="1" opacity="0.7" />

          {/* decorative inner ring */}
          <circle cx={C} cy={C} r={R - 18} fill="none" stroke="#222228" strokeWidth="0.4" opacity="0.6" strokeDasharray="4 12" />

          {/* gloss */}
          <circle cx={C} cy={C} r={R} fill={`url(#${glossId})`} />

          {/* hour marks */}
          {hourMarkers.map(({ x1, y1, x2, y2, maj }, i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={maj ? '#6a6a72' : '#252528'}
              strokeWidth={maj ? '2' : '0.8'}
              opacity={maj ? '0.8' : '0.55'}
            />
          ))}

          {/* minute marks */}
          {minMarkers.map(({ x1, y1, x2, y2 }, i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#1c1c22" strokeWidth="0.5" opacity="0.6"
            />
          ))}

          {/* brand */}
          <text x={C} y={C - R * 0.38} textAnchor="middle" fill="#aaaab2" opacity="0.95"
                fontSize="11" fontFamily="Orbitron, monospace" letterSpacing="5" fontWeight="600">
            ECLATANT
          </text>
          <text x={C} y={C - R * 0.38 + 16} textAnchor="middle" fill="#9898a0" opacity="0.95"
                fontSize="7" fontFamily="Orbitron, monospace" letterSpacing="7">
            IPSUM · 001
          </text>

          {/* hour hand */}
          <g transform={`rotate(${hourDeg}, ${C}, ${C})`}>
            <rect
              x={C - 2.6}
              y={C - R * 0.4}
              width="5.2"
              height={R * 0.48}
              fill="#74747c"
              opacity="0.58"
            />
          </g>

          {/* minute hand */}
          <g transform={`rotate(${minDeg}, ${C}, ${C})`}>
            <rect
              x={C - 2}
              y={C - R * 0.52}
              width="4"
              height={R * 0.62}
              fill="#e3e7f0"
              opacity="0.96"
              filter={`url(#${handGlowId})`}
            />
          </g>

          {/* second hand */}
          <g transform={`rotate(${secDeg}, ${C}, ${C})`}>
            <rect
              x={C - 1.3}
              y={C - R * 0.58}
              width="2.6"
              height={R * 0.68}
              fill="#4a4855"
            />
          </g>

          {/* center */}
          <rect x={C - 5} y={C - 5} width="10" height="10" fill="#0c0c10" />
          <rect x={C - 2.25} y={C - 2.25} width="4.5" height="4.5" fill="#73737c" opacity="0.9" />
        </g>
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function App() {
  const [hovNav, setHovNav] = useState<string | null>(null)
  const [navExpanded, setNavExpanded] = useState(false)

  return (
    <div className="app-shell" style={{ minHeight: '100vh', backgroundColor: '#080809', color: '#d2d2d8', fontFamily: "'Orbitron', monospace", overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav id="glass-navigation" className={`system-nav page-pad${navExpanded ? ' is-expanded' : ''}`} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '32px 80px 62px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #08080980, transparent)',
        backdropFilter: 'blur(16px)',
      }}>
        <div className="nav-identity">
          <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 13, letterSpacing: '8px', color: '#aaaab2', fontWeight: 600 }}>
            LOREM
          </span>
          <span className="nav-coordinate">N 48° 51′ · E 002° 21′</span>
        </div>
        <div className="nav-links" style={{ display: 'flex', gap: 'clamp(44px, 6vw, 104px)' }}>
          {(['IPSUM', 'DOLOR', 'SIT', 'AMET'] as const).map(item => (
            <a key={item} href="#"
              style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, letterSpacing: '4px', color: hovNav === item ? '#d2d2d8' : '#aaaab2', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={() => setHovNav(item)}
              onMouseLeave={() => setHovNav(null)}
            >{item}</a>
          ))}
        </div>
        <div className="nav-telemetry" aria-hidden="true">
          <span>SYS—ECL/01</span>
          <span className="nav-signal"><i /></span>
          <span>00:00:01:26</span>
        </div>
        <button
          className="nav-resize-control"
          type="button"
          aria-expanded={navExpanded}
          aria-controls="glass-navigation"
          onClick={() => setNavExpanded(expanded => !expanded)}
        >
          <span className="nav-resize-icon" aria-hidden="true">
            <i />
            <i />
          </span>
          <span>{navExpanded ? 'CLICK TO COLLAPSE BAR' : 'CLICK TO INCREASE BAR'}</span>
          <span className="nav-resize-state">{navExpanded ? '38%' : '140 PX'}</span>
        </button>
      </nav>

      {/* ── HERO ── */}
      <section className="section-frame hero-frame hero-grid page-pad" style={{
        minHeight: '100vh',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
        padding: '0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* very faint background tone */}
        <div className="pointer-events-none" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 50%, #20202808 0%, transparent 60%)' }} />

        {/* ghost number */}
        <div className="pointer-events-none select-none" style={{ position: 'absolute', top: '8%', right: '-2%', fontFamily: 'Orbitron, monospace', fontSize: 'clamp(180px, 26vw, 360px)', fontWeight: 900, color: '#b4b4ba', opacity: 0.016, lineHeight: 1 }}>
          01
        </div>

        {/* left: copy */}
        <div style={{ paddingTop: 110, paddingBottom: 90, position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: '9px', color: '#aaaab2', marginBottom: 30 }}>
            LOREM IPSUM · 2026
          </div>

          <h1 className="hero-title hero-title-heavy" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(42px, 5.2vw, 78px)', fontWeight: 900, lineHeight: 0.98, letterSpacing: '-1.5px', margin: '0 0 32px', color: '#d2d2d8' }}>
            <span style={{ display: 'block' }}>LOREM</span>
            <span style={{ display: 'block', color: '#b4b4bc' }}>IPSUM DOLOR</span>
            <span style={{ display: 'block' }}>SIT AMET</span>
          </h1>

          <p style={{ fontSize: 14, fontWeight: 400, color: '#bcbcc4', lineHeight: 1.8, maxWidth: 420, marginBottom: 52, letterSpacing: '0.4px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tempus, neque vel posuere luctus, sapien lorem feugiat nulla.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <GhostButton primary>LOREM IPSUM</GhostButton>
            <GhostButton>DOLOR SIT</GhostButton>
          </div>
        </div>

        {/* right: clock */}
        <div className="hero-watch" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 110, paddingBottom: 90, position: 'relative', zIndex: 1 }}>
          <WarpedClock size={400} />
        </div>
      </section>

      {/* thin rule */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #1e1e24, transparent)', margin: '0 80px' }} />

      {/* ── PRODUCT MOCKUPS ── */}
      <section id="collection" className="section-frame page-pad" style={{ padding: '130px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="watch-echo watch-echo-one" aria-hidden="true"><WarpedClock size={330} /></div>
        <SectionLabel index="02">LOREM IPSUM</SectionLabel>
        <h2 className="section-title" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px, 3.2vw, 46px)', fontWeight: 700, margin: '0 0 42px', color: '#d2d2d8', letterSpacing: '2px' }}>
          DOLOR SIT AMET
        </h2>

        <div className="metrics-rail" style={{ marginTop: 42, paddingTop: 40, borderTop: '1px solid #14141a', display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {[['250', 'Lorem ipsum'], ['50ml', 'Dolor sit amet'], ['18H', 'Consectetur'], ['04', 'Adipiscing elit']].map(([val, lab]) => (
            <div key={lab}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 22, fontWeight: 700, color: '#aaaab2', letterSpacing: '1px' }}>{val}</div>
              <div style={{ fontSize: 12, letterSpacing: '2px', color: '#aaaab2', marginTop: 6 }}>{lab}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── SPECIFICATIONS ── */}
      <section id="specs" className="section-frame page-pad" style={{ padding: '120px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="watch-echo watch-echo-two" aria-hidden="true"><WarpedClock size={280} /></div>
        <SectionLabel index="03">LOREM &amp; IPSUM</SectionLabel>
        <h2 className="section-title" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px, 3.2vw, 46px)', fontWeight: 700, margin: '0 0 64px', color: '#d2d2d8', letterSpacing: '2px' }}>
          DOLOR SIT AMET
        </h2>

        <div className="spec-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
          {[
            ['LOREM IPSUM',       'Dolor · Sit · Amet',           'Consectetur adipiscing elit'],
            ['SED DO EIUSMOD',    'Tempor · Incididunt · Labore', 'Ut enim ad minim veniam'],
            ['QUIS NOSTRUD',      'Exercitation · Ullamco',       'Laboris nisi ut aliquip'],
            ['DUIS AUTE',         'Irure Dolor',                  'In reprehenderit voluptate'],
            ['EXCEPTEUR',         'Sint · Occaecat',              'Cupidatat non proident'],
            ['SUNT CULPA',        'Qui officia deserunt',         'Mollit anim id est laborum'],
          ].map(([label, value, sub], i) => (
            <div className="spec-row" key={i} style={{
              padding: '32px 0',
              borderBottom: '1px solid #101016',
              borderRight: i % 2 === 0 ? '1px solid #101016' : 'none',
              paddingRight: i % 2 === 0 ? 60 : 0,
              paddingLeft: i % 2 === 1 ? 60 : 0,
            }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8.5, letterSpacing: '5px', color: '#a8a8b0', marginBottom: 10 }}>{label}</div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 17, fontWeight: 600, color: '#c4c4cc', letterSpacing: '0.5px', marginBottom: 6 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#aeaeb6', fontWeight: 400 }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── FEATURES ── */}
      <section id="story" className="section-frame page-pad" style={{ padding: '120px 80px', position: 'relative', overflow: 'hidden' }}>
        <div className="watch-echo watch-echo-three" aria-hidden="true"><WarpedClock size={360} /></div>
        <SectionLabel index="04">LOREM IPSUM</SectionLabel>
        <h2 className="section-title" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(24px, 3.2vw, 46px)', fontWeight: 700, margin: '0 0 80px', color: '#d2d2d8', letterSpacing: '2px' }}>
          DOLOR SIT AMET
        </h2>

        <div className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
          {[
            { n: '—01', title: 'LOREM IPSUM', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' },
            { n: '—02', title: 'DOLOR SIT AMET', body: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' },
            { n: '—03', title: 'CONSECTETUR', body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
          ].map(({ n, title, body }) => (
            <div className="feature-cell" key={n}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 48, fontWeight: 900, color: '#b4b4ba', opacity: 0.04, lineHeight: 1, marginBottom: 20 }}>{n}</div>
              <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: '6px', color: '#a2a2aa', fontWeight: 600, marginBottom: 14 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#b4b4bc', lineHeight: 1.85, fontWeight: 400 }}>{body}</p>
              <div style={{ marginTop: 24, width: 24, height: 1, background: '#2a2a32' }} />
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── CTA ── */}
      <section id="acquire" className="section-frame cta-frame page-pad" style={{ padding: '160px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="pointer-events-none aura-breathe" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, #5a5a6008 0%, transparent 60%)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: '9px', color: '#aaaab2', marginBottom: 36 }}>
            LOREM · IPSUM DOLOR SIT
          </div>

          <h2 className="section-title cta-title" style={{ fontFamily: 'Orbitron, monospace', fontSize: 'clamp(32px, 5.5vw, 82px)', fontWeight: 900, margin: '0 0 20px', color: '#d2d2d8', letterSpacing: '4px', lineHeight: 1.04 }}>
            LOREM<br />
            <span style={{ color: '#aeaeb6' }}>IPSUM</span>
          </h2>

          <p style={{ fontSize: 13, color: '#b0b0b8', fontWeight: 400, marginBottom: 56, letterSpacing: '1px' }}>
            Lorem ipsum dolor · Consectetur adipiscing · Sed do eiusmod
          </p>

          <GhostButton primary large>LOREM · IPSUM DOLOR</GhostButton>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="system-footer page-pad" style={{ padding: '36px 80px', borderTop: '1px solid #101016', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, letterSpacing: '7px', color: '#aaaab2', fontWeight: 700 }}>LOREM</span>
        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, letterSpacing: '4px', color: '#9a9aa2' }}>© 2026 · LOREM IPSUM DOLOR</span>
        <div style={{ display: 'flex', gap: 28 }}>
          {['LOREM', 'IPSUM', 'DOLOR'].map(item => (
            <a key={item} href="#" style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, letterSpacing: '3px', color: '#9a9aa2', textDecoration: 'none', transition: 'color 0.3s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c4c4cc')}
              onMouseLeave={e => (e.currentTarget.style.color = '#9a9aa2')}
            >{item}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}

/* ── shared atoms ── */

function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="system-label" style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, letterSpacing: '8px', color: '#aaaab2', marginBottom: 18 }}>
      {index} · {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #14141a, transparent)', margin: '0 80px' }} />
}

function GhostButton({ children, primary, large }: { children: ReactNode; primary?: boolean; large?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      className="system-button"
      style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: large ? 9 : 8,
        letterSpacing: '6px',
        padding: large ? '17px 64px' : '12px 28px',
        background: hov ? '#ffffff05' : 'transparent',
        border: `1px solid ${hov ? '#3a3a42' : (primary ? '#282830' : '#1c1c22')}`,
        color: hov ? '#dedee4' : (primary ? '#c2c2ca' : '#b0b0b8'),
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        borderRadius: 0,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  )
}
