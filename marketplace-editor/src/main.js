if (!getUser()) location.href = '/login.html'

const levelMeta = {
  infantile: { label: 'Bambini',      cls: 'tag-infantile' },
  semplice:  { label: 'Curioso',      cls: 'tag-semplice'  },
  medio:     { label: 'Appassionato', cls: 'tag-medio'     },
  avanzato:  { label: 'Esperto',      cls: 'tag-avanzato'  },
}

let visits = []
let filterLevel = ''
let filterTime  = ''
let search      = ''

async function load() {
  visits = await api.get('/api/marketplace/visits?museumId=galleria-estense')
  render()
}

function filtered() {
  return visits.filter(v => {
    if (filterLevel && v.targetLevel !== filterLevel) return false
    if (filterTime  && parseInt(v.estimatedDuration) > parseInt(filterTime)) return false
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) &&
                  !v.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })
}

function visitCard(v) {
  const meta = levelMeta[v.targetLevel] || {}
  return `
    <a class="card" href="/visit-detail.html#${v._id}"
      style="cursor:pointer;display:block;text-decoration:none;color:inherit">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
        <span class="tag ${meta.cls}">${meta.label}</span>
        <span style="font-size:11px;color:var(--faint)">⏱ ${v.estimatedDuration}</span>
      </div>
      <h3 class="serif" style="font-size:22px;font-weight:400;margin-bottom:8px;line-height:1.2">
        ${v.title}
      </h3>
      <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:16px">
        ${v.description || ''}
      </p>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;color:var(--faint)">✍️ ${v.author?.username}</span>
        <span style="font-size:12px;color:var(--gold)">Apri percorso →</span>
      </div>
    </a>
  `
}

function render() {
  const list = filtered()
  document.getElementById('app').innerHTML = `
    ${renderNav('marketplace')}
    <div class="container">
      <div class="page-header">
        <p class="page-eyebrow">Galleria Estense · Modena</p>
        <h1 class="page-title">Marketplace</h1>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px;align-items:center">
        <input class="input" placeholder="Cerca percorso..." value="${search}"
          style="max-width:260px" oninput="window._search(this.value)">
        <select class="input" style="max-width:180px" onchange="window._filterLevel(this.value)">
          <option value="">Tutti i livelli</option>
          <option value="infantile" ${filterLevel==='infantile'?'selected':''}>Bambini</option>
          <option value="semplice"  ${filterLevel==='semplice' ?'selected':''}>Curioso</option>
          <option value="medio"     ${filterLevel==='medio'    ?'selected':''}>Appassionato</option>
          <option value="avanzato"  ${filterLevel==='avanzato' ?'selected':''}>Esperto</option>
        </select>
        <select class="input" style="max-width:180px" onchange="window._filterTime(this.value)">
          <option value="">Qualsiasi durata</option>
          <option value="45"  ${filterTime==='45' ?'selected':''}>Fino a 45 min</option>
          <option value="90"  ${filterTime==='90' ?'selected':''}>Fino a 90 min</option>
          <option value="120" ${filterTime==='120'?'selected':''}>Fino a 2 ore</option>
        </select>
        <span style="font-size:12px;color:var(--faint);margin-left:auto">${list.length} percorsi</span>
      </div>
      <div class="grid-2">
        ${list.length ? list.map(visitCard).join('') : '<div class="empty">Nessun percorso trovato.</div>'}
      </div>
    </div>
  `
}

window._search      = v => { search = v; render() }
window._filterLevel = v => { filterLevel = v; render() }
window._filterTime  = v => { filterTime  = v; render() }

load()