import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

export default function WorkoutScreen({ setScreen }) {
  const session = JSON.parse(localStorage.getItem('activeSession') || 'null')
  const [currentEx, setCurrentEx] = useState(0)
  const [sets, setSets] = useState([])
  const [weight, setWeight] = useState(session?.exercises[0]?.target || 20)
  const [reps, setReps] = useState(10)
  const [done, setDone] = useState(false)
  const [rating, setRating] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [restTimer, setRestTimer] = useState(null)
  const [restSeconds, setRestSeconds] = useState(0)
  const [showPR, setShowPR] = useState(false)
  const [increment, setIncrement] = useState(2.5)

  useEffect(() => {
    let interval
    if (restTimer) {
      interval = setInterval(() => {
        setRestSeconds(s => {
          if (s <= 1) {
            clearInterval(interval)
            setRestTimer(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [restTimer])

  if (!session) return (
    <div style={{ padding: '24px 16px', textAlign: 'center', color: '#b07a8e', marginTop: '40px' }}>
      No active session. Go to Plan and start a workout.
    </div>
  )

  const exercise = session.exercises[currentEx]
  const totalSets = exercise?.sets || 3
  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
  const lastLog = workoutLogs[exercise?.name]
  const isPR = lastLog && weight > lastLog.weight

  const logSet = () => {
    const newSets = [...sets, { weight, reps }]
    setSets(newSets)

    if (isPR) {
      setShowPR(true)
      setTimeout(() => setShowPR(false), 2500)
    }

    const logs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
    logs[exercise.name] = { weight, reps, date: new Date().toISOString() }

    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '{}')
    if (!history[exercise.name]) history[exercise.name] = []
    history[exercise.name].push({ weight, reps, date: new Date().toISOString() })
    localStorage.setItem('exerciseHistory', JSON.stringify(history))

    if (newSets.length >= totalSets) {
      if (currentEx < session.exercises.length - 1) {
        const nextEx = session.exercises[currentEx + 1]
        setCurrentEx(currentEx + 1)
        setSets([])
        setWeight(nextEx.target || 20)
        setReps(10)
        setRestTimer(true)
        setRestSeconds(90)
      } else {
        const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' })
        logs[today + '_done'] = true
        localStorage.setItem('workoutLogs', JSON.stringify(logs))

        const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
        workouts.push({
          session: session.name,
          date: new Date().toISOString(),
          exercises: session.exercises.length
        })
        localStorage.setItem('workouts', JSON.stringify(workouts))

        const trainedDays = JSON.parse(localStorage.getItem('trainedDays') || '[]')
        const todayNum = new Date().getDate()
        if (!trainedDays.includes(todayNum)) trainedDays.push(todayNum)
        localStorage.setItem('trainedDays', JSON.stringify(trainedDays))

        const streak = parseInt(localStorage.getItem('streak') || '0')
        localStorage.setItem('streak', String(streak + 1))

        setDone(true)
      }
    } else {
      setRestTimer(true)
      setRestSeconds(90)
    }
  }

  const getAnalysis = async (selectedRating) => {
    setRating(selectedRating)
    if (selectedRating === 'Great') {
      setAnalysis({
        type: 'great',
        headline: 'Strong session',
        body: 'You hit your targets and your recovery was solid. This is exactly the kind of session that builds progress. Keep the same conditions going into your next workout.',
        factors: []
      })
      saveXP(150)
      return
    }

    setLoading(true)
    const checkIn = JSON.parse(localStorage.getItem('lastCheckIn') || 'null')

    const prompt = `You are a direct, honest fitness coach. A woman just rated her glute workout as "${selectedRating}".

Her check-in data today:
- Sleep: ${checkIn?.sleep || 'unknown'} hours
- Water: ${checkIn?.water || 'unknown'} glasses  
- Stress: ${checkIn?.stress || 'unknown'}/5
- Alcohol yesterday: ${checkIn?.alcohol ? 'Yes' : 'No'}
- Food: ${checkIn?.food || 'not logged'}

Workout: ${session.name}
Exercises: ${session.exercises.map(e => e.name).join(', ')}

Give a direct, honest analysis of why the workout was ${selectedRating.toLowerCase()}. No fluff. Just facts.

Respond ONLY with valid JSON:
{
  "headline": "<short verdict, max 5 words>",
  "body": "<2-3 sentences, direct and honest>",
  "factors": [
    { "label": "<factor>", "detail": "<one sentence>", "impact": "<High|Medium|Low>" }
  ],
  "nextStep": "<one concrete action>"
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 600,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const json = JSON.parse(data.content[0].text)
      setAnalysis({ type: 'poor', ...json })
      saveXP(selectedRating === 'Okay' ? 60 : 40)
    } catch (e) {
      setAnalysis({
        type: 'poor',
        headline: 'Below average session',
        body: 'Could not load full analysis. Check your connection.',
        factors: [],
        nextStep: 'Rest and try again next session.'
      })
    }
    setLoading(false)
  }

  const saveXP = (amount) => {
    const xp = parseInt(localStorage.getItem('xp') || '0') + amount
    localStorage.setItem('xp', String(xp))
    localStorage.setItem('lastWorkoutRating', rating)
  }

  const impactColor = {
    High: { bg: '#fcebeb', color: '#a32d2d', dot: '#e24b4a' },
    Medium: { bg: '#faeeda', color: '#854f0b', dot: '#ef9f27' },
    Low: { bg: '#f7d6e4', color: '#993556', dot: '#d4537e' },
  }

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (done && !rating) return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#f7d6e4', display: 'flex', alignItems: 'center',
          justifyContent: 'center', margin: '0 auto 12px', fontSize: '32px'
        }}>💪</div>
        <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>Workout done!</div>
        <div style={{ fontSize: '11px', color: '#b07a8e' }}>{session.name} · {session.exercises.length} exercises</div>
      </div>

      <div style={card}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>How did your workout go?</div>
        <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '14px' }}>Be honest — this helps the app understand your progress</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Great', bg: '#e1f5ee', color: '#0f6e56' },
            { label: 'Okay', bg: '#faeeda', color: '#854f0b' },
            { label: 'Poor', bg: '#fcebeb', color: '#a32d2d' },
          ].map((opt, i) => (
            <button key={i} onClick={() => getAnalysis(opt.label)} style={{
              flex: 1, padding: '12px 6px', borderRadius: '99px',
              border: 'none', cursor: 'pointer',
              background: opt.bg, color: opt.color,
              fontSize: '12px', fontWeight: '500'
            }}>{opt.label}</button>
          ))}
        </div>
      </div>

      <div style={{ ...card, background: '#fdf0f4' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '8px' }}>Today's lifts</div>
        {session.exercises.map((ex, i) => {
          const log = workoutLogs[ex.name]
          return (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '5px 0',
              borderBottom: i < session.exercises.length - 1 ? '0.5px solid #fbe8f0' : 'none',
              fontSize: '11px'
            }}>
              <div style={{ color: '#4a2030' }}>{ex.name}</div>
              <div style={{ color: '#b07a8e' }}>{log ? `${log.weight} kg · ${log.reps} reps` : '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  if (loading) return (
    <div style={{ padding: '24px 16px', textAlign: 'center', marginTop: '60px' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>🧠</div>
      <div style={{ fontSize: '14px', fontWeight: '500', color: '#4a2030', marginBottom: '8px' }}>Analysing your session...</div>
      <div style={{ fontSize: '11px', color: '#b07a8e' }}>Cross-referencing your check-in data</div>
    </div>
  )

  if (analysis) return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
          background: analysis.type === 'great' ? '#e1f5ee' : '#fcebeb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
        }}>{analysis.type === 'great' ? '💪' : '😔'}</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#4a2030' }}>{analysis.headline}</div>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginTop: '2px' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} · {session.name}
          </div>
        </div>
      </div>

      <div style={{
        ...card,
        borderLeft: `3px solid ${analysis.type === 'great' ? '#1d9e75' : '#e24b4a'}`,
        background: analysis.type === 'great' ? '#e1f5ee' : '#fcebeb',
        borderRadius: '0 16px 16px 0'
      }}>
        <div style={{ fontSize: '10px', fontWeight: '500', marginBottom: '6px', color: analysis.type === 'great' ? '#0f6e56' : '#a32d2d' }}>
          {analysis.type === 'great' ? 'Why this worked' : 'What likely hurt your performance'}
        </div>
        <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>{analysis.body}</div>
      </div>

      {analysis.factors?.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Contributing factors</div>
          {analysis.factors.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '8px 0',
              borderBottom: i < analysis.factors.length - 1 ? '0.5px solid #fbe8f0' : 'none'
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                flexShrink: 0, marginTop: '3px',
                background: impactColor[f.impact]?.dot || '#d4537e'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '2px' }}>{f.label}</div>
                <div style={{ fontSize: '10px', color: '#b07a8e', lineHeight: '1.4' }}>{f.detail}</div>
              </div>
              <div style={{
                background: impactColor[f.impact]?.bg, color: impactColor[f.impact]?.color,
                borderRadius: '99px', padding: '2px 8px', fontSize: '9px', fontWeight: '500', flexShrink: 0
              }}>{f.impact}</div>
            </div>
          ))}
        </div>
      )}

      {analysis.nextStep && (
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '6px' }}>What to do next</div>
          <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>{analysis.nextStep}</div>
        </div>
      )}

      <div style={{ ...card, background: '#f7d6e4', border: 'none', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#993556', marginBottom: '2px' }}>
          +{rating === 'Great' ? '150' : rating === 'Okay' ? '60' : '40'} XP earned
        </div>
        <div style={{ fontSize: '10px', color: '#b07a8e' }}>Logged to your progress</div>
      </div>

      <button onClick={() => setScreen('home')} style={{
        width: '100%', background: '#993556', color: '#fff',
        border: 'none', borderRadius: '99px', padding: '14px',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer'
      }}>Back to home</button>
    </div>
  )

  return (
    <div style={{ padding: '24px 16px' }}>
      <button onClick={() => setScreen('plan')} style={{
        background: 'none', border: 'none', color: '#993556',
        fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: '500'
      }}>← Back to plan</button>

      {/* Exercise progress indicator */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {session.exercises.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '99px',
            background: i < currentEx ? '#993556' : i === currentEx ? '#d4537e' : '#fbe8f0'
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#4a2030' }}>{exercise.name}</div>
        <div style={{ fontSize: '10px', color: '#b07a8e', marginTop: '4px' }}>
          {currentEx + 1} of {session.exercises.length}
        </div>
      </div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '16px' }}>
        Set {sets.length + 1} of {totalSets}
      </div>

      {/* PR banner */}
      {showPR && (
        <div style={{
          background: '#e1f5ee', borderRadius: '12px', padding: '10px 14px',
          marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
          border: '0.5px solid #5dcaa5'
        }}>
          <div style={{ fontSize: '18px' }}>🏆</div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#0f6e56' }}>New personal record!</div>
            <div style={{ fontSize: '10px', color: '#1d9e75' }}>
              {weight} kg — up from {lastLog?.weight} kg last time
            </div>
          </div>
        </div>
      )}

      {/* Rest timer */}
      {restTimer && (
        <div style={{
          background: '#fdf0f4', borderRadius: '12px', padding: '12px 14px',
          marginBottom: '12px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', border: '0.5px solid #f0dde5'
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '2px' }}>Rest timer</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#993556' }}>{formatTime(restSeconds)}</div>
          </div>
          <button onClick={() => setRestTimer(false)} style={{
            background: '#f7d6e4', border: 'none', borderRadius: '99px',
            padding: '6px 14px', fontSize: '11px', color: '#993556',
            fontWeight: '500', cursor: 'pointer'
          }}>Skip</button>
        </div>
      )}

      {/* Last session */}
      {lastLog && (
        <div style={{ ...card, background: '#fdf0f4', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '4px' }}>Last session</div>
          <div style={{ fontSize: '26px', fontWeight: '500', color: '#4a2030' }}>{lastLog.weight} kg</div>
          <div style={{ fontSize: '11px', color: '#b07a8e' }}>{lastLog.reps} reps</div>
        </div>
      )}

      {/* Weight */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px' }}>WEIGHT (KG)</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[1.25, 2.5, 5].map(inc => (
              <button key={inc} onClick={() => setIncrement(inc)} style={{
                padding: '3px 8px', borderRadius: '99px', border: 'none',
                background: increment === inc ? '#993556' : '#f7d6e4',
                color: increment === inc ? '#fff' : '#993556',
                fontSize: '9px', fontWeight: '500', cursor: 'pointer'
              }}>±{inc}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setWeight(Math.max(0, parseFloat((weight - increment).toFixed(2))))} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '20px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px', fontWeight: '500',
              color: isPR ? '#0f6e56' : '#4a2030'
            }}>{weight}</div>
            <div style={{ fontSize: '11px', color: '#b07a8e' }}>kg {isPR && '↑ PR'}</div>
          </div>
          <button onClick={() => setWeight(parseFloat((weight + increment).toFixed(2)))} style={{
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
        <div style={card}>
          <div style={{ fontSize: '10px', color: '#b07a8e', marginBottom: '8px' }}>Sets logged</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Array.from({ length: totalSets }).map((_, i) => (
              <div key={i} style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: i < sets.length ? '#d4537e' : '#fdf0f4',
                border: '0.5px solid #f0dde5',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {i < sets.length && (
                  <>
                    <div style={{ fontSize: '10px', color: '#fff', fontWeight: '500' }}>{sets[i].weight}</div>
                    <div style={{ fontSize: '8px', color: '#f7d6e4' }}>{sets[i].reps}r</div>
                  </>
                )}
              </div>
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