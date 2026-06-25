import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { getMuseumConfig } from '../api/museum'
import api from '../api/client'

const levelMeta = {
  infantile: { label: 'Bambini',     color: '#E8A838' },
  semplice:  { label: 'Curioso',     color: '#5DB87A' },
  medio:     { label: 'Appassionato', color: '#5B9BD5' },
  avanzato:  { label: 'Esperto',     color: '#B07FD4' },
}

export default function VisitsPage() {
  const [visits, setVisits]   = useState([])
  const [loading, setLoading] = useState(true)
  const { profile } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    getMuseumConfig().then(config => {
      api.get(`/api/marketplace/visits?museumId=${config.id}`)
        .then(r => {
          let filtered = r.data
          if (profile?.time) {
            filtered = filtered.filter(v => parseInt(v.estimatedDuration) <= profile.time)
          }
          if (profile?.level) {
            const order = ['infantile', 'semplice', 'medio', 'avanzato']
            const userIdx = order.indexOf(profile.level)
            filtered = filtered.filter(v => order.indexOf(v.targetLevel) <= userIdx)
          }
          setVisits(filtered)
        })
        .finally(() => setLoading(false))
    })
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: '#0E0C0A', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '24px 24px 0' }}>
        <button onClick={() => navigate('/onboarding')} style={{
          background: 'none', border: 'none', color: '#7A6E62',
          cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 28
        }}>← Indietro</button>

        <p style={{ fontSize: 11, letterSpacing: '0.12em', color: '#C8A96E', textTransform: 'uppercase', marginBottom: 8 }}>
          Galleria Estense
        </p>
        <h2 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 32, fontWeight: 400, color: '#F2E8D9', marginBottom: 6 }}>
          Scegli un percorso
        </h2>
        {profile && (
          <p style={{ fontSize: 13, color: '#7A6E62' }}>
            {levelMeta[profile.level]?.label} · max {profile.time} min
          </p>
        )}
      </div>

      {/* Lista visite */}
      <div style={{ flex: 1, padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#4A4238', paddingTop: 60, fontSize: 14 }}>
            Caricamento percorsi...
          </div>
        ) : visits.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ color: '#4A4238', fontSize: 14, marginBottom: 16 }}>
              Nessun percorso disponibile per il tuo profilo.
            </p>
            <button onClick={() => navigate('/onboarding')} style={{
              background: 'none', border: '1px solid rgba(200,169,110,0.3)',
              color: '#C8A96E', borderRadius: 4, padding: '10px 20px',
              cursor: 'pointer', fontSize: 13
            }}>Cambia profilo</button>
          </div>
        ) : visits.map((visit, i) => {
          const meta = levelMeta[visit.targetLevel] || {}
          return (
            <button key={visit._id} onClick={() => navigate(`/visit/${visit._id}`)} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(200,169,110,0.12)',
              borderRadius: 4,
              padding: '22px 20px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color .15s, background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.4)'; e.currentTarget.style.background = 'rgba(200,169,110,0.04)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
            >
              {/* Numero percorso */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 13, color: '#4A4238', fontStyle: 'italic' }}>
                  Percorso {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  fontSize: 10, padding: '3px 9px', borderRadius: 2,
                  background: meta.color + '18', color: meta.color,
                  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>
                  {meta.label}
                </span>
              </div>

              <h3 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 22, fontWeight: 400, color: '#F2E8D9', marginBottom: 8, lineHeight: 1.2 }}>
                {visit.title}
              </h3>

              <p style={{ fontSize: 13, color: '#7A6E62', lineHeight: 1.5, marginBottom: 16 }}>
                {visit.description}
              </p>

              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#4A4238' }}>
                <span>⏱ {visit.estimatedDuration}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}