import { useState } from 'react'

const API_KEY = import.meta.env.VITE_CLAUDE_API_KEY

export default function ExerciseScreen() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const recent = JSON.parse(localStorage.getItem('checkedExercises') || '[]')

  const checkExercise = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)

    const prompt = `You are an expert glute hypertrophy coach. Evaluate this exercise for glute development: "${query}"

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 1-10>,
  "rating": "<Poor|Moderate|Good|Excellent>",
  "verdict": "<2-3 sentences, honest and direct, no fluff>",
  "glutes": <0-100>,
  "quads": <0-100>,
  "hamstrings": <0-100>,
  "alternatives": [
    { "name": "<exercise name>", "activation": <0-100>, "note": "<why it's better>" },
    { "name": "<exercise name>", "activation": <0-100>, "note": "<why it's better>" }
  ],
  "howToUse": "<if moderate/good: how to use it correctly. if poor: leave empty string>"
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
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content[0].text
      const json = JSON.parse(text)

      const saved = JSON.parse(localStorage.getItem('checkedExercises') || '[]')
      const updated = [{ name: query, rating: json.rating }, ...saved.filter(e => e.name !== query)].slice(0, 10)
      localStorage.setItem('checkedExercises', JSON.stringify(updated))

      setResult(json)
    } catch (e) {
      alert('Something went wrong. Check your API key in .env')
    }
    setLoading(false)
  }

  const ratingColor = {
    Poor: { bg: '#fcebeb', color: '#a32d2d', border: '#e24b4a' },
    Moderate: { bg: '#faeeda', color: '#854f0b', border: '#ef9f27' },
    Good: { bg: '#e1f5ee', color: '#0f6e56', border: '#1d9e75' },
    Excellent: { bg: '#e1f5ee', color: '#0f6e56', border: '#1d9e75' },
  }

  const card = {
    background: '#fff', borderRadius: '16px',
    padding: '14px', marginBottom: '12px',
    border: '0.5px solid #f0dde5',
  }

  const scoreColor = result ? (
    result.score <= 3 ? '#e24b4a' :
    result.score <= 6 ? '#ef9f27' : '#1d9e75'
  ) : '#993556'

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ fontSize: '20px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>Exercise check</div>
      <div style={{ fontSize: '11px', color: '#b07a8e', marginBottom: '20px' }}>Find out if it actually builds your glutes</div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkExercise()}
          placeholder="e.g. leg extension, curtsy lunge..."
          style={{
            flex: 1, background: '#fff', border: '0.5px solid #f0dde5',
            borderRadius: '99px', padding: '10px 16px', fontSize: '12px',
            color: '#4a2030', outline: 'none', fontFamily: 'inherit'
          }}
        />
        <button onClick={checkExercise} style={{
          background: '#993556', color: '#fff', border: 'none',
          borderRadius: '99px', padding: '10px 18px',
          fontSize: '12px', fontWeight: '500', cursor: 'pointer'
        }}>
          {loading ? '...' : 'Check'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#b07a8e', fontSize: '12px' }}>
          Analysing for glute activation...
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <>
          {/* Score header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              border: `3px solid ${scoreColor}`, display: 'flex',
              flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <div style={{ fontSize: '20px', fontWeight: '500', color: scoreColor }}>{result.score}</div>
              <div style={{ fontSize: '8px', color: '#b07a8e' }}>/10</div>
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#4a2030', marginBottom: '4px' }}>{query}</div>
              <div style={{
                display: 'inline-block',
                background: ratingColor[result.rating]?.bg || '#f7d6e4',
                color: ratingColor[result.rating]?.color || '#993556',
                borderRadius: '99px', padding: '3px 12px',
                fontSize: '10px', fontWeight: '500'
              }}>{result.rating} for glutes</div>
            </div>
          </div>

          {/* Verdict */}
          <div style={{
            ...card,
            borderLeft: `3px solid ${ratingColor[result.rating]?.border || '#d4537e'}`,
            background: ratingColor[result.rating]?.bg || '#fdf0f4'
          }}>
            <div style={{ fontSize: '10px', fontWeight: '500', color: ratingColor[result.rating]?.color || '#993556', marginBottom: '6px' }}>
              The honest verdict
            </div>
            <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>{result.verdict}</div>
          </div>

          {/* Activation bars */}
          <div style={card}>
            <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Muscle activation</div>
            {[
              { label: 'Glutes', val: result.glutes },
              { label: 'Quads', val: result.quads },
              { label: 'Hamstrings', val: result.hamstrings },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: '#4a2030', width: '80px' }}>{m.label}</div>
                <div style={{ flex: 1, background: '#fbe8f0', borderRadius: '99px', height: '6px' }}>
                  <div style={{ background: '#d4537e', borderRadius: '99px', height: '6px', width: `${m.val}%` }} />
                </div>
                <div style={{ fontSize: '10px', color: '#993556', fontWeight: '500', width: '32px', textAlign: 'right' }}>{m.val}%</div>
              </div>
            ))}
          </div>

          {/* How to use */}
          {result.howToUse && (
            <div style={card}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '6px' }}>How to use it correctly</div>
              <div style={{ fontSize: '11px', color: '#4a2030', lineHeight: '1.6' }}>{result.howToUse}</div>
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>
                {result.score <= 5 ? 'Replace it with' : 'Also try'}
              </div>
              {result.alternatives.map((alt, i) => (
                <div key={i} style={{
                  background: '#fdf0f4', borderRadius: '10px', padding: '10px',
                  marginBottom: i < result.alternatives.length - 1 ? '8px' : 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#4a2030' }}>{alt.name}</div>
                    <div style={{ fontSize: '9px', color: '#0f6e56', fontWeight: '500' }}>Glutes: {alt.activation}%</div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#b07a8e' }}>{alt.note}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Recent checks */}
      {!result && !loading && recent.length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '11px', fontWeight: '500', color: '#4a2030', marginBottom: '10px' }}>Recently checked</div>
          {recent.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderBottom: i < recent.length - 1 ? '0.5px solid #fbe8f0' : 'none',
              cursor: 'pointer'
            }} onClick={() => { setQuery(ex.name); }}>
              <div style={{ fontSize: '11px', color: '#4a2030', fontWeight: '500' }}>{ex.name}</div>
              <div style={{
                background: ratingColor[ex.rating]?.bg || '#f7d6e4',
                color: ratingColor[ex.rating]?.color || '#993556',
                borderRadius: '99px', padding: '2px 8px', fontSize: '9px', fontWeight: '500'
              }}>{ex.rating}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}