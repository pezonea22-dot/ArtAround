import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const levels = [
  { value: 'infantile', emoji: '⭐', label: 'Bambino', desc: 'Racconti semplici e curiosità' },
  { value: 'semplice',  emoji: '⭐⭐', label: 'Curioso',  desc: 'Prima visita al museo' },
  { value: 'medio',     emoji: '⭐⭐⭐', label: 'Appassionato', desc: 'Conosco un po\' l\'arte' },
  { value: 'avanzato',  emoji: '⭐⭐⭐⭐', label: 'Esperto',  desc: 'Storico o critico d\'arte' },
]

const times = [
  { value: '30', label: '30\'', sublabel: 'Essenziale' },
  { value: '60', label: '1h',   sublabel: 'Classica' },
  { value: '90', label: '1h30', sublabel: 'Approfondita' },
  { value: '120', label: '2h',  sublabel: 'Completa' },
]

export default function OnboardingPage() {
  const [level, setLevel] = useState('')
  const [time, setTime]   = useState('')
  const { saveProfile } = useUser()
  const navigate = useNavigate()

  const ready = level && time

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0E0C0A',
      display: 'flex', flexDirection: 'column',
      padding: '0 24px 32px',
    }}>

      {/* Hero */}
      <div style={{ paddingTop: 64, paddingBottom: 40, borderBottom: '1px solid rgba(200,169,110,0.2)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 12, letterSpacing: '0.18em', color: '#C8A96E', textTransform: 'uppercase', marginBottom: 16 }}>
          Modena · Galleria Estense
        </p>
        <h1 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 52, fontWeight: 400, lineHeight: 1.05, color: '#F2E8D9' }}>
          Art<br /><em style={{ fontStyle: 'italic', color: '#C8A96E' }}>Around</em>
        </h1>
        <p style={{ marginTop: 14, fontSize: 14, color: '#7A6E62', lineHeight: 1.6, maxWidth: 320, margin: '14px auto 0' }}>
          La guida che parla il tuo linguaggio, davanti a ogni opera.
        </p>
      </div>

      {/* Livello */}
      <div style={{ paddingTop: 32 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', color: '#7A6E62', textTransform: 'uppercase', marginBottom: 14 }}>
          Livello
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {levels.map(l => {
            const active = level === l.value
            return (
              <button key={l.value} onClick={() => setLevel(l.value)} style={{
                padding: '16px 14px',
                borderRadius: 4,
                border: `1px solid ${active ? '#C8A96E' : 'rgba(200,169,110,0.15)'}`,
                background: active ? 'rgba(200,169,110,0.08)' : 'rgba(255,255,255,0.02)',
                color: active ? '#F2E8D9' : '#7A6E62',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all .15s',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{l.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{l.label}</div>
                <div style={{ fontSize: 11, color: active ? '#C8A96E' : '#7A6E62', lineHeight: 1.4 }}>{l.desc}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tempo */}
      <div style={{ paddingTop: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.12em', color: '#7A6E62', textTransform: 'uppercase', marginBottom: 14 }}>
          Tempo a disposizione
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {times.map(t => {
            const active = time === t.value
            return (
              <button key={t.value} onClick={() => setTime(t.value)} style={{
                padding: '14px 8px',
                borderRadius: 4,
                border: `1px solid ${active ? '#C8A96E' : 'rgba(200,169,110,0.15)'}`,
                background: active ? 'rgba(200,169,110,0.08)' : 'rgba(255,255,255,0.02)',
                color: active ? '#F2E8D9' : '#7A6E62',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .15s',
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 3 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: active ? '#C8A96E' : '#7A6E62' }}>{t.sublabel}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto', paddingTop: 36 }}>
        <button onClick={() => { if (ready) { saveProfile({ level, time: parseInt(time) }); navigate('/visits') } }}
          style={{
            width: '100%', padding: '18px',
            borderRadius: 4,
            border: ready ? '1px solid #C8A96E' : '1px solid rgba(200,169,110,0.15)',
            background: ready ? '#C8A96E' : 'transparent',
            color: ready ? '#0E0C0A' : '#4A4238',
            fontSize: 15, fontWeight: 600, cursor: ready ? 'pointer' : 'not-allowed',
            letterSpacing: '0.04em',
            transition: 'all .2s',
          }}>
          Inizia la visita →
        </button>
        {!ready && (
          <p style={{ textAlign: 'center', fontSize: 12, color: '#7A6E62', marginTop: 10 }}>
            Scegli livello e tempo per continuare
          </p>
        )}
      </div>
    </div>
  )
}