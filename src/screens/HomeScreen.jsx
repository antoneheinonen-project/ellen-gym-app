import { useState, useEffect } from 'react'

const XP_PER_LEVEL = 500

export default function HomeScreen({ setScreen }) {
  const [checkIn, setCheckIn] = useState(null)
  const [streak, setStreak] = useState(0)
  const [workouts, setWorkouts] = useState([])
  const [xp, setXp] = useState(0)

  useEffect(() => {
    const savedCheckIn = localStorage.getItem('lastCheckIn')
    const savedStreak = localStorage.getItem('streak')
    const savedWorkouts = localStorage.getItem('workouts')
    const savedXp = localStorage.getItem('xp')
    if (savedCheckIn) setCheckIn(JSON.parse(savedCheckIn))
    if (savedStreak) setStreak(parseInt(savedStreak))
    if (savedWorkouts) setWorkouts(JSON.parse(savedWorkouts))
    if (savedXp) setXp(parseInt(savedXp))
  }, [])

  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  const xpPercent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')

  const todaysPlan = [
    { name: 'Hip thrust', last: workoutLogs['Hip thrust'] ? `${workoutLogs['Hip thrust'].weight} kg · last session` : '80 kg · 4×10', target: '82.5 kg' },
    { name: 'Romanian deadlift', last: workoutLogs['Romanian deadlift'] ? `${workoutLogs['Romanian deadlift'].weight} kg · last session` : '55 kg · 3×12', target: '57.5 kg' },
    { name: 'Cable kickback', last: workoutLogs['Cable kickback'] ? `${workoutLogs['Cable kickback'].weight} kg · last session` : '20 kg · 3×15', target: '22 kg' },
    { name: 'Leg curl', last: workoutLogs['Leg curl'] ? `${workoutLogs['Leg curl'].weight} kg · last session` : '40 kg · 3×12', target: '42.5 kg' },
  ]

  const totalPRs = Object.keys(workoutLogs).filter(k => !k.includes('_done')).length

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const lastRating = localStorage.getItem('lastWorkoutRating')

  return (
    <div style={{ padding: '24px 16px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030' }}>{getGreeting()}</div>
          <div style={{ fontSize: '12px', color: '#b07a8e', marginTop: '2px' }}>
            {workouts.length === 0 ? 'Ready to start your journey?' : `${workouts.length} workouts logged`}
          </div>
        </div>

        {/* Streak ring */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: `3px solid ${streak > 0 ? '#d4537e' : '#f7d6e4'}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#993556' }}>{streak}</div>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>streak</div>
        </div>
      </div>

      {/* Last workout rating banner */}
      {lastRating && lastRating !== 'Great' && (
        <div style={{
          ...card,
          background: '#faeeda',
          borderLeft: '3px solid #ef9f27',
          borderRadius: '0 16px 16px 0',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#854f0b', marginBottom: '2px' }}>
            Last workout was {lastRating.toLowerCase()}
          </div>
          <div style={{ fontSize: '10px', color: '#633806' }}>
            Check your progress tab for the full analysis.
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { num: workouts.length, label: 'Workouts' },
          { num: totalPRs > 0 ? `${totalPRs}` : '0', label: 'Exercises logged' },
          { num: streak > 0 ? `${streak}🔥` : '0', label: 'Day streak' },
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
            <button onClick={() => setScreen('plan')} style={{
              background: '#f7d6e4', color: '#993556', border: 'none',
              borderRadius: '99px', padding: '5px 12px',
              fontSize: '10px', fontWeight: '500', cursor: 'pointer'
            }}>Start</button>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030' }}>Level {level}</div>
          <div style={{ fontSize: '10px', color: '#b07a8e' }}>{xpIntoLevel} / {XP_PER_LEVEL} XP</div>
        </div>
        <div style={{ background: '#fbe8f0', borderRadius: '99px', height: '8px' }}>
          <div style={{
            background: 'linear-gradient(90deg, #d4537e, #993556)',
            borderRadius: '99px', height: '8px',
            width: `${xpPercent}%`,
            transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>
            {xp} total XP
          </div>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>
            {XP_PER_LEVEL - xpIntoLevel} XP to level {level + 1}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={card}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Badges</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { icon: '💪', label: 'First workout', unlocked: workouts.length >= 1 },
            { icon: '🔥', label: '3 day streak', unlocked: streak >= 3 },
            { icon: '⭐', label: '5 workouts', unlocked: workouts.length >= 5 },
            { icon: '🏆', label: '10 workouts', unlocked: workouts.length >= 10 },
          ].map((badge, i) => (
            <div key={i} style={{
              flex: 1, background: badge.unlocked ? '#f7d6e4' : '#fdf0f4',
              borderRadius: '12px', padding: '8px 4px', textAlign: 'center',
              opacity: badge.unlocked ? 1 : 0.4,
              border: badge.unlocked ? '0.5px solid #f0dde5' : '0.5px solid #f0dde5'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{badge.icon}</div>
              <div style={{ fontSize: '8px', color: '#993556', fontWeight: '500', lineHeight: '1.2' }}>{badge.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Check in nudge */}
      {!checkIn ? (
        <button onClick={() => setScreen('checkin')} style={{
          width: '100%', background: '#993556', color: '#fff',
          border: 'none', borderRadius: '99px', padding: '14px',
          fontSize: '13px', fontWeight: '500', cursor: 'pointer'
        }}>
          Log today's check-in
        </button>
      ) : (
        <div style={{ ...card, borderLeft: '3px solid #1d9e75', borderRadius: '0 16px 16px 0' }}>
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