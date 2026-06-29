if (!getUser()) location.href = '/login.html'
const user = getUser()
if (user.role !== 'author') location.href = '/index.html'

const levelMeta = {
  infantile: { label: 'Bambini',      cls: 'tag-infantile' },
  semplice:  { label: 'Curioso',      cls: 'tag-semplice'  },
  medio:     { label: 'Appassionato', cls: 'tag-medio'     },
  avanzato:  { label: 'Esperto',      cls: 'tag-avanzato'  },
}

let visits    = []
let showModal = false
let editVisit = null
let msg       = null

async function load() {
  visits = await api.get('/api/visits/mine')
  render()
}

function openCreate() { editVisit = null; showModal = true; render() }
function openEdit(v)  { editVisit = v;    showModal = true; render() }
function closeModal() { showModal = false; editVisit = null; msg = null; render() }

async function saveVisit(e) {
  e.preventDefault()
  const form = document.getElementById('visitForm')
  const data = {
    title:             form.title.value.trim(),
    description:       form.description.value.trim(),
    museumId:          'galleria-estense',
    targetLevel:       form.targetLevel.value,
    estimatedDuration: form.estimatedDuration.value,
    isPublic:          form.isPublic.checked,
    steps:             [],
    logistics:         [],
  }
  if (!data.title || !data.targetLevel || !data.estimatedDuration) {
    msg = { type: 'error', text: 'Compila tutti i campi obbligatori.' }
    render(); return
  }
  try {
    if (editVisit) {
      await api.put(`/api/visits/${editVisit._id}`, data)
      msg = { type: 'success', text: 'Visita aggiornata.' }
    } else {
      await api.post('/api/visits', data)
      msg = { type: 'success', text: 'Visita creata.' }
    }
    showModal = false; editVisit = null
    await load()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}

async function deleteVisit(id) {
  if (!confirm('Eliminare questa visita?')) return
  try {
    await api.delete(`/api/visits/${id}`)
    msg = { type: 'success', text: 'Visita eliminata.' }
    await load()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}

function modal() {
  const v = editVisit
  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title serif">${v ? 'Modifica visita' : 'Nuova visita'}</h2>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        ${msg ? `<div class="alert alert-${msg.type}">${msg.text}</div>` : ''}
        <form id="visitForm" onsubmit="saveVisit(event)">
          <div class="field">
            <label class="label">Titolo *</label>
            <input name="title" class="input" value="${v?.title||''}" required>
          </div>
          <div class="field">
            <label class="label">Descrizione</label>
            <textarea name="description" class="input">${v?.description||''}</textarea>
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="label">Livello *</label>
              <select name="targetLevel" class="input" required>
                <option value="">Scegli...</option>
                <option value="infantile" ${v?.targetLevel==='infantile'?'selected':''}>Bambini</option>
                <option value="semplice"  ${v?.targetLevel==='semplice' ?'selected':''}>Curioso</option>
                <option value="medio"     ${v?.targetLevel==='medio'    ?'selected':''}>Appassionato</option>
                <option value="avanzato"  ${v?.targetLevel==='avanzato' ?'selected':''}>Esperto</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Durata *</label>
              <select name="estimatedDuration" class="input" required>
                <option value="">Scegli...</option>
                <option value="30 min"  ${v?.estimatedDuration==='30 min' ?'selected':''}>30 minuti</option>
                <option value="45 min"  ${v?.estimatedDuration==='45 min' ?'selected':''}>45 minuti</option>
                <option value="60 min"  ${v?.estimatedDuration==='60 min' ?'selected':''}>60 minuti</option>
                <option value="90 min"  ${v?.estimatedDuration==='90 min' ?'selected':''}>90 minuti</option>
                <option value="120 min" ${v?.estimatedDuration==='120 min'?'selected':''}>120 minuti</option>
              </select>
            </div>
          </div>
          <div class="field" style="display:flex;align-items:center;gap:10px">
            <input type="checkbox" name="isPublic" id="isPublic"
              ${v?.isPublic!==false?'checked':''} style="width:16px;height:16px;accent-color:var(--gold)">
            <label for="isPublic" style="font-size:13px;color:var(--muted);cursor:pointer">
              Pubblica nel marketplace
            </label>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Annulla</button>
            <button type="submit" class="btn btn-gold">${v?'Salva':'Crea visita'}</button>
          </div>
        </form>
      </div>
    </div>
  `
}

function render() {
  document.getElementById('app').innerHTML = `
    ${renderNav('editor')}
    ${showModal ? modal() : ''}
    <div class="container" style="padding-top:32px;padding-bottom:48px">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <p class="page-eyebrow">Autore · ${user.username}</p>
          <h1 class="page-title">Le mie visite</h1>
        </div>
        <button class="btn btn-gold" onclick="openCreate()">+ Nuova visita</button>
      </div>

      ${msg && !showModal ? `<div class="alert alert-${msg.type}" style="margin-bottom:24px">${msg.text}</div>` : ''}

      ${visits.length === 0
        ? '<div class="empty">Nessuna visita ancora. Creane una!</div>'
        : `<div style="display:flex;flex-direction:column;gap:12px">
            ${visits.map(v => `
              <div class="card" style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start">
                <div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
                    <span class="tag ${levelMeta[v.targetLevel]?.cls}">${levelMeta[v.targetLevel]?.label}</span>
                    <span style="font-size:11px;color:var(--faint);padding-top:2px">⏱ ${v.estimatedDuration}</span>
                    <span style="font-size:11px;color:${v.isPublic?'var(--success)':'var(--faint)'};padding-top:2px">
                      ${v.isPublic?'● Pubblica':'○ Privata'}
                    </span>
                  </div>
                  <h3 class="serif" style="font-size:22px;font-weight:400;margin-bottom:6px">${v.title}</h3>
                  <p style="font-size:13px;color:var(--muted);line-height:1.5">${v.description||'—'}</p>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;min-width:120px">
                  <a href="/visit-editor.html#${v._id}" class="btn btn-outline btn-sm" style="text-align:center">
                    Modifica percorso
                  </a>
                  <button class="btn btn-outline btn-sm"
                    onclick='openEdit(${JSON.stringify(v).replace(/'/g,"&#39;")})'>
                    Modifica
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteVisit('${v._id}')">Elimina</button>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `
}

load()