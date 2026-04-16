import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProgressScreen() {
  const [tab, setTab] = useState('strength')
  const [selectedExercise, setSelectedExercise] = useState('Hip thrust')
  const [calendarDate, setCalendarDate] = useState(new Date())

  const workoutLogs = JSON.parse(localStorage.getItem('workoutLogs') || '{}')
  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]')
  const streak = parseInt(localStorage.getItem('streak') || '0')
  const checkInHistory = JSON.parse(localStorage.getItem('checkInHistory') || '[]')

  const exercises = [
    'Hip thrust', 'Romanian deadlift', 'Cable kickback',
    'Leg curl', 'Bulgarian split squat', 'Sumo deadlift'
  ]

  const getChartData = (exName) => {
    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '{}')
    const logs = history[exName] || []
    if (logs.length === 0) return []
    return logs.map((l, i) => ({ week: `S${i + 1}`, weight: l.weight }))
  }

  const chartData = getChartData(selectedExercise)
  const firstWeight = chartData[0]?.weight || 0
  const lastWeight = chartData[chartData.length - 1]?.weight || 0
  const gain = Math.round((lastWeight - firstWeight) * 10) / 10

  const getCalendarDays = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startOffset = firstDay === 0 ? 6 : firstDay - 1
    return { daysInMonth, startOffset }
  }

  const getTrainedDaysForMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return workouts
      .filter(w => {
        const d = new Date(w.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .map(w => new Date(w.date).getDate())
  }

  const prevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1)
    if (next <= new Date()) setCalendarDate(next)
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return calendarDate.getFullYear() === now.getFullYear() &&
      calendarDate.getMonth() === now.getMonth()
  }

  const { daysInMonth, startOffset } = getCalendarDays(calendarDate)
  const trainedDays = getTrainedDaysForMonth(calendarDate)
  const todayDate = new Date().getDate()

  const monthName = calendarDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

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
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {exercises.map(ex => (
              <button key={ex} onClick={() => setSelectedExercise(ex)} style={{
                padding: '5px 12px', borderRadius: '99px', cursor: 'pointer',
                background: selectedExercise === ex ? '#993556' : '#fff',
                color: selectedExercise === ex ? '#fff' : '#b07a8e',
                fontSize: '10px', fontWeight: '500',
                border: `0.5px solid ${selectedExercise === ex ? '#993556' : '#f0dde5'}`
              }}>{ex}</button>
            ))}
          </div>

          <div style={card}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '12px' }}>{selectedExercise}</div>
            {chartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#b07a8e', fontSize: '11px' }}>
                No data yet — log a workout to see your progress here
              </div>
            ) : (
              <>
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
                  <div style={{ color: gain >= 0 ? '#0f6e56' : '#e24b4a', fontWeight: '500' }}>
                    {gain >= 0 ? '+' : ''}{gain} kg total
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>All exercises</div>
            {exercises.map((ex, i) => {
              const history = JSON.parse(localStorage.getItem('exerciseHistory') || '{}')
              const logs = history[ex] || []
              const latest = logs[logs.length - 1]
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: i < exercises.length - 1 ? '0.5px solid #fbe8f0' : 'none',
                  cursor: 'pointer'
                }} onClick={() => setSelectedExercise(ex)}>
                  <div style={{ fontSize: '11px', color: '#4a2030', fontWeight: '500' }}>{ex}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {latest ? (
                      <>
                        <div style={{ fontSize: '10px', color: '#0f6e56' }}>{latest.weight} kg</div>
                        <div style={{
                          background: '#f7d6e4', color: '#993556',
                          borderRadius: '99px', padding: '2px 7px',
                          fontSize: '9px', fontWeight: '500'
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
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              { num: workouts.length, label: 'Total workouts' },
              { num: streak, label: 'Day streak' },
              { num: checkInHistory.length, label: 'Check-ins' },
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
            {/* Month navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <button onClick={prevMonth} style={{
                background: '#f7d6e4', border: 'none', borderRadius: '99px',
                width: '28px', height: '28px', cursor: 'pointer',
                color: '#993556', fontSize: '14px', fontWeight: '500'
              }}>‹</button>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>{monthName}</div>
              <button onClick={nextMonth} style={{
                background: isCurrentMonth() ? '#fdf0f4' : '#f7d6e4',
                border: 'none', borderRadius: '99px',
                width: '28px', height: '28px', cursor: isCurrentMonth() ? 'default' : 'pointer',
                color: isCurrentMonth() ? '#d4b0be' : '#993556', fontSize: '14px', fontWeight: '500'
              }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', marginBottom: '4px' }}>
              {['M','T','W','T','F','S','S'].map((d, i) => (
                <div key={i} style={{ fontSize: '8px', color: '#b07a8e', textAlign: 'center', paddingBottom: '2px' }}>{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
              {/* Empty cells for offset */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const trained = trainedDays.includes(day)
                const isToday = isCurrentMonth() && day === todayDate
                const isFuture = isCurrentMonth() && day > todayDate
                return (
                  <div key={day} style={{
                    aspectRatio: '1', borderRadius: '6px',
                    background: isToday ? '#993556' : trained ? '#d4537e' : isFuture ? 'transparent' : '#fbe8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px',
                    color: isToday || trained ? '#fff' : isFuture ? '#d4b0be' : '#c490a8',
                    fontWeight: isToday ? '500' : '400',
                    border: isFuture ? '0.5px solid #f0dde5' : 'none'
                  }}>{day}</div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              {[
                { color: '#d4537e', label: 'Trained' },
                { color: '#fbe8f0', label: 'Rest' },
                { color: '#993556', label: 'Today' },
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
              <div style={{ fontSize: '11px', color: '#b07a8e', textAlign: 'center', padding: '16px 0' }}>
                No workouts logged yet — start one from the Plan tab!
              </div>
            ) : (
              workouts.slice().reverse().slice(0, 10).map((w, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: i < Math.min(workouts.length, 10) - 1 ? '0.5px solid #fbe8f0' : 'none'
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
              ))
            )}
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
              padding: '30px 14px', color: '#b07a8e', fontSize: '11px'
            }}>
              Log a few workouts first and the AI will start analysing your progress here.
            </div>
          ) : (
            <>
              {(() => {
                const history = JSON.parse(localStorage.getItem('exerciseHistory') || '{}')
                const stalledExercises = exercises.filter(ex => {
                  const logs = history[ex] || []
                  if (logs.length < 3) return false
                  const last3 = logs.slice(-3).map(l => l.weight)
                  return last3.every(w => w === last3[0])
                })

                return stalledExercises.length > 0 ? (
                  <div style={{
                    ...card,
                    borderLeft: '3px solid #e24b4a',
                    borderRadius: '0 16px 16px 0'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#a32d2d', marginBottom: '6px' }}>
                      {stalledExercises[0]} has stalled
                    </div>
                    <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6', marginBottom: '8px' }}>
                      Same weight for 3 sessions in a row. Time to either deload or push through with a new max next session.
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '500', color: '#993556', marginBottom: '4px' }}>What to do</div>
                    <div style={{ fontSize: '10px', color: '#4a2030', lineHeight: '1.5' }}>
                      Drop to 80% weight for one session then attempt a new max. Check your sleep and hydration this week.
                    </div>
                  </div>
                ) : (
                  <div style={{ ...card, background: '#e1f5ee', border: 'none' }}>
                    <div style={{ fontSize: '11px', fontWeight: '500', color: '#0f6e56', marginBottom: '4px' }}>
                      All exercises progressing
                    </div>
                    <div style={{ fontSize: '10px', color: '#4a2030', lineHeight: '1.5' }}>
                      No plateaus detected. Keep training consistently and progressive overload will keep working.
                    </div>
                  </div>
                )
              })()}

              <div style={{
                ...card,
                borderLeft: '3px solid #ef9f27',
                borderRadius: '0 16px 16px 0'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '500', color: '#854f0b', marginBottom: '6px' }}>
                  Consistency this month
                </div>
                <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>
                  {getTrainedDaysForMonth(new Date()).length} sessions logged in {new Date().toLocaleDateString('en-GB', { month: 'long' })}.
                  {getTrainedDaysForMonth(new Date()).length >= 8
                    ? ' Excellent consistency — keep it up.'
                    : ' Aim for at least 3 sessions per week for optimal glute development.'}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}