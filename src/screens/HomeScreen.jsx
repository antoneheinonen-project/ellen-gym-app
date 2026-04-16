import { useState, useEffect, useRef } from 'react'

const XP_PER_LEVEL = 500

const PLAN = {
  Monday: {
    name: 'Glutes & hamstrings',
    exercises: ['Hip thrust', 'Romanian deadlift', 'Cable kickback', 'Leg curl']
  },
  Wednesday: {
    name: 'Glutes & quads',
    exercises: ['Bulgarian split squat', 'Leg press (high foot)', 'Hip abduction machine', 'Frog pump']
  },
  Friday: {
    name: 'Glutes focus',
    exercises: ['Sumo deadlift', 'Single-leg hip thrust', 'Side-lying clam', 'Cable kickback']
  },
}

export default function HomeScreen({ setScreen }) {
  const [checkIn, setCheckIn] = useState(null)
  const [streak, setStreak] = useState(0)
  const [workouts, setWorkouts] = useState([])
  const [xp, setXp] = useState(0)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerMode, setTimerMode] = useState('stopwatch')
  const [countdownFrom, setCountdownFrom] = useState(60)
  const intervalRef = useRef(null)

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

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(s => {
          if (timerMode === 'countdown') {
            if (s <= 1) {
              setTimerRunning(false)
              return 0
            }
            return s - 1
          }
          return s + 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timerRunning, timerMode])

  const startTimer = () => {
    if (timerMode === 'countdown' && timerSeconds === 0) {
      setTimerSeconds(countdownFrom)
    }
    setTimerRunning(true)
  }

  const resetTimer = () => {
    setTimerRunning(false)
    setTimerSeconds(timerMode === 'countdown' ? countdownFrom : 0)
  }

  const formatTime = (s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
  const todaySession = PLAN[today] || null
  const isRestDay = !todaySession

  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = xp % XP_PER_LEVEL
  const xpPercent = Math.round((xpIntoLevel / XP_PER_LEVEL) * 100)

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getNextSession = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const todayIndex = days.indexOf(today)
    for (let i = 1; i <= 7; i++) {
      const next = days[(todayIndex + i) % 7]
      if (PLAN[next]) return { day: next, session: PLAN[next] }
    }
  }

  const nextSession = getNextSession()
  const lastRating = localStorage.getItem('lastWorkoutRating')

  const timerProgress = timerMode === 'countdown'
    ? ((countdownFrom - timerSeconds) / countdownFrom) * 100
    : Math.min((timerSeconds / 300) * 100, 100)

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const COUNTDOWN_PRESETS = [30, 60, 90, 120, 180, 300]

  return (
    <div style={{ padding: '24px 16px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030' }}>{getGreeting()}</div>
          <div style={{ fontSize: '12px', color: '#b07a8e', marginTop: '2px' }}>
            {isRestDay ? `${today} — rest day` : `${today} — ${todaySession.name}`}
          </div>
        </div>
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
          ...card, background: '#faeeda',
          borderLeft: '3px solid #ef9f27',
          borderRadius: '0 16px 16px 0', marginBottom: '12px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#854f0b', marginBottom: '2px' }}>
            Last workout was {lastRating.toLowerCase()}
          </div>
          <div style={{ fontSize: '10px', color: '#633806' }}>
            Check your progress tab for the full analysis.
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[
          { num: workouts.length, label: 'Workouts' },
          { num: `Lvl ${level}`, label: 'Current level' },
          { num: streak > 0 ? streak : '0', label: 'Day streak' },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, background: '#fff', border: '0.5px solid #f0dde5',
            borderRadius: '12px', padding: '10px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#993556' }}>{stat.num}</div>
            <div style={{ fontSize: '9px', color: '#b07a8e', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Today's session OR rest day */}
      {isRestDay ? (
        <div style={{ ...card, textAlign: 'center', padding: '24px 14px' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌸</div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>
            Rest day
          </div>
          <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '12px', lineHeight: '1.5' }}>
            Recovery is where the growth happens. Eat well, sleep well, hydrate.
          </div>
          {nextSession && (
            <div style={{
              background: '#fdf0f4', borderRadius: '10px', padding: '10px',
              fontSize: '11px', color: '#4a2030'
            }}>
              Next session: <span style={{ fontWeight: '500', color: '#993556' }}>
                {nextSession.day} — {nextSession.session.name}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div style={card}>
          <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>
            Today — {todaySession.name}
          </div>
          {todaySession.exercises.map((exName, i) => {
            const lastLog = workoutLogs[exName]
            return (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < todaySession.exercises.length - 1 ? '0.5px solid #fbe8f0' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>{exName}</div>
                  <div style={{ fontSize: '10px', color: '#b07a8e', marginTop: '2px' }}>
                    {lastLog ? `Last: ${lastLog.weight} kg · ${lastLog.reps} reps` : 'No previous log'}
                  </div>
                </div>
                <button onClick={() => setScreen('plan')} style={{
                  background: '#f7d6e4', color: '#993556', border: 'none',
                  borderRadius: '99px', padding: '5px 12px',
                  fontSize: '10px', fontWeight: '500', cursor: 'pointer'
                }}>Start</button>
              </div>
            )
          })}
          <button onClick={() => {
            localStorage.setItem('activeSession', JSON.stringify({
              name: todaySession.name,
              exercises: todaySession.exercises.map(name => ({
                name, sets: 3, reps: '10-12',
                target: workoutLogs[name]?.weight || 20, tag: 'Glute-focused'
              }))
            }))
            setScreen('workout')
          }} style={{
            width: '100%', background: '#993556', color: '#fff',
            border: 'none', borderRadius: '99px', padding: '12px',
            fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginTop: '12px'
          }}>
            Start today's workout
          </button>
        </div>
      )}

      {/* Timer */}
      <div style={card}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Timer</div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
          {['stopwatch', 'countdown'].map(mode => (
            <button key={mode} onClick={() => {
              setTimerMode(mode)
              setTimerRunning(false)
              setTimerSeconds(mode === 'countdown' ? countdownFrom : 0)
            }} style={{
              flex: 1, padding: '6px', borderRadius: '99px', border: 'none',
              background: timerMode === mode ? '#993556' : '#f7d6e4',
              color: timerMode === mode ? '#fff' : '#993556',
              fontSize: '10px', fontWeight: '500', cursor: 'pointer',
              textTransform: 'capitalize'
            }}>{mode}</button>
          ))}
        </div>

        {/* Countdown presets */}
        {timerMode === 'countdown' && !timerRunning && timerSeconds === 0 && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {COUNTDOWN_PRESETS.map(sec => (
              <button key={sec} onClick={() => {
                setCountdownFrom(sec)
                setTimerSeconds(sec)
              }} style={{
                padding: '4px 10px', borderRadius: '99px', border: 'none',
                background: countdownFrom === sec ? '#993556' : '#fdf0f4',
                color: countdownFrom === sec ? '#fff' : '#b07a8e',
                fontSize: '10px', fontWeight: '500', cursor: 'pointer',
                border: `0.5px solid ${countdownFrom === sec ? '#993556' : '#f0dde5'}`
              }}>
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>
        )}

        {/* Timer display */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          {/* Progress ring */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="#fbe8f0" strokeWidth="6" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="#d4537e" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - timerProgress / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '26px', fontWeight: '500', color: '#4a2030'
            }}>
              {formatTime(timerSeconds)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={resetTimer} style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: '#fdf0f4', border: '0.5px solid #f0dde5',
            fontSize: '16px', cursor: 'pointer', color: '#b07a8e'
          }}>↺</button>
          <button onClick={() => timerRunning ? setTimerRunning(false) : startTimer()} style={{
            flex: 1, background: timerRunning ? '#f7d6e4' : '#993556',
            color: timerRunning ? '#993556' : '#fff',
            border: 'none', borderRadius: '99px', padding: '12px',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer'
          }}>
            {timerRunning ? 'Pause' : timerSeconds > 0 ? 'Resume' : 'Start'}
          </button>
        </div>
      </div>

      {/* XP bar */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030' }}>Level {level}</div>
          <div style={{ fontSize: '10px', color: '#b07a8e' }}>{xpIntoLevel} / {XP_PER_LEVEL} XP</div>
        </div>
        <div style={{ background: '#fbe8f0', borderRadius: '99px', height: '8px' }}>
          <div style={{
            background: '#d4537e', borderRadius: '99px', height: '8px',
            width: `${xpPercent}%`, transition: 'width 0.5s ease'
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>{xp} total XP</div>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>{XP_PER_LEVEL - xpIntoLevel} XP to level {level + 1}</div>
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
              border: '0.5px solid #f0dde5'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{badge.icon}</div>
              <div style={{ fontSize: '8px', color: '#993556', fontWeight: '500', lineHeight: '1.2' }}>
                {badge.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Check in */}
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