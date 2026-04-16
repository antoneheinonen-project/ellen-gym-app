import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProgressScreen() {
  const [tab, setTab] = useState('strength')
  const [selectedExercise, setSelectedExercise] = useState('Hip thrust')

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
  const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]')
  const streak = parseInt(localStorage.getItem('streak') || '0')

  const exercises = [
    'Hip thrust', 'Romanian deadlift', 'Cable kickback',
    'Leg curl', 'Bulgarian split squat', 'Sumo deadlift'
  ]

  const getChartData = (exName) => {
    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '{}')
    const logs = history[exName] || []
    if (logs.length === 0) {
      return [
        { week: 'W1', weight: 60 },
        { week: 'W2', weight: 65 },
        { week: 'W3', weight: 67.5 },
        { week: 'W4', weight: 70 },
        { week: 'W5', weight: 72.5 },
        { week: 'W6', weight: 75 },
      ]
    }
    return logs.map((l, i) => ({ week: `W${i + 1}`, weight: l.weight }))
  }

  const chartData = getChartData(selectedExercise)
  const firstWeight = chartData[0]?.weight || 0
  const lastWeight = chartData[chartData.length - 1]?.weight || 0
  const gain = lastWeight - firstWeight

  const getDaysInMonth = () => {
    const now = new Date()
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    return Array.from({ length: days }, (_, i) => i + 1)
  }

  const trainedDays = JSON.parse(localStorage.getItem('trainedDays') || '[2,4,7,9,11,14,16]')

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#fff', border: '0.5px solid #f0dde5',
          borderRadius: '10px', padding: '8px 12px', fontSize: '11px', color: '#4a2030'
        }}>
          <div style={{ fontWeight: '500' }}>{payload[0].value} kg</div>
        </div>
      )
    }
    return null
  }

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>Progress</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '16px' }}>Strength & consistency</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {['strength', 'history', 'alerts'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '8px', borderRadius: '99px', border: 'none',
            background: tab === t ? '#993556' : '#f7d6e4',
            color: tab === t ? '#fff' : '#993556',
            fontSize: '11px', fontWeight: '500', cursor: 'pointer',
            textTransform: 'capitalize'
          }}>{t}</button>
        ))}
      </div>

      {/* STRENGTH TAB */}
      {tab === 'strength' && (
        <>
          {/* Exercise selector */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {exercises.map(ex => (
              <button key={ex} onClick={() => setSelectedExercise(ex)} style={{
                padding: '5px 12px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                background: selectedExercise === ex ? '#993556' : '#fff',
                color: selectedExercise === ex ? '#fff' : '#b07a8e',
                fontSize: '10px', fontWeight: '500',
                border: `0.5px solid ${selectedExercise === ex ? '#993556' : '#f0dde5'}`
              }}>{ex}</button>
            ))}
          </div>

          {/* Chart */}
          <div style={card}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '12px' }}>{selectedExercise}</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fbe8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#b07a8e' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#b07a8e' }} axisLine={false} tickLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="weight"
                  stroke="#d4537e" strokeWidth={2.5}
                  dot={{ fill: '#993556', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: '#993556' }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '8px' }}>
              <div style={{ color: '#b07a8e' }}>Started {firstWeight} kg</div>
              <div style={{ color: '#0f6e56', fontWeight: '500' }}>+{gain} kg total</div>
            </div>
          </div>

          {/* All exercises list */}
          <div style={card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>All exercises</div>
            {exercises.map((ex, i) => {
              const log = workoutLogs[ex]
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0', borderBottom: i < exercises.length - 1 ? '0.5px solid #fbe8f0' : 'none',
                  cursor: 'pointer'
                }} onClick={() => setSelectedExercise(ex)}>
                  <div style={{ fontSize: '11px', color: '#4a2030', fontWeight: '500' }}>{ex}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {log ? (
                      <>
                        <div style={{ fontSize: '10px', color: '#0f6e56' }}>{log.weight} kg</div>
                        <div style={{
                          background: '#f7d6e4', color: '#993556',
                          borderRadius: '99px', padding: '2px 7px', fontSize: '9px', fontWeight: '500'
                        }}>PR</div>
                      </>
                    ) : (
                      <div style={{ fontSize: '10px', color: '#b07a8e' }}>No logs yet</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* HISTORY TAB */}
      {tab === 'history' && (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              { num: workouts.length || 0, label: 'Workouts' },
              { num: streak, label: 'Day streak' },
              { num: workouts.length > 0 ? '89%' : '0%', label: 'Consistency' },
            ].map((stat, i) => (
              <div key={i} style={{
                flex: 1, background: '#fff', border: '0.5px solid #f0dde5',
                borderRadius: '12px', padding: '10px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: '500', color: '#993556' }}>{stat.num}</div>
                <div style={{ fontSize: '9px', color: '#b07a8e', marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div style={card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>This month</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '6px' }}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ fontSize: '8px', color: '#b07a8e', textAlign: 'center', paddingBottom: '2px' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
              {getDaysInMonth().map((day, i) => {
                const trained = trainedDays.includes(day)
                const isToday = day === new Date().getDate()
                return (
                  <div key={i} style={{
                    aspectRatio: '1', borderRadius: '5px',
                    background: isToday ? '#993556' : trained ? '#d4537e' : '#fbe8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '8px', color: isToday || trained ? '#fff' : '#e8c4d0',
                    fontWeight: isToday ? '500' : '400'
                  }}>{day}</div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              {[
                { color: '#d4537e', label: 'Trained' },
                { color: '#fbe8f0', label: 'Rest' },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: l.color }} />
                  <div style={{ fontSize: '9px', color: '#b07a8e' }}>{l.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sessions */}
          <div style={card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Recent sessions</div>
            {workouts.length === 0 ? (
              <div style={{ fontSize: '11px', color: '#b07a8e', textAlign: 'center', padding: '10px 0' }}>
                No workouts logged yet. Start one from the Plan tab!
              </div>
            ) : workouts.slice(-5).reverse().map((w, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '7px 0', borderBottom: i < workouts.length - 1 ? '0.5px solid #fbe8f0' : 'none'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030' }}>{w.session}</div>
                  <div style={{ fontSize: '9px', color: '#b07a8e', marginTop: '2px' }}>
                    {new Date(w.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}{w.exercises} exercises
                  </div>
                </div>
                <div style={{ fontSize: '10px', color: '#0f6e56', fontWeight: '500' }}>+100 XP</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ALERTS TAB */}
      {tab === 'alerts' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>Things to know</div>
            <div style={{
              background: '#fcebeb', color: '#a32d2d',
              borderRadius: '99px', padding: '3px 10px', fontSize: '9px', fontWeight: '500'
            }}>AI powered</div>
          </div>

          {workouts.length === 0 ? (
            <div style={{
              ...card, textAlign: 'center',
              padding: '30px 14px', color: '#b07a8e', fontSize: '12px'
            }}>
              Log a few workouts first and the AI will start analysing your progress here.
            </div>
          ) : (
            <>
              <div style={{
                ...card,
                borderLeft: '3px solid #e24b4a',
                borderRadius: '0 16px 16px 0'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#a32d2d', marginBottom: '6px' }}>
                  Cable kickback has stalled
                </div>
                <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6', marginBottom: '8px' }}>
                  You have lifted the same weight for 3 consecutive sessions. At your level this should be progressing every 1–2 weeks.
                </div>
                <div style={{ fontSize: '10px', fontWeight: '500', color: '#993556', marginBottom: '4px' }}>What to do</div>
                <div style={{ fontSize: '10px', color: '#4a2030', lineHeight: '1.5' }}>
                  Try dropping to 80% of your current weight for one session, then attempt a new max. Check your sleep and hydration this week.
                </div>
              </div>

              <div style={{
                ...card,
                borderLeft: '3px solid #ef9f27',
                borderRadius: '0 16px 16px 0'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#854f0b', marginBottom: '6px' }}>
                  Keep up the consistency
                </div>
                <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>
                  You are hitting 3 sessions per week consistently. This is exactly the frequency needed for glute hypertrophy. Keep it up.
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}