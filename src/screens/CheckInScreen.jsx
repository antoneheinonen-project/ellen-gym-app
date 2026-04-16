import { useState } from 'react'

export default function CheckInScreen() {
  const [food, setFood] = useState('')
  const [sleep, setSleep] = useState(7)
  const [water, setWater] = useState(6)
  const [stress, setStress] = useState(null)
  const [alcohol, setAlcohol] = useState(null)
  const [saved, setSaved] = useState(false)

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const handleSave = () => {
    if (!stress || alcohol === null) {
      alert('Please fill in all fields!')
      return
    }
    const checkIn = { food, sleep, water, stress, alcohol, date: new Date().toISOString() }
    localStorage.setItem('lastCheckIn', JSON.stringify(checkIn))
    const history = JSON.parse(localStorage.getItem('checkInHistory') || '[]')
    history.push(checkIn)
    localStorage.setItem('checkInHistory', JSON.stringify(history))
    setSaved(true)
  }

  const stressColors = {
    1: { bg: '#e1f5ee', color: '#0f6e56' },
    2: { bg: '#e1f5ee', color: '#0f6e56' },
    3: { bg: '#faeeda', color: '#854f0b' },
    4: { bg: '#f7d6e4', color: '#993556' },
    5: { bg: '#fcebeb', color: '#a32d2d' },
  }

  if (saved) return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: '2px solid #d4537e', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px', fontSize: '24px', color: '#993556'
        }}>✓</div>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#4a2030' }}>All logged!</div>
        <div style={{ fontSize: '11px', color: '#b07a8e', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div style={card}>
        <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Today's summary</div>
        {[
          { label: 'Sleep', value: `${sleep} hrs` },
          { label: 'Water', value: `${water} glasses` },
          { label: 'Stress', value: `${stress} / 5` },
          { label: 'Alcohol', value: alcohol ? 'Yes' : 'No', color: alcohol ? '#a32d2d' : '#4a2030' },
          { label: 'Food', value: food || '—' },
        ].map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '7px 0', borderBottom: i < 4 ? '0.5px solid #fbe8f0' : 'none',
            fontSize: '11px'
          }}>
            <div style={{ color: '#b07a8e' }}>{row.label}</div>
            <div style={{ color: row.color || '#4a2030', fontWeight: '500', maxWidth: '200px', textAlign: 'right' }}>{row.value}</div>
          </div>
        ))}
      </div>

      {(sleep < 7 || water < 6 || stress >= 4 || alcohol) && (
        <div style={{ ...card, borderLeft: '3px solid #ef9f27', background: '#faeeda' }}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#854f0b', marginBottom: '4px' }}>Recovery note</div>
          <div style={{ fontSize: '10px', color: '#633806', lineHeight: '1.5' }}>
            {sleep < 7 && 'Sleep is below 7 hrs. '}
            {water < 6 && 'Hydration is low. '}
            {stress >= 4 && 'Stress is elevated. '}
            {alcohol && 'Alcohol affects recovery. '}
            If you train today, expect performance to be slightly below normal.
          </div>
        </div>
      )}

      <button
        onClick={() => setSaved(false)}
        style={{
          width: '100%', background: '#f7d6e4', color: '#993556',
          border: 'none', borderRadius: '99px', padding: '14px',
          fontSize: '13px', fontWeight: '500', cursor: 'pointer'
        }}>
        Edit check-in
      </button>
    </div>
  )

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>Daily check-in</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '20px' }}>
        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>

      {/* Food */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '8px' }}>
          WHAT DID YOU EAT TODAY?
        </div>
        <textarea
          value={food}
          onChange={e => setFood(e.target.value)}
          placeholder="e.g. oats for breakfast, chicken and rice for lunch..."
          style={{
            width: '100%', background: '#fdf0f4', border: '0.5px solid #f0dde5',
            borderRadius: '10px', padding: '10px', fontSize: '11px',
            color: '#4a2030', resize: 'none', minHeight: '70px',
            fontFamily: 'inherit', outline: 'none'
          }}
        />
      </div>

      {/* Sleep */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '10px' }}>
          HOURS OF SLEEP
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setSleep(Math.max(0, sleep - 0.5))} style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '18px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#4a2030' }}>{sleep}</div>
            <div style={{ fontSize: '10px', color: '#b07a8e' }}>hours</div>
          </div>
          <button onClick={() => setSleep(Math.min(24, sleep + 0.5))} style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '18px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>+</button>
        </div>
      </div>

      {/* Water */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '10px' }}>
          GLASSES OF WATER
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setWater(Math.max(0, water - 1))} style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '18px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>−</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: '500', color: '#4a2030' }}>{water}</div>
            <div style={{ fontSize: '10px', color: '#b07a8e' }}>glasses</div>
          </div>
          <button onClick={() => setWater(Math.min(20, water + 1))} style={{
            width: '36px', height: '36px', borderRadius: '50%', background: '#f7d6e4',
            border: 'none', fontSize: '18px', color: '#993556', cursor: 'pointer', fontWeight: '500'
          }}>+</button>
        </div>
      </div>

      {/* Stress */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '10px' }}>
          STRESS LEVEL
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setStress(n)} style={{
              flex: 1, aspectRatio: '1', borderRadius: '50%', border: 'none',
              background: stress === n ? stressColors[n].bg : '#fdf0f4',
              color: stress === n ? stressColors[n].color : '#b07a8e',
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              outline: stress === n ? `2px solid ${stressColors[n].color}` : 'none'
            }}>{n}</button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>Calm</div>
          <div style={{ fontSize: '9px', color: '#b07a8e' }}>Very stressed</div>
        </div>
      </div>

      {/* Alcohol */}
      <div style={card}>
        <div style={{ fontSize: '9px', fontWeight: '500', color: '#b07a8e', letterSpacing: '.5px', marginBottom: '10px' }}>
          ALCOHOL TODAY?
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[false, true].map((val) => (
            <button key={String(val)} onClick={() => setAlcohol(val)} style={{
              flex: 1, padding: '10px', borderRadius: '99px', border: 'none',
              fontSize: '12px', fontWeight: '500', cursor: 'pointer',
              background: alcohol === val ? (val ? '#fcebeb' : '#e1f5ee') : '#fdf0f4',
              color: alcohol === val ? (val ? '#a32d2d' : '#0f6e56') : '#b07a8e',
              outline: alcohol === val ? `1.5px solid ${val ? '#f09595' : '#5dcaa5'}` : 'none'
            }}>{val ? 'Yes' : 'No'}</button>
          ))}
        </div>
      </div>

      <button onClick={handleSave} style={{
        width: '100%', background: '#993556', color: '#fff',
        border: 'none', borderRadius: '99px', padding: '14px',
        fontSize: '13px', fontWeight: '500', cursor: 'pointer', marginBottom: '8px'
      }}>
        Save check-in
      </button>
    </div>
  )
}