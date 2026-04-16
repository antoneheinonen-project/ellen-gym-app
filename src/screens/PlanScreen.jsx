import { useState } from 'react'

const PLAN = [
  {
    day: 'Monday',
    name: 'Glutes & hamstrings',
    exercises: [
      { name: 'Hip thrust', sets: 4, reps: '8–10', target: 80, tag: 'Glute-focused' },
      { name: 'Romanian deadlift', sets: 3, reps: '10–12', target: 55, tag: 'Compound' },
      { name: 'Cable kickback', sets: 3, reps: '15', target: 20, tag: 'Isolation' },
      { name: 'Leg curl', sets: 3, reps: '12', target: 40, tag: 'Isolation' },
    ]
  },
  {
    day: 'Wednesday',
    name: 'Glutes & quads',
    exercises: [
      { name: 'Bulgarian split squat', sets: 4, reps: '8–10', target: 20, tag: 'Compound' },
      { name: 'Leg press (high foot)', sets: 3, reps: '12', target: 80, tag: 'Compound' },
      { name: 'Hip abduction machine', sets: 3, reps: '15', target: 50, tag: 'Isolation' },
      { name: 'Frog pump', sets: 3, reps: '20–25', target: 0, tag: 'Glute-focused' },
    ]
  },
  {
    day: 'Friday',
    name: 'Glutes focus',
    exercises: [
      { name: 'Sumo deadlift', sets: 4, reps: '8', target: 60, tag: 'Compound' },
      { name: 'Single-leg hip thrust', sets: 3, reps: '10', target: 40, tag: 'Glute-focused' },
      { name: 'Side-lying clam', sets: 3, reps: '15', target: 10, tag: 'Isolation' },
      { name: 'Cable kickback', sets: 3, reps: '15', target: 18, tag: 'Isolation' },
    ]
  },
]

const REST_DAYS = ['Tuesday', 'Thursday', 'Saturday', 'Sunday']

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const tagColors = {
  'Glute-focused': { bg: '#f7d6e4', color: '#993556' },
  'Compound': { bg: '#eeedfe', color: '#534ab7' },
  'Isolation': { bg: '#faeeda', color: '#854f0b' },
}

export default function PlanScreen({ setScreen }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
  const [selectedDay, setSelectedDay] = useState(null)

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  if (selectedDay) {
    const session = PLAN.find(p => p.day === selectedDay)
    return (
      <div style={{ padding: '24px 16px' }}>
        <button onClick={() => setSelectedDay(null)} style={{
          background: 'none', border: 'none', color: '#993556',
          fontSize: '12px', cursor: 'pointer', marginBottom: '16px',
          padding: 0, fontWeight: '500'
        }}>← Back</button>

        <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>{selectedDay}</div>
        <div style={{ fontSize: '12px', color: '#b07a8e', marginBottom: '20px' }}>
          {session.name} · {session.exercises.length} exercises · ~{session.exercises.length * 12} min
        </div>

        {session.exercises.map((ex, i) => {
          const lastLog = workoutLogs[ex.name]
          return (
            <div key={i} style={{ ...card, marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#4a2030' }}>{ex.name}</div>
                <div style={{
                  background: tagColors[ex.tag]?.bg, color: tagColors[ex.tag]?.color,
                  borderRadius: '99px', padding: '2px 8px', fontSize: '9px', fontWeight: '500'
                }}>{ex.tag}</div>
              </div>
              <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '6px' }}>
                {ex.sets} sets · {ex.reps} reps · Target: {ex.target > 0 ? `${ex.target} kg` : 'Bodyweight'}
              </div>
              {lastLog ? (
                <div style={{ fontSize: '10px', color: '#0f6e56', fontWeight: '500' }}>
                  Last session: {lastLog.weight} kg · {lastLog.reps} reps
                </div>
              ) : (
                <div style={{ fontSize: '10px', color: '#b07a8e' }}>No previous log</div>
              )}
            </div>
          )
        })}

        <button
          onClick={() => {
            localStorage.setItem('activeSession', JSON.stringify(session))
            setScreen('workout')
          }}
          style={{
            width: '100%', background: '#993556', color: '#fff',
            border: 'none', borderRadius: '99px', padding: '14px',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '8px'
          }}>
          Start workout
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>My plan</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '20px' }}>3 sessions per week · Glute hypertrophy</div>

      {DAYS.map((day, i) => {
        const session = PLAN.find(p => p.day === day)
        const isToday = day === today
        const isRest = REST_DAYS.includes(day)
        const isDone = workoutLogs[day + '_done']

        return (
          <div key={i} style={{
            ...card,
            border: isToday ? '1.5px solid #d4537e' : '0.5px solid #f0dde5',
            opacity: isRest ? 0.5 : 1,
            cursor: session ? 'pointer' : 'default'
          }}
            onClick={() => session && setSelectedDay(day)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: session ? '6px' : 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>
                {day} {session ? `— ${session.name}` : '— Rest'}
              </div>
              <div style={{
                background: isToday ? '#993556' : isDone ? '#e1f5ee' : isRest ? '#f7d6e4' : '#f7d6e4',
                color: isToday ? '#fff' : isDone ? '#0f6e56' : '#993556',
                borderRadius: '99px', padding: '3px 10px',
                fontSize: '9px', fontWeight: '500'
              }}>
                {isToday ? 'Today' : isDone ? 'Done' : isRest ? 'Rest' : 'Upcoming'}
              </div>
            </div>
            {session && (
              <div style={{ fontSize: '10px', color: '#b07a8e' }}>
                {session.exercises.map(e => e.name).join(' · ')}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}