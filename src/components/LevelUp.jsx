import { useEffect, useState } from 'react'

export default function LevelUp({ level, onClose }) {
  const [visible, setVisible] = useState(true)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
      color: ['#993556','#d4537e','#f7d6e4','#fbeaf0','#b07a8e'][Math.floor(Math.random() * 5)],
      size: 6 + Math.random() * 8,
    }))
    setParticles(p)

    const timer = setTimeout(() => {
      setVisible(false)
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(153,53,86,0.97)', zIndex: 9999,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.4s ease'
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fall { 0% { transform: translateY(-20px) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
        @keyframes pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Falling particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-10px',
          width: `${p.size}px`,
          height: `${p.size}px`,
          borderRadius: '50%',
          background: p.color,
          animation: `fall ${p.duration}s ${p.delay}s linear infinite`,
          opacity: 0.8,
        }} />
      ))}

      {/* Level badge */}
      <div style={{
        width: '120px', height: '120px', borderRadius: '50%',
        border: '4px solid #f7d6e4',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: '24px',
        animation: 'pop 0.6s ease forwards, pulse 2s 0.6s ease infinite',
        background: 'rgba(255,255,255,0.15)'
      }}>
        <div style={{ fontSize: '48px', fontWeight: '500', color: '#fff' }}>{level}</div>
      </div>

      {/* Text */}
      <div style={{
        fontSize: '32px', fontWeight: '500', color: '#fff',
        marginBottom: '12px', textAlign: 'center',
        animation: 'pop 0.6s 0.2s ease both'
      }}>
        Level {level}!
      </div>

      <div style={{
        fontSize: '28px', fontWeight: '500', color: '#f7d6e4',
        marginBottom: '8px', textAlign: 'center',
        animation: 'pop 0.6s 0.4s ease both'
      }}>
        Pylly pyöreeks! 🍑
      </div>

      <div style={{
        fontSize: '18px', color: '#fbeaf0',
        marginBottom: '40px', textAlign: 'center',
        animation: 'pop 0.6s 0.6s ease both'
      }}>
        Minä rakastan sinua ❤️
      </div>

      <button onClick={() => { setVisible(false); onClose() }} style={{
        background: '#fff', color: '#993556',
        border: 'none', borderRadius: '99px',
        padding: '12px 32px', fontSize: '13px',
        fontWeight: '500', cursor: 'pointer',
        animation: 'pop 0.6s 0.8s ease both',
        opacity: 0
      }}>
        Let's go!
      </button>
    </div>
  )
}