export default function BottomNav({ screen, setScreen }) {
  const items = [
    { id: 'home', label: 'Home' },
    { id: 'plan', label: 'Plan' },
    { id: 'progress', label: 'Progress' },
    { id: 'checkin', label: 'Log' },
    { id: 'exercise', label: 'Check' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: '430px', background: '#fff',
      borderTop: '0.5px solid #f0dde5', display: 'flex',
      padding: '8px 0 20px', zIndex: 100
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => setScreen(item.id)} style={{
          flex: 1, background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px'
        }}>
          <div style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: screen === item.id ? '#993556' : '#f7d6e4'
          }} />
          <span style={{
            fontSize: '10px', fontWeight: screen === item.id ? '500' : '400',
            color: screen === item.id ? '#993556' : '#b07a8e'
          }}>{item.label}</span>
        </button>
      ))}
    </div>
  )
}