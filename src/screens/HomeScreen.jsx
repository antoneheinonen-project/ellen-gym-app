import { useState, useEffect } from 'react'

export default function HomeScreen({ setScreen }) {
  const [checkIn, setCheckIn] = useState(null)
  const [streak, setStreak] = useState(0)
  const [workouts, setWorkouts] = useState([])

  useEffect(() => {
    const savedCheckIn = localStorage.getItem('lastCheckIn')
    const savedStreak = localStorage.getItem('streak')
    const savedWorkouts = localStorage.getItem('workouts')
    if (savedCheckIn) setCheckIn(JSON.parse(savedCheckIn))
    if (savedStreak) setStreak(parseInt(savedStreak))
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts))
  }, [])

  const todaysPlan = [
    { name: 'Hip thrust', last: '80 kg · 4×10', target: '82.5 kg' },
    { name: 'RDL', last: '55 kg · 3×12', target: '57.5 kg' },
    { name: 'Cable kickback', last: '20 kg · 3×15', target: '22 kg' },
    { name: 'Leg curl', last: '40 kg · 3×12', target: '42.5 kg' },
  ]

  const card = {
    background: '#fff',
    borderRadius: '16px',
    padding: '14px',
    marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const pill = (text, bg, color) => ({
    display: 'inline-block',
    background: bg,
    color: color,
    borderRadius: '99px',
    padding: '3px 10px',
    fontSize: '10px',
    fontWeight: '500',
  })

  return (
    <div style={{ padding: '24px 16px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030' }}>Good morning</div>
          <div style={{ fontSize: '12px', color: '#b07a8e', marginTop: '2px' }}>Ready to grow?</div>
        </div>

        {/* Streak ring */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: '3px solid #f7d6e4', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#993556' }}>{streak}</div>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>streak</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { num: workouts.length || 0, label: 'Workouts' },
          { num: '+0%', label: 'Avg strength' },
          { num: '0', label: 'PRs this week' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: '#fff', border: '0.5px solid #f0dde5',
            borderRadius: '12px', padding: '10px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#993556' }}>{stat.num}</div>
            <div style={{ fontSize: '9px', color: '#b07a8e', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's plan */}
      <div style={card}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>
          Today's plan — Glutes & hamstrings
        </div>
        {todaysPlan.map((ex, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0',
            borderBottom: i < todaysPlan.length - 1 ? '0.5px solid #fbe8f0' : 'none'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>{ex.name}</div>
              <div style={{ fontSize: '10px', color: '#b07a8e', marginTop: '2px' }}>Last: {ex.last}</div>
            </div>
            <button
              onClick={() => setScreen('plan')}
              style={{
                background: '#f7d6e4', color: '#993556', border: 'none',
                borderRadius: '99px', padding: '5px 12px',
                fontSize: '10px', fontWeight: '500', cursor: 'pointer'
              }}>
              Start
            </button>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030' }}>Level 1</div>
          <div style={{ fontSize: '10px', color: '#b07a8e' }}>0 / 500 XP</div>
        </div>
        <div style={{ background: '#fbe8f0', borderRadius: '99px', height: '6px' }}>
          <div style={{ background: '#d4537e', borderRadius: '99px', height: '6px', width: '0%' }} />
        </div>
        <div style={{ fontSize: '9px', color: '#b07a8e', marginTop: '6px', textAlign: 'right' }}>
          500 XP to level 2
        </div>
      </div>

      {/* Check in nudge */}
      {!checkIn && (
        <button
          onClick={() => setScreen('checkin')}
          style={{
            width: '100%', background: '#993556', color: '#fff',
            border: 'none', borderRadius: '99px', padding: '14px',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer'
          }}>
          Log today's check-in
        </button>
      )}

      {checkIn && (
        <div style={{ ...card, borderLeft: '3px solid #1d9e75' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#0f6e56', marginBottom: '4px' }}>
            Today's check-in done
          </div>
          <div style={{ fontSize: '10px', color: '#4a2030' }}>
            Sleep: {checkIn.sleep}hrs · Water: {checkIn.water} glasses · Stress: {checkIn.stress}/5
          </div>
        </div>
      )}

    </div>
  )
}