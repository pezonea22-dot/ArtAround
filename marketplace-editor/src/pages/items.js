if (!getUser()) location.href = '/login.html'
const user = getUser()
if (user.role !== 'author') location.href = '/index.html'

const levelMeta = {
  infantile: { label: 'Bambini',      cls: 'tag-infantile' },
  semplice:  { label: 'Curioso',      cls: 'tag-semplice'  },
  medio:     { label: 'Appassionato', cls: 'tag-medio'     },
  avanzato:  { label: 'Esperto',      cls: 'tag-avanzato'  },
}
const durationLabel = { '3s':'3 sec','15s':'15 sec','1min':'1 min','4min':'4 min' }

let items       = []
let objects     = []
let showModal   = false
let editItem    = null
let filterLevel = ''
let msg         = null
let page     = 1
const limit  = 10

async function load() {
  [items, objects] = await Promise.all([
    api.get('/api/items/mine'),
    api.get('/api/objects?museumId=galleria-estense'),
  ])
  render()
}

function openCreate() { editItem = null; showModal = true; render() }
function openEdit(item) { editItem = item; showModal = true; render() }
function closeModal() { showModal = false; editItem = null; msg = null; render() }

async function saveItem(e) {
  e.preventDefault()
  const form = document.getElementById('itemForm')
  const data = {
  objectId: form.objectId.value,
  text:     form.text.value.trim(),
  duration: form.duration.value,
  level:    form.level.value,
  license:  form.license.value,
  price:    parseFloat(form.price.value) || 0,
  isPublic: form.isPublic.checked,
}
  if (!data.objectId || !data.text || !data.duration || !data.level) {
    msg = { type: 'error', text: 'Compila tutti i campi obbligatori.' }
    render(); return
  }
  try {
    if (editItem) {
      await api.put(`/api/items/${editItem._id}`, data)
      msg = { type: 'success', text: 'Item aggiornato.' }
    } else {
      await api.post('/api/items', data)
      msg = { type: 'success', text: 'Item creato.' }
    }
    showModal = false; editItem = null
    await load()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}

async function deleteItem(id) {
  if (!confirm('Eliminare questo item?')) return
  try {
    await api.delete(`/api/items/${id}`)
    msg = { type: 'success', text: 'Item eliminato.' }
    await load()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}

function modal() {
  const i = editItem
  return `
    <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title serif">${i?'Modifica item':'Nuovo item'}</h2>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        ${msg ? `<div class="alert alert-${msg.type}">${msg.text}</div>` : ''}
        <form id="itemForm" onsubmit="saveItem(event)">
          <div class="field">
            <label class="label">Opera *</label>
            <select name="objectId" class="input" required>
              <option value="">Seleziona opera...</option>
              ${objects.map(o => `
                <option value="${o._id}"
                  ${i?.objectId?._id===o._id||i?.objectId===o._id?'selected':''}>
                  [${o.universalId}] ${o.title} — ${o.artist}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="field">
            <label class="label">Testo *</label>
            <textarea name="text" class="input" rows="5" required>${i?.text||''}</textarea>
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="label">Livello *</label>
              <select name="level" class="input" required>
                <option value="">Scegli...</option>
                <option value="infantile" ${i?.level==='infantile'?'selected':''}>Bambino</option>
                <option value="semplice"  ${i?.level==='semplice' ?'selected':''}>Semplice</option>
                <option value="medio"     ${i?.level==='medio'    ?'selected':''}>Medio</option>
                <option value="avanzato"  ${i?.level==='avanzato' ?'selected':''}>Avanzato</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Durata *</label>
              <select name="duration" class="input" required>
                <option value="">Scegli...</option>
                <option value="3s"   ${i?.duration==='3s'  ?'selected':''}>3 secondi</option>
                <option value="15s"  ${i?.duration==='15s' ?'selected':''}>15 secondi</option>
                <option value="1min" ${i?.duration==='1min'?'selected':''}>1 minuto</option>
                <option value="4min" ${i?.duration==='4min'?'selected':''}>4 minuti</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="field">
              <label class="label">Licenza</label>
              <select name="license" class="input">
                <option value="free" ${i?.license==='free'?'selected':''}>Gratuita</option>
                <option value="cc-by" ${i?.license==='cc-by'?'selected':''}>CC BY</option>
                <option value="paid" ${i?.license==='paid'?'selected':''}>A pagamento</option>
              </select>
            </div>
            <div class="field">
              <label class="label">Prezzo (€)</label>
              <input name="price" type="number" min="0" step="0.5" class="input"
                value="${i?.price||0}" placeholder="0">
            </div>
            <div class="field" style="display:flex;align-items:center;gap:10px;padding-top:24px">
              <input type="checkbox" name="isPublic" id="isPublic"
                ${i?.isPublic!==false?'checked':''} style="width:16px;height:16px;accent-color:var(--gold)">
              <label for="isPublic" style="font-size:13px;color:var(--muted);cursor:pointer">Pubblico</label>
            </div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
            <button type="button" class="btn btn-outline" onclick="closeModal()">Annulla</button>
            <button type="submit" class="btn btn-gold">${i?'Salva':'Crea item'}</button>
          </div>
        </form>
      </div>
    </div>
  `
}

function filtered() {
  return items.filter(i => !filterLevel || i.level === filterLevel)
}

function paginated() {
  const list = filtered()
  const start = (page - 1) * limit
  return { items: list.slice(start, start + limit), total: list.length }
}

function render() {
  const list = filtered()
  const { items: pageItems, total } = paginated()
  const totalPages = Math.ceil(total / limit)
  document.getElementById('app').innerHTML = `
    ${renderNav('items')}
    ${showModal ? modal() : ''}
    <div class="container" style="padding-top:32px;padding-bottom:48px">
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <p class="page-eyebrow">Autore · ${user.username}</p>
          <h1 class="page-title">I miei item</h1>
        </div>
        <button class="btn btn-gold" onclick="openCreate()">+ Nuovo item</button>
      </div>

      ${msg && !showModal ? `<div class="alert alert-${msg.type}" style="margin-bottom:24px">${msg.text}</div>` : ''}

      <div style="display:flex;gap:12px;align-items:center;margin-bottom:24px">
        <select class="input" style="max-width:180px" onchange="filterLevel=this.value;render()">
          <option value="">Tutti i livelli</option>
          <option value="infantile">Bambini</option>
          <option value="semplice">Semplice</option>
          <option value="medio">Medio</option>
          <option value="avanzato">Avanzato</option>
        </select>
        <span style="font-size:12px;color:var(--faint)">${list.length} item</span>
      </div>
      
      ${(() => {
      const { items: pageItems, total } = paginated()
      const totalPages = Math.ceil(total / limit)
      return pageItems.length === 0
        ? '<div class="empty">Nessun item ancora. Creane uno!</div>'
        : `<div style="display:flex;flex-direction:column;gap:10px">
            ${pageItems.map(item => `
              <div class="card" style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:start">
                <div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">
                    <span class="tag ${levelMeta[item.level]?.cls}">${levelMeta[item.level]?.label}</span>
                    <span class="tag" style="background:rgba(200,169,110,.08);color:var(--gold)">
                      ${durationLabel[item.duration]}
                    </span>
                    <span style="font-size:10px;padding:3px 9px;border-radius:2px;
                      background:${item.isPublic?'rgba(93,184,122,.12)':'rgba(255,255,255,.04)'};
                      color:${item.isPublic?'var(--success)':'var(--faint)'}">
                      ${item.isPublic?'Pubblico':'Privato'}
                    </span>
                    ${item.price > 0 ? `<span class="tag" style="background:rgba(200,169,110,.12);color:var(--gold)">€${item.price}</span>` : ''}
                  </div>
                  <p style="font-size:11px;color:var(--faint);margin-bottom:6px">
                    ${item.objectId?.title||'Opera'} · ${item.objectId?.artist||''}
                  </p>
                  <p style="font-size:14px;color:var(--cream);line-height:1.6">
                    ${item.text.length>180?item.text.substring(0,180)+'…':item.text}
                  </p>
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;min-width:80px">
                  <button class="btn btn-outline btn-sm"
                    onclick='openEdit(${JSON.stringify(item).replace(/'/g,"&#39;")})'>
                    Modifica
                  </button>
                  <button class="btn btn-danger btn-sm" onclick="deleteItem('${item._id}')">
                    Elimina
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
          ${totalPages > 1 ? `
            <div style="display:flex;gap:8px;justify-content:center;margin-top:24px;align-items:center">
              <button onclick="changePage(${page-1})" ${page===1?'disabled':''} class="btn btn-outline btn-sm">←</button>
              <span style="font-size:13px;color:var(--muted)">${page} / ${totalPages}</span>
              <button onclick="changePage(${page+1})" ${page===totalPages?'disabled':''} class="btn btn-outline btn-sm">→</button>
            </div>
          ` : ''}
        `
    })()}
    </div>
  `
}

load()
function changePage(n) { page = n; render() }
window.changePage = changePage