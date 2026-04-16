import { useState } from 'react'

export default function WorkoutScreen({ setScreen }) {
  const session = JSON.parse(localStorage.getItem('activeSession') || 'null')
  const [currentEx, setCurrentEx] = useState(0)
  const [sets, setSets] = useState([])
  const [weight, setWeight] = useState(session?.exercises[0]?.target || 20)
  const [reps, setReps] = useState(10)
  const [done, setDone] = useState(false)

  if (!session) return (
    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#b07a8e' }}>
      No active session. Go to Plan and start a workout.
    </div>
  )

  const exercise = session.exercises[currentEx]
  const totalSets = exercise?.sets || 3
  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
  const lastLog = workoutLogs[exercise?.name]

  const logSet = () => {
    const newSets = [...sets, { weight, reps }]
    setSets(newSets)

    const logs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
    logs[exercise.name] = { weight, reps, date: new Date().toISOString() }
    localStorage.setItem('workoutLogs', JSON.stringify(logs))

    if (newSets.length >= totalSets) {
      if (currentEx < session.exercises.length - 1) {
        const nextEx = session.exercises[currentEx + 1]
        setCurrentEx(currentEx + 1)
        setSets([])
        setWeight(nextEx.target || 20)
        setReps(10)
      } else {
        const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
        logs[today + '_done'] = true
        localStorage.setItem('workoutLogs', JSON.stringify(logs))

        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
        workouts.push({ session: session.name, date: new Date().toISOString(), exercises: session.exercises.length })
        localStorage.setItem('workouts', JSON.stringify(workouts))

        const streak = parseInt(localStorage.getItem('streak') || '0')
        localStorage.setItem('streak', streak + 1)

        setDone(true)
      }
    }
  }

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  if (done) return (
    <div style={{ padding: '24px 16px', textAlign: 'center' }}>
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: '#f7d6e4', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '20px auto 16px',
        fontSize: '36px'
      }}>💪</div>
      <div style={{ fontSize: '22px', fontWeight: '500', color: '#4a2030', marginBottom: '8px' }}>Workout done!</div>
      <div style={{ fontSize: '12px', color: '#b07a8e', marginBottom: '24px' }}>{session.name} · {session.exercises.length} exercises</div>

      <div style={{ ...card, textAlign: 'left' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>How did your workout go?</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Great', bg: '#e1f5ee', color: '#0f6e56' },
            { label: 'Okay', bg: '#faeeda', color: '#854f0b' },
            { label: 'Poor', bg: '#fcebeb', color: '#a32d2d' },
          ].map((opt, i) => (
            <button key={i} onClick={() => {
              localStorage.setItem('lastWorkoutRating', opt.label)
              setScreen('home')
            }} style={{
              flex: 1, padding: '10px', borderRadius: '99px',
              border: 'none', cursor: 'pointer',
              background: opt.bg, color: opt.color,
              fontSize: '12px', fontWeight: '500'
            }}>{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => setScreen('plan')} style={{
        background: 'none', border: 'none', color: '#993556',
        fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: '500'
      }}>← Back to plan</button>

      <div style={{ fontSize: '18px', fontWeight: '500', color: '#4a2030', marginBottom: '2px' }}>{exercise.name}</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '20px' }}>
        Set {sets.length + 1} of {totalSets} · {session.name}
      </div>

      {/* Last session */}
      {lastLog && (
        <div style={{ ...card, background: '#fdf0f4' }}>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '4px', textAlign: 'center' }}>Last session</div>
          <div style={{ fontSize: '22px', fontWeight: '500', color: '#4a2030', textAlign: 'center' }}>{lastLog.weight} kg</div>
          <div style={{ fontSize: '11px', color: '#b07a8e', textAlign: 'center' }}>{lastLog.reps} reps</div>
        </div>
      )}

      {/* Weight */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '12px' }}>WEIGHT (KG)</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setWeight(Math.max(0, weight - 2.5))} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '20px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '500', color: '#4a2030' }}>{weight}</div>
            <div style={{ fontSize: '11px', color: '#b07a8e' }}>kg</div>
          </div>
          <button onClick={() => setWeight(weight + 2.5)} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '20px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>+</button>
        </div>
      </div>

      {/* Reps */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '12px' }}>REPS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setReps(Math.max(1, reps - 1))} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '20px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '36px', fontWeight: '500', color: '#4a2030' }}>{reps}</div>
            <div style={{ fontSize: '11px', color: '#b07a8e' }}>reps</div>
          </div>
          <button onClick={() => setReps(reps + 1)} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '20px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>+</button>
        </div>
      </div>

      {/* Sets logged */}
      {sets.length > 0 && (
        <div style={{ ...card }}>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '8px' }}>Sets logged</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <div key={i} style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: i < sets.length ? '#d4537e' : '#fdf0f4',
                border: '0.5px solid #f0dde5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: i < sets.length ? '#fff' : '#b07a8e', fontWeight: '500'
              }}>{i < sets.length ? `${sets[i].weight}` : ''}</div>
            ))}
          </div>
        </div>
      )}

      <button onClick={logSet} style={{
        width: '100%', background: '#993556', color: '#fff',
        border: 'none', borderRadius: '99px', padding: '16px',
        fontSize: '14px', fontWeight: '500', cursor: 'pointer'
      }}>
        Log set {sets.length + 1} of {totalSets}
      </button>
    </div>
  )
}