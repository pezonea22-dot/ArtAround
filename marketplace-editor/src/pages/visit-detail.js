if (!getUser()) location.href = '/login.html'

const id = location.hash.replace('#', '') || new URLSearchParams(location.search).get('id')
if (!id) location.href = '/index.html'

const levelMeta = {
  infantile: { label: 'Bambini',      cls: 'tag-infantile' },
  semplice:  { label: 'Curioso',      cls: 'tag-semplice'  },
  medio:     { label: 'Appassionato', cls: 'tag-medio'     },
  avanzato:  { label: 'Esperto',      cls: 'tag-avanzato'  },
}
const durationLabel  = { '3s':'3 sec','15s':'15 sec','1min':'1 min','4min':'4 min' }
const levelOrder     = ['infantile','semplice','medio','avanzato']
const durationOrder  = ['3s','15s','1min','4min']

let visit        = null
let selectedStep = 0
let msg = null
let adoptMsg = null

async function load() {
  try {
    visit = await api.get(`/api/visits/${id}`)
    render()
  } catch(e) {
    document.getElementById('app').innerHTML = `
      ${renderNav('marketplace')}
      ${msg ? `<div class="alert alert-${msg.type}" style="margin:16px 24px 0">${msg.text}</div>` : ''}
      <div class="container" style="padding-top:48px">
        <div class="alert alert-error">Errore: ${e.message}</div>
        <a href="/index.html" class="btn btn-outline" style="margin-top:16px">← Torna</a>
      </div>
    `
  }
}

function itemCard(item) {
  const user = getUser()
  const isOwn = item.author?.username === user?.username
  return `
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="tag ${levelMeta[item.level]?.cls}">${levelMeta[item.level]?.label||item.level}</span>
          <span class="tag" style="background:rgba(200,169,110,.08);color:var(--gold)">
            ${durationLabel[item.duration]||item.duration}
          </span>
          ${item.price > 0
            ? `<span class="tag" style="background:rgba(200,169,110,.12);color:var(--gold)">€${item.price}</span>`
            : `<span class="tag tag-free">Gratuito</span>`
          }
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <span style="font-size:11px;color:var(--faint)">✍️ ${item.author?.username}</span>
          ${!isOwn && user?.role === 'author' ? `
            <button onclick="adoptItem('${item._id}')" class="btn btn-outline btn-sm">Adotta</button>
          ` : ''}
        </div>
      </div>
      <p style="font-size:14px;line-height:1.7;color:var(--cream)">${item.text}</p>
    </div>
  `
} 

function render() {
  const step   = visit.steps[selectedStep]
  const object = step?.objectId
  const items  = [...(step?.items || []), ...(step?.optionalItems || [])]
  const sorted = [...items].sort((a,b) =>
    levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level) ||
    durationOrder.indexOf(a.duration) - durationOrder.indexOf(b.duration)
  )
  const logistic = visit.logistics?.find(l => l.afterStepIndex === selectedStep)

  document.getElementById('app').innerHTML = `
    ${renderNav('marketplace')}
    <div class="container" style="padding-top:32px;padding-bottom:48px">

      <a href="/index.html" style="font-size:13px;color:var(--muted);text-decoration:none;
        display:inline-block;margin-bottom:24px">← Marketplace</a>

      <div style="margin-bottom:32px">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap">
          <span class="tag ${levelMeta[visit.targetLevel]?.cls}">${levelMeta[visit.targetLevel]?.label}</span>
          <span style="font-size:12px;color:var(--faint)">⏱ ${visit.estimatedDuration}</span>
          <span style="font-size:12px;color:var(--faint)">· ${visit.steps.length} opere</span>
        </div>
        <h1 class="serif" style="font-size:36px;font-weight:400;line-height:1.1;margin-bottom:10px">
          ${visit.title}
        </h1>
        <p style="font-size:14px;color:var(--muted);line-height:1.5;max-width:600px">
          ${visit.description||''}
        </p>
        <p style="font-size:12px;color:var(--faint);margin-top:10px">
          Creata da ${visit.author?.username}
        </p>
      </div>

      <hr class="divider">

      <div style="display:grid;grid-template-columns:260px 1fr;gap:32px;align-items:start">

        <div>
          <p style="font-size:11px;letter-spacing:.1em;color:var(--gold);
            text-transform:uppercase;margin-bottom:14px">Opere del percorso</p>
          ${visit.steps.map((s,i) => {
            const cur   = i === selectedStep
            const obj   = s.objectId
            const count = (s.items?.length || 0) + (s.optionalItems?.length || 0)
            return `
              <button onclick="window._selectStep(${i})" style="
                display:flex;align-items:center;gap:12px;width:100%;
                padding:12px 14px;border-radius:3px;text-align:left;cursor:pointer;
                border:1px solid ${cur?'rgba(200,169,110,.4)':'var(--border)'};
                background:${cur?'rgba(200,169,110,.06)':'transparent'};
                transition:all .15s;margin-bottom:6px;font-family:inherit
              ">
                <span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;
                  display:flex;align-items:center;justify-content:center;
                  font-size:11px;font-weight:700;
                  background:${cur?'var(--gold)':'var(--bg3)'};
                  color:${cur?'var(--bg)':'var(--faint)'}
                ">${i+1}</span>
                <div style="min-width:0;flex:1">
                  <div style="font-size:13px;color:var(--cream);font-weight:500;
                    white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${obj?.title||'Opera'}
                  </div>
                  <div style="font-size:11px;color:var(--faint);margin-top:1px">
                    ${obj?.artist||''} · ${obj?.room||''}
                  </div>
                </div>
                <span style="font-size:11px;color:var(--faint);flex-shrink:0">${count}</span>
              </button>
            `
          }).join('')}
        </div>

        <div>
          <div style="border-left:2px solid var(--gold);padding-left:16px;margin-bottom:24px">
            <p style="font-size:10px;letter-spacing:.14em;color:var(--gold);
              text-transform:uppercase;margin-bottom:6px">${object?.room||''}</p>
            <h2 class="serif" style="font-size:28px;font-weight:400;margin-bottom:4px">
              ${object?.title||''}
            </h2>
            <p style="font-size:13px;color:var(--muted)">${object?.artist||''} · ${object?.year||''}</p>
          </div>

          ${sorted.length
            ? sorted.map(itemCard).join('')
            : '<div class="empty" style="padding:30px 0">Nessun testo per questa opera.</div>'
          }

          ${logistic ? `
            <div style="margin-top:20px;padding:16px;
              border:1px solid rgba(200,169,110,.15);border-radius:3px;
              background:rgba(200,169,110,.04)">
              <p style="font-size:10px;letter-spacing:.1em;color:var(--gold);
                text-transform:uppercase;margin-bottom:8px">Indicazioni dopo questa tappa</p>
              <p style="font-size:13px;color:var(--muted);line-height:1.6">${logistic.text}</p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    ${adoptMsg ? `
      <div class="modal-overlay" onclick="if(event.target===this)closeAdoptMsg()">
        <div class="modal" style="text-align:center">
          <p style="font-size:15px;color:var(--cream);line-height:1.6;margin-bottom:20px">${adoptMsg}</p>
          <button onclick="closeAdoptMsg()" class="btn btn-gold" style="width:100%">OK</button>
        </div>
      </div>
    ` : ''}
  `
}
function closeAdoptMsg() { adoptMsg = null; render() }

async function adoptItem(itemId) {
  try {
    await api.post(`/api/marketplace/items/${itemId}/adopt`, {})
    adoptMsg = 'Item copiato'
    render()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}
window.adoptItem = adoptItem
window.closeAdoptMsg = closeAdoptMsg

window._selectStep = i => { selectedStep = i; render() }

load()