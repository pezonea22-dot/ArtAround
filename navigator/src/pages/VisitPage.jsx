import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getMuseumConfig } from '../api/museum'
import api from '../api/client'

const levelOrder = ['infantile', 'semplice', 'medio', 'avanzato']
const levelLabel = { infantile: 'Bambino', semplice: 'Semplice', medio: 'Medio', avanzato: 'Avanzato' }

function pickItem(items, targetLevel) {
  if (!items?.length) return null
  const exact = items.find(i => i.level === targetLevel)
  if (exact) return exact
  const idx = levelOrder.indexOf(targetLevel)
  for (let i = idx - 1; i >= 0; i--) {
    const found = items.find(it => it.level === levelOrder[i])
    if (found) return found
  }
  return items[0]
}

function parseDuration(d) {
  return { '3s': '3 sec', '15s': '15 sec', '1min': '1 min', '4min': '4 min' }[d] || d
}

const VOICE_COMMANDS = {
  'prossimo': 'next', 'avanti': 'next',
  'precedente': 'prev', 'indietro': 'prev',
  'dimmi di più': 'more', 'più dettagli': 'more', 'troppo semplice': 'more',
  'dimmi di meno': 'less', 'meno dettagli': 'less', 'non capisco': 'less',
  'ascolta': 'speak', 'leggi': 'speak', 'stop': 'stop',
  "chi è l'autore": 'author', 'autore': 'author',
  "cos'è questo": 'whatis', 'cosa è questo': 'whatis',
  'uscita': 'place_uscita', 'toilette': 'place_toilette', 'bagno': 'place_toilette',
  'bar': 'place_bar', 'shop': 'place_shop', 'ostacoli': 'place_ostacoli',
}

export default function VisitPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile } = useUser()

  const [visit, setVisit]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [stepIndex, setStepIndex]   = useState(0)
  const [currentLevel, setLevel]    = useState(profile?.level || 'medio')
  const [speaking, setSpeaking]     = useState(false)
  const [showMap, setShowMap]       = useState(false)
  const [logistic, setLogistic]     = useState(null)
  const [infoMsg, setInfoMsg]       = useState(null)
  const [allItems, setAllItems]     = useState({})
  const [museumPlaces, setPlaces]   = useState({})
  const [voiceOn, setVoiceOn]       = useState(false)
  const [voiceHint, setVoiceHint]   = useState('')
  const synthRef = useRef(window.speechSynthesis)
  const recRef   = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get(`/api/visits/${id}`),
      getMuseumConfig()
    ]).then(async ([r, config]) => {
      setVisit(r.data)
      setPlaces(config.places || {})
      const intro = r.data.logistics?.find(l => l.afterStepIndex === -1)
      if (intro) setLogistic(intro.text)
      const map = {}
      await Promise.all(r.data.steps.map(async s => {
        const res = await api.get(`/api/items?objectId=${s.objectId._id}`)
        map[s.objectId._id] = res.data
      }))
      setAllItems(map)
    }).finally(() => setLoading(false))
    return () => { synthRef.current.cancel(); recRef.current?.stop() }
  }, [id])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'it-IT'; r.continuous = false; r.interimResults = false
    r.onresult = e => {
      const t = e.results[0][0].transcript.toLowerCase()
      setVoiceHint(`"${t}"`)
      for (const [phrase, cmd] of Object.entries(VOICE_COMMANDS)) {
        if (t.includes(phrase)) { handleCmd(cmd); break }
      }
      setTimeout(() => setVoiceHint(''), 2500)
    }
    r.onerror = () => { setVoiceOn(false); setVoiceHint('Microfono non disponibile') ; setTimeout(() => setVoiceHint(''), 2000) }
    r.onend   = () => setVoiceOn(false)
    recRef.current = r
  }, [visit, stepIndex, currentLevel, speaking])

  if (loading) return (
    <div style={{ minHeight: '100dvh', background: '#0a0e0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 28, color: '#C8A96E', fontStyle: 'italic', marginBottom: 8 }}>Galleria Estense</p>
        <p style={{ fontSize: 13, color: '#4A4238' }}>Caricamento visita...</p>
      </div>
    </div>
  )

  if (!visit) return (
    <div style={{ minHeight: '100dvh', background: '#0E0C0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#4A4238' }}>Visita non trovata.</p>
    </div>
  )

  const step     = visit.steps[stepIndex]
  const object   = step?.objectId
  const oid      = object?._id
  const items    = allItems[oid] || step?.items || []
  const curItem  = pickItem(items, currentLevel)
  const isFirst  = stepIndex === 0
  const isLast   = stepIndex === visit.steps.length - 1

  const getLogAfter = idx => visit.logistics?.find(l => l.afterStepIndex === idx)

  const speak = text => {
    synthRef.current.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'it-IT'; u.rate = 0.92
    u.onstart = () => setSpeaking(true)
    u.onend = u.onerror = () => setSpeaking(false)
    synthRef.current.speak(u)
  }
  const stopSpeak = () => { synthRef.current.cancel(); setSpeaking(false) }

  const showInfo = text => { stopSpeak(); setInfoMsg(text); speak(text) }

  const handleCmd = cmd => {
    if (!cmd) return
    const actions = {
      next:   goNext,
      prev:   goPrev,
      more:   goMore,
      less:   goLess,
      speak:  () => curItem && speak(curItem.text),
      stop:   stopSpeak,
      author: () => showInfo(object ? `Autore: ${object.artist}, ${object.year}.` : 'Non disponibile.'),
      whatis: () => showInfo(object ? `"${object.title}" di ${object.artist}, ${object.year}. ${object.room}.` : 'Non disponibile.'),
    }
    if (actions[cmd]) { actions[cmd](); return }
    if (cmd.startsWith('place_')) showInfo(museumPlaces[cmd.replace('place_', '')] || 'Informazione non disponibile.')
  }

  const goNext = () => {
    stopSpeak(); setInfoMsg(null)
    const log = getLogAfter(stepIndex)
    if (log) setLogistic(log.text)
    if (!isLast) setStepIndex(i => i + 1)
  }
  const goPrev = () => { stopSpeak(); setInfoMsg(null); setLogistic(null); if (!isFirst) setStepIndex(i => i - 1) }
  const goMore = () => { const i = levelOrder.indexOf(currentLevel); if (i < 3) setLevel(levelOrder[i + 1]); setInfoMsg(null) }
  const goLess = () => { const i = levelOrder.indexOf(currentLevel); if (i > 0) setLevel(levelOrder[i - 1]); setInfoMsg(null) }

  const toggleVoice = () => {
    if (!recRef.current) return
    if (voiceOn) { recRef.current.stop(); setVoiceOn(false) }
    else { recRef.current.start(); setVoiceOn(true); setVoiceHint('In ascolto...') }
  }

  // ── LOGISTICA ──
  if (logistic) return (
    <div style={{ minHeight: '100dvh', background: '#0a0e0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div style={{ maxWidth: 380, width: '100%' }}>
        <div style={{ width: 40, height: 1, background: '#C8A96E', marginBottom: 28 }} />
        <p style={{ fontSize: 11, letterSpacing: '0.14em', color: '#C8A96E', textTransform: 'uppercase', marginBottom: 16 }}>Indicazioni</p>
        <p style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 22, color: '#F2E8D9', lineHeight: 1.5, marginBottom: 32 }}>{logistic}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => speak(logistic)} style={{ flex: 1, padding: '13px', border: '1px solid rgba(200,169,110,0.3)', borderRadius: 3, background: 'transparent', color: '#C8A96E', cursor: 'pointer', fontSize: 13 }}>▶ Ascolta</button>
          <button onClick={() => setLogistic(null)} style={{ flex: 2, padding: '13px', border: '1px solid #C8A96E', borderRadius: 3, background: '#C8A96E', color: '#0E0C0A', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Avanti →</button>
        </div>
      </div>
    </div>
  )

  // ── MAPPA ──
  if (showMap) return (
    <div style={{ minHeight: '100dvh', background: '#0E0C0A', display: 'flex', flexDirection: 'column', padding: 24 }}>
      <button onClick={() => setShowMap(false)} style={{ background: 'none', border: 'none', color: '#7A6E62', cursor: 'pointer', fontSize: 13, textAlign: 'left', marginBottom: 24 }}>← Torna</button>
      <p style={{ fontSize: 11, letterSpacing: '0.12em', color: '#C8A96E', textTransform: 'uppercase', marginBottom: 16 }}>Mappa percorso</p>

      <div style={{ background: 'rgba(200,169,110,0.04)', border: '1px solid rgba(200,169,110,0.12)', borderRadius: 4, padding: 16, marginBottom: 20 }}>
        <svg viewBox="0 0 320 480" style={{ width: '100%' }}>
          {visit.steps.map((s, i) => {
            const o = s.objectId
            if (!o?.position) return null
            const x = (o.position.x / 320) * 290 + 15
            const y = (o.position.y / 480) * 450 + 15
            const cur = i === stepIndex
            return (
              <g key={i} onClick={() => { setStepIndex(i); setShowMap(false) }} style={{ cursor: 'pointer' }}>
                {i > 0 && (() => {
                  const prev = visit.steps[i - 1].objectId
                  if (!prev?.position) return null
                  const px = (prev.position.x / 320) * 290 + 15
                  const py = (prev.position.y / 480) * 450 + 15
                  return <line x1={px} y1={py} x2={x} y2={y} stroke="rgba(200,169,110,0.2)" strokeWidth={1} strokeDasharray="4 3" />
                })()}
                <circle cx={x} cy={y} r={cur ? 13 : 9} fill={cur ? '#C8A96E' : '#2A2318'} stroke={cur ? '#F2E8D9' : 'rgba(200,169,110,0.3)'} strokeWidth={cur ? 2 : 1} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize={cur ? 9 : 7} fill={cur ? '#0E0C0A' : '#7A6E62'} fontWeight="700">{i + 1}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        {visit.steps.map((s, i) => {
          const cur = i === stepIndex
          return (
            <button key={i} onClick={() => { setStepIndex(i); setShowMap(false) }} style={{
              padding: '12px 14px', borderRadius: 3,
              border: `1px solid ${cur ? 'rgba(200,169,110,0.4)' : 'rgba(200,169,110,0.08)'}`,
              background: cur ? 'rgba(200,169,110,0.06)' : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left'
            }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: cur ? '#C8A96E' : '#2A2318', color: cur ? '#0E0C0A' : '#7A6E62', flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 13, color: '#F2E8D9', fontWeight: 500 }}>{s.objectId?.title}</div>
                <div style={{ fontSize: 11, color: '#4A4238', marginTop: 1 }}>{s.objectId?.artist} · {s.objectId?.room}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── MAIN ──
  return (
    <div style={{ minHeight: '100dvh', background: '#0E0C0A', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(200,169,110,0.1)' }}>
        <button onClick={() => navigate('/visits')} style={{ background: 'none', border: 'none', color: '#7A6E62', cursor: 'pointer', fontSize: 13 }}>← Esci</button>
        <span style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 13, color: '#4A4238', fontStyle: 'italic' }}>
          {stepIndex + 1} di {visit.steps.length}
        </span>
        <button onClick={() => setShowMap(true)} style={{ background: 'none', border: 'none', color: '#7A6E62', cursor: 'pointer', fontSize: 18 }}>⊞</button>
      </div>

      {/* Progress */}
      <div style={{ height: 2, background: '#1A1612' }}>
        <div style={{ height: '100%', background: '#C8A96E', width: `${((stepIndex + 1) / visit.steps.length) * 100}%`, transition: 'width .4s ease' }} />
      </div>

      {/* Voice hint */}
      {voiceHint && (
        <div style={{ padding: '7px 20px', background: 'rgba(200,169,110,0.08)', borderBottom: '1px solid rgba(200,169,110,0.1)', fontSize: 12, color: '#C8A96E', textAlign: 'center' }}>
          🎤 {voiceHint}
        </div>
      )}

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 0' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>

          {/* Museum label — opera */}
          <div style={{ borderLeft: '2px solid #C8A96E', paddingLeft: 16, marginBottom: 24 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.14em', color: '#C8A96E', textTransform: 'uppercase', marginBottom: 6 }}>{object?.room}</p>
            <h2 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 28, fontWeight: 400, color: '#F2E8D9', lineHeight: 1.1, marginBottom: 6 }}>{object?.title}</h2>
            <p style={{ fontSize: 13, color: '#7A6E62' }}>{object?.artist} · {object?.year}</p>
          </div>

          {/* Info message */}
          {infoMsg && (
            <div style={{ background: 'rgba(200,169,110,0.06)', border: '1px solid rgba(200,169,110,0.2)', borderRadius: 3, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <p style={{ fontSize: 14, color: '#F2E8D9', lineHeight: 1.6, flex: 1, margin: 0 }}>{infoMsg}</p>
              <button onClick={() => setInfoMsg(null)} style={{ background: 'none', border: 'none', color: '#4A4238', cursor: 'pointer', fontSize: 16, flexShrink: 0, paddingTop: 1 }}>✕</button>
            </div>
          )}

          {/* Selettore livello */}
          <div style={{ display: 'flex', gap: 1, marginBottom: 16, background: '#1A1612', borderRadius: 3, padding: 3 }}>
            {levelOrder.map(l => (
              <button key={l} onClick={() => { setLevel(l); setInfoMsg(null) }} style={{
                flex: 1, padding: '7px 4px', borderRadius: 2, border: 'none',
                background: currentLevel === l ? '#C8A96E' : 'transparent',
                color: currentLevel === l ? '#0E0C0A' : '#4A4238',
                fontSize: 11, cursor: 'pointer', fontWeight: 600,
                transition: 'all .15s'
              }}>{levelLabel[l]}</button>
            ))}
          </div>

          {/* Testo */}
          {curItem ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: '#4A4238' }}>
                  {parseDuration(curItem.duration)}
                </span>
                <button onClick={speaking ? stopSpeak : () => speak(curItem.text)} style={{
                  padding: '6px 14px', borderRadius: 2,
                  border: `1px solid ${speaking ? '#C8A96E' : 'rgba(200,169,110,0.25)'}`,
                  background: speaking ? 'rgba(200,169,110,0.12)' : 'transparent',
                  color: speaking ? '#C8A96E' : '#7A6E62',
                  cursor: 'pointer', fontSize: 12, fontWeight: 500
                }}>
                  {speaking ? '⏹ Stop' : '▶ Ascolta'}
                </button>
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#D4C9B8', fontFamily: curItem.level === 'avanzato' ? 'Cormorant Garant, serif' : 'Inter, sans-serif', fontSize: curItem.level === 'avanzato' ? 17 : 15 }}>
                {curItem.text}
              </p>
            </div>
          ) : (
            <p style={{ color: '#7A6E62', fontSize: 13, marginBottom: 20 }}>Nessun testo per questo livello.</p>
          )}

          {/* Azioni */}
          <div style={{ borderTop: '1px solid rgba(200,169,110,0.08)', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.1em', color: '#4A4238', textTransform: 'uppercase', marginBottom: 10 }}>Azioni</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                ['Più semplice', 'less'],
                ['Più approfondito', 'more'],
                ["Chi è l'autore", 'author'],
                ["Cos'è questo", 'whatis'],
                ['Non capisco', 'less'],
                ['Troppo semplice', 'more'],
              ].map(([label, cmd]) => (
                <button key={label} onClick={() => handleCmd(cmd)} style={{
                  padding: '10px 6px', borderRadius: 3,
                  border: '1px solid rgba(200,169,110,0.1)',
                  background: 'rgba(255,255,255,0.01)',
                  color: '#7A6E62', cursor: 'pointer', fontSize: 11,
                  lineHeight: 1.3, transition: 'all .15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.3)'; e.currentTarget.style.color = '#C8A96E' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.1)'; e.currentTarget.style.color = '#7A6E62' }}
                >{label}</button>
              ))}
            </div>
          </div>

          {/* Luoghi */}
          <div style={{ borderTop: '1px solid rgba(200,169,110,0.08)', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: '0.1em', color: '#4A4238', textTransform: 'uppercase', marginBottom: 10 }}>Dove si trova</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[['🚪 Uscita','place_uscita'],['🚻 Bagni','place_toilette'],['☕ Bar','place_bar'],['🛍 Shop','place_shop'],['♿ Accesso','place_ostacoli']].map(([label, cmd]) => (
                <button key={cmd} onClick={() => handleCmd(cmd)} style={{
                  padding: '7px 13px', borderRadius: 2,
                  border: '1px solid rgba(200,169,110,0.1)',
                  background: 'transparent', color: '#7A6E62',
                  cursor: 'pointer', fontSize: 12
                }}>{label}</button>
              ))}
            </div>
          </div>

          {/* Microfono */}
          <div style={{ paddingBottom: 24 }}>
            <button onClick={toggleVoice} style={{
              width: '100%', padding: '11px',
              borderRadius: 3,
              border: `1px solid ${voiceOn ? '#C8A96E' : 'rgba(200,169,110,0.12)'}`,
              background: voiceOn ? 'rgba(200,169,110,0.08)' : 'transparent',
              color: voiceOn ? '#C8A96E' : '#4A4238',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>
              {voiceOn ? '🎤 In ascolto — tocca per fermare' : '🎤 Comandi vocali'}
            </button>
          </div>
        </div>
      </div>

      {/* Nav bottom */}
      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(200,169,110,0.1)', display: 'flex', gap: 10 }}>
        <button onClick={goPrev} disabled={isFirst} style={{
          flex: 1, padding: '14px',
          borderRadius: 3,
          border: '1px solid rgba(200,169,110,0.15)',
          background: 'transparent',
          color: isFirst ? '#2A2318' : '#7A6E62',
          cursor: isFirst ? 'not-allowed' : 'pointer',
          fontSize: 14, fontWeight: 500
        }}>← Precedente</button>

        <button onClick={isLast ? () => navigate('/visits') : goNext} style={{
          flex: 2, padding: '14px',
          borderRadius: 3, border: 'none',
          background: '#C8A96E',
          color: '#0E0C0A',
          cursor: 'pointer', fontSize: 14, fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          {isLast ? '✓ Fine visita' : 'Opera successiva →'}
        </button>
      </div>
    </div>
  )
}