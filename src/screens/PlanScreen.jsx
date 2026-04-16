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
  'Custom': { bg: '#e1f5ee', color: '#0f6e56' },
}

const DEFAULT_EXERCISES = [
  'Hip thrust', 'Romanian deadlift', 'Cable kickback', 'Leg curl',
  'Bulgarian split squat', 'Leg press (high foot)', 'Hip abduction machine',
  'Frog pump', 'Sumo deadlift', 'Single-leg hip thrust', 'Side-lying clam',
  'Glute bridge', 'Step up', 'Walking lunge', 'Donkey kick', 'Fire hydrant',
]

export default function PlanScreen({ setScreen }) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
  const [selectedDay, setSelectedDay] = useState(null)
  const [showFreeWorkout, setShowFreeWorkout] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [selectedExercises, setSelectedExercises] = useState([])
  const [newExName, setNewExName] = useState('')
  const [newExTag, setNewExTag] = useState('Glute-focused')
  const [newExSets, setNewExSets] = useState(3)
  const [search, setSearch] = useState('')

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
  const customExercises = JSON.parse(localStorage.getItem('customExercises') || '[]')
  const allExercises = [...DEFAULT_EXERCISES, ...customExercises.map(e => e.name)]

  const saveCustomExercise = () => {
    if (!newExName.trim()) return
    const existing = customExercises.find(e => e.name.toLowerCase() === newExName.toLowerCase())
    if (existing) { alert('Exercise already exists!'); return }
    const updated = [...customExercises, { name: newExName.trim(), tag: newExTag, sets: newExSets }]
    localStorage.setItem('customExercises', JSON.stringify(updated))
    setNewExName('')
    setShowAddExercise(false)
  }

  const toggleExercise = (name) => {
    setSelectedExercises(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    )
  }

  const startFreeWorkout = () => {
    if (selectedExercises.length === 0) { alert('Pick at least one exercise!'); return }
    const session = {
      name: 'Free workout',
      exercises: selectedExercises.map(name => {
        const custom = customExercises.find(e => e.name === name)
        return {
          name,
          sets: custom?.sets || 3,
          reps: '10–12',
          target: workoutLogs[name]?.weight || 20,
          tag: custom?.tag || 'Glute-focused'
        }
      })
    }
    localStorage.setItem('activeSession', JSON.stringify(session))
    setScreen('workout')
  }

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '10px',
    border: '0.5px solid #f0dde5',
  }

  const filteredExercises = allExercises.filter(e =>
    e.toLowerCase().includes(search.toLowerCase())
  )

  // Free workout builder
  if (showFreeWorkout) return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => { setShowFreeWorkout(false); setSelectedExercises([]) }} style={{
        background: 'none', border: 'none', color: '#993556',
        fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: '500'
      }}>← Back</button>

      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>Free workout</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '16px' }}>
        Pick any exercises you want
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search exercises..."
        style={{
          width: '100%', background: '#fff', border: '0.5px solid #f0dde5',
          borderRadius: '99px', padding: '10px 16px', fontSize: '12px',
          color: '#4a2030', outline: 'none', fontFamily: 'inherit',
          marginBottom: '12px', boxSizing: 'border-box'
        }}
      />

      {/* Selected count */}
      {selectedExercises.length > 0 && (
        <div style={{
          background: '#f7d6e4', borderRadius: '10px', padding: '8px 12px',
          marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#993556' }}>
            {selectedExercises.length} exercise{selectedExercises.length > 1 ? 's' : ''} selected
          </div>
          <button onClick={startFreeWorkout} style={{
            background: '#993556', color: '#fff', border: 'none',
            borderRadius: '99px', padding: '6px 14px',
            fontSize: '11px', fontWeight: '500', cursor: 'pointer'
          }}>Start →</button>
        </div>
      )}

      {/* Exercise list */}
      <div style={card}>
        {filteredExercises.map((name, i) => {
          const isSelected = selectedExercises.includes(name)
          const lastLog = workoutLogs[name]
          const custom = customExercises.find(e => e.name === name)
          const tag = custom?.tag || 'Glute-focused'
          return (
            <div key={i} onClick={() => toggleExercise(name)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0',
              borderBottom: i < filteredExercises.length - 1 ? '0.5px solid #fbe8f0' : 'none',
              cursor: 'pointer'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '2px' }}>{name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    background: tagColors[tag]?.bg || '#f7d6e4',
                    color: tagColors[tag]?.color || '#993556',
                    borderRadius: '99px', padding: '1px 7px', fontSize: '9px', fontWeight: '500'
                  }}>{custom ? 'Custom' : tag}</div>
                  {lastLog && (
                    <div style={{ fontSize: '9px', color: '#b07a8e' }}>Last: {lastLog.weight} kg</div>
                  )}
                </div>
              </div>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: isSelected ? '#993556' : '#fdf0f4',
                border: `0.5px solid ${isSelected ? '#993556' : '#f0dde5'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', color: '#fff'
              }}>{isSelected ? '✓' : ''}</div>
            </div>
          )
        })}
      </div>

      {/* Add custom exercise */}
      {!showAddExercise ? (
        <button onClick={() => setShowAddExercise(true)} style={{
          width: '100%', background: '#fdf0f4', color: '#993556',
          border: '0.5px solid #f0dde5', borderRadius: '99px', padding: '12px',
          fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginBottom: '12px'
        }}>
          + Add your own exercise
        </button>
      ) : (
        <div style={{ ...card, marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '12px' }}>
            New exercise
          </div>
          <input
            value={newExName}
            onChange={e => setNewExName(e.target.value)}
            placeholder="Exercise name..."
            style={{
              width: '100%', background: '#fdf0f4', border: '0.5px solid #f0dde5',
              borderRadius: '10px', padding: '10px', fontSize: '12px',
              color: '#4a2030', outline: 'none', fontFamily: 'inherit',
              marginBottom: '10px', boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '6px' }}>Type</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {['Glute-focused', 'Compound', 'Isolation'].map(t => (
              <button key={t} onClick={() => setNewExTag(t)} style={{
                flex: 1, padding: '6px 4px', borderRadius: '99px', border: 'none',
                background: newExTag === t ? '#993556' : '#f7d6e4',
                color: newExTag === t ? '#fff' : '#993556',
                fontSize: '9px', fontWeight: '500', cursor: 'pointer'
              }}>{t}</button>
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '6px' }}>Default sets</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <button onClick={() => setNewExSets(Math.max(1, newExSets - 1))} style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#f7d6e4',
              border: 'none', fontSize: '16px', color: '#993556', cursor: 'pointer'
            }}>−</button>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#4a2030' }}>{newExSets}</div>
            <button onClick={() => setNewExSets(Math.min(10, newExSets + 1))} style={{
              width: '32px', height: '32px', borderRadius: '50%', background: '#f7d6e4',
              border: 'none', fontSize: '16px', color: '#993556', cursor: 'pointer'
            }}>+</button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowAddExercise(false)} style={{
              flex: 1, background: '#fdf0f4', color: '#b07a8e',
              border: '0.5px solid #f0dde5', borderRadius: '99px', padding: '10px',
              fontSize: '12px', cursor: 'pointer'
            }}>Cancel</button>
            <button onClick={saveCustomExercise} style={{
              flex: 1, background: '#993556', color: '#fff',
              border: 'none', borderRadius: '99px', padding: '10px',
              fontSize: '12px', fontWeight: '500', cursor: 'pointer'
            }}>Save exercise</button>
          </div>
        </div>
      )}

      {selectedExercises.length > 0 && (
        <button onClick={startFreeWorkout} style={{
          width: '100%', background: '#993556', color: '#fff',
          border: 'none', borderRadius: '99px', padding: '14px',
          fontSize: '13px', fontWeight: '500', cursor: 'pointer'
        }}>
          Start workout ({selectedExercises.length} exercises)
        </button>
      )}
    </div>
  )

  // Day drill-down
  if (selectedDay) {
    const session = PLAN.find(p => p.day === selectedDay)
    return (
      <div style={{ padding: '24px 16px' }}>
        <button onClick={() => setSelectedDay(null)} style={{
          background: 'none', border: 'none', color: '#993556',
          fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: '500'
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

        <button onClick={() => {
          localStorage.setItem('activeSession', JSON.stringify(session))
          setScreen('workout')
        }} style={{
          width: '100%', background: '#993556', color: '#fff',
          border: 'none', borderRadius: '99px', padding: '14px',
          fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginTop: '8px'
        }}>
          Start workout
        </button>
      </div>
    )
  }

  // Main plan view
  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>My plan</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '16px' }}>3 sessions per week · Glute hypertrophy</div>

      {/* Free workout button */}
      <button onClick={() => setShowFreeWorkout(true)} style={{
        width: '100%', background: '#fff', color: '#993556',
        border: '1.5px solid #d4537e', borderRadius: '99px', padding: '12px',
        fontSize: '12px', fontWeight: '500', cursor: 'pointer', marginBottom: '16px'
      }}>
        + Start a free workout
      </button>

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
          }} onClick={() => session && setSelectedDay(day)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: session ? '6px' : 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>
                {day} {session ? `— ${session.name}` : '— Rest'}
              </div>
              <div style={{
                background: isToday ? '#993556' : isDone ? '#e1f5ee' : '#f7d6e4',
                color: isToday ? '#fff' : isDone ? '#0f6e56' : '#993556',
                borderRadius: '99px', padding: '3px 10px', fontSize: '9px', fontWeight: '500'
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