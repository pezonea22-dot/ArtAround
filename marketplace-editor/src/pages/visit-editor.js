if (!getUser()) location.href = '/login.html'
const user = getUser()
if (user.role !== 'author') location.href = '/index.html'

const id = location.hash.replace('#', '') || new URLSearchParams(location.search).get('id')
if (!id) location.href = '/editor.html'

let visit   = null
let objects = []
let allItems = {}
let msg     = null

const levelMeta = {
  infantile: { label: 'Bambini',      cls: 'tag-infantile' },
  semplice:  { label: 'Curioso',      cls: 'tag-semplice'  },
  medio:     { label: 'Appassionato', cls: 'tag-medio'     },
  avanzato:  { label: 'Esperto',      cls: 'tag-avanzato'  },
}
const durationLabel = { '3s':'3 sec','15s':'15 sec','1min':'1 min','4min':'4 min' }

async function load() {
  [visit, objects] = await Promise.all([
    api.get(`/api/visits/${id}`),
    api.get('/api/objects?museumId=galleria-estense'),
  ])
  // carica tutti gli item per ogni opera già nella visita
  await Promise.all(visit.steps.map(async s => {
    const oid = s.objectId?._id || s.objectId
    if (oid && !allItems[oid]) {
      allItems[oid] = await api.get(`/api/items?objectId=${oid}`)
    }
  }))
  render()
}

async function addStep(objectId) {
  if (!objectId) return
  // evita duplicati
  const exists = visit.steps.some(s => (s.objectId?._id || s.objectId) === objectId)
  if (exists) {
    msg = { type: 'error', text: 'Quest\'opera è già nella visita.' }
    render(); return
  }
  // carica gli item dell'opera se non li abbiamo
  if (!allItems[objectId]) {
    allItems[objectId] = await api.get(`/api/items?objectId=${objectId}`)
  }
  // prendi l'item più adatto al livello della visita
  const items = allItems[objectId]
  const best  = items.find(i => i.level === visit.targetLevel) || items[0]
  visit.steps.push({
    objectId: objects.find(o => o._id === objectId),
    items: best ? [best] : []
  })
  await saveSteps()
}

async function removeStep(index) {
  if (!confirm('Rimuovere questa opera dal percorso?')) return
  visit.steps.splice(index, 1)
  await saveSteps()
}

async function moveStep(index, direction) {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= visit.steps.length) return
  const tmp = visit.steps[index]
  visit.steps[index] = visit.steps[newIndex]
  visit.steps[newIndex] = tmp
  await saveSteps()
}

async function saveSteps() {
  try {
    const data = {
      ...visit,
      steps: visit.steps.map(s => ({
        objectId: s.objectId?._id || s.objectId,
        items: (s.items || []).map(i => i._id || i),
        optionalItems: (s.optionalItems || []).map(i => i._id || i)
    }))
    }
    visit = await api.put(`/api/visits/${id}`, data)
    // ripopola gli objectId dopo il save
    visit = await api.get(`/api/visits/${id}`)
    msg = { type: 'success', text: 'Visita salvata.' }
    render()
  } catch(e) {
    msg = { type: 'error', text: e.message }
    render()
  }
}

async function addItemToStep(stepIndex, itemId) {
  if (!itemId) return
  const step = visit.steps[stepIndex]
  const already = step.items?.some(i => (i._id || i) === itemId)
  if (already) return
  step.items = [...(step.items || []), { _id: itemId }]
  await saveSteps()
}

async function removeItemFromStep(stepIndex, itemId) {
  const step = visit.steps[stepIndex]
  step.items = (step.items || []).filter(i => (i._id || i) !== itemId)
  await saveSteps()
}

function render() {
  const availableObjects = objects.filter(o =>
    !visit.steps.some(s => (s.objectId?._id || s.objectId) === o._id)
  )

  document.getElementById('app').innerHTML = `
    ${renderNav('editor')}
    <div class="container" style="padding-top:32px;padding-bottom:48px">

      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <a href="/editor.html" style="font-size:13px;color:var(--muted);text-decoration:none">← Le mie visite</a>
      </div>

      <div class="page-header" style="margin-bottom:24px">
        <p class="page-eyebrow">${levelMeta[visit.targetLevel]?.label} · ${visit.estimatedDuration}</p>
        <h1 class="page-title">${visit.title}</h1>
      </div>

      ${msg ? `<div class="alert alert-${msg.type}" style="margin-bottom:20px">${msg.text}</div>` : ''}

      <div style="display:grid;grid-template-columns:1fr 340px;gap:32px;align-items:start">

        <!-- Sequenza opere -->
        <div>
          <p style="font-size:11px;letter-spacing:.1em;color:var(--gold);
            text-transform:uppercase;margin-bottom:16px">
            Sequenza opere (${visit.steps.length})
          </p>

          ${visit.steps.length === 0
            ? '<div class="empty" style="padding:40px 0">Nessuna opera ancora. Aggiungine una dalla lista a destra.</div>'
            : visit.steps.map((s, i) => {
                const obj   = s.objectId
                const oid   = obj?._id || obj
                const items = allItems[oid] || s.items || []
                return `
                  <div class="card" style="margin-bottom:10px">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
                      <!-- Numero e frecce -->
                      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0">
                        <button onclick="moveStep(${i}, -1)" ${i===0?'disabled':''} style="
                          background:none;border:1px solid var(--border);border-radius:2px;
                          color:${i===0?'var(--faint)':'var(--muted)'};cursor:${i===0?'not-allowed':'pointer'};
                          width:24px;height:24px;font-size:12px;padding:0
                        ">↑</button>
                        <span style="width:24px;height:24px;border-radius:50%;background:var(--gold);
                          color:var(--bg);display:flex;align-items:center;justify-content:center;
                          font-size:11px;font-weight:700">${i+1}</span>
                        <button onclick="moveStep(${i}, 1)" ${i===visit.steps.length-1?'disabled':''} style="
                          background:none;border:1px solid var(--border);border-radius:2px;
                          color:${i===visit.steps.length-1?'var(--faint)':'var(--muted)'};
                          cursor:${i===visit.steps.length-1?'not-allowed':'pointer'};
                          width:24px;height:24px;font-size:12px;padding:0
                        ">↓</button>
                      </div>

                      <!-- Info opera -->
                      <div style="flex:1;min-width:0">
                        <p style="font-size:10px;color:var(--gold);text-transform:uppercase;
                          letter-spacing:.1em;margin-bottom:3px">${obj?.room||''}</p>
                        <p style="font-size:15px;font-weight:500;color:var(--cream);
                          white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${obj?.title||''}</p>
                        <p style="font-size:12px;color:var(--muted)">${obj?.artist||''} · ${obj?.year||''}</p>
                      </div>

                      <!-- Rimuovi -->
                      <button onclick="removeStep(${i})" class="btn btn-danger btn-sm">Rimuovi</button>
                    </div>

                    <!-- Item selezionati -->
                    <div style="padding-left:36px">
                      <p style="font-size:10px;letter-spacing:.08em;color:var(--faint);
                        text-transform:uppercase;margin-bottom:8px">
                        Testi inclusi (${(s.items||[]).length})
                      </p>
                      <!-- Item opzionali -->
                    <p style="font-size:10px;letter-spacing:.08em;color:var(--faint);
                    text-transform:uppercase;margin-top:12px;margin-bottom:8px">
                    Testi opzionali (${(s.optionalItems||[]).length})
                    </p>
                    ${(s.optionalItems||[]).map(item => {
                    const fullItem = items.find(it => it._id === (item._id||item)) || item
                    return `
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;overflow:hidden;min-width:0;
                        padding:8px 10px;background:rgba(200,169,110,.03);border-radius:3px;
                        border:1px dashed rgba(200,169,110,.2)">
                        <span class="tag ${levelMeta[fullItem.level]?.cls}" style="flex-shrink:0">
                            ${levelMeta[fullItem.level]?.label||fullItem.level}
                        </span>
                        <span class="tag" style="background:rgba(200,169,110,.08);color:var(--gold);flex-shrink:0">
                            ${durationLabel[fullItem.duration]||fullItem.duration}
                        </span>
                        <p style="font-size:12px;color:var(--muted);flex:1;min-width:0;max-width:400px;
                            white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                            ${fullItem.text||''}
                        </p>
                        <button onclick="removeOptionalItem(${i}, '${item._id||item}')"
                            style="background:none;border:none;color:var(--faint);cursor:pointer;font-size:14px">✕</button>
                        </div>
                    `
                    }).join('')}
                    ${items.filter(it =>
                    !(s.items||[]).some(si => (si._id||si) === it._id) &&
                    !(s.optionalItems||[]).some(si => (si._id||si) === it._id)
                    ).length > 0 ? `
                    <select onchange="addOptionalItem(${i}, this.value); this.value=''"
                        class="input" style="margin-top:6px;font-size:12px">
                        <option value="">+ Aggiungi testo opzionale...</option>
                        ${items
                        .filter(it =>
                            !(s.items||[]).some(si => (si._id||si) === it._id) &&
                            !(s.optionalItems||[]).some(si => (si._id||si) === it._id)
                        )
                        .map(it => `
                            <option value="${it._id}">
                            ${levelMeta[it.level]?.label} · ${durationLabel[it.duration]} —
                            ${it.text.substring(0,40)}...
                            </option>
                        `).join('')}
                    </select>
                    ` : ''}

                      ${(s.items||[]).map(item => {
                        const fullItem = items.find(it => it._id === (item._id||item)) || item
                        return `
                          <div style="display:flex;align-items:center;gap:8px;overflow:hidden;min-width:0;
                            margin-bottom:6px;padding:8px 10px;
                            background:rgba(255,255,255,.02);border-radius:3px;
                            border:1px solid var(--border)">
                            <span class="tag ${levelMeta[fullItem.level]?.cls}" style="flex-shrink:0">
                              ${levelMeta[fullItem.level]?.label||fullItem.level}
                            </span>
                            <span class="tag" style="background:rgba(200,169,110,.08);color:var(--gold);flex-shrink:0">
                              ${durationLabel[fullItem.duration]||fullItem.duration}
                            </span>
                           <p style="font-size:12px;color:var(--muted);flex:1;min-width:0;max-width:400px;
                                white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                                ${fullItem.text||''}
                            </p>
                            <button onclick="removeItemFromStep(${i}, '${item._id||item}')"
                              style="background:none;border:none;color:var(--faint);
                              cursor:pointer;font-size:14px;flex-shrink:0">✕</button>
                          </div>
                        `
                      }).join('')}

                      <!-- Aggiungi item -->
                      ${items.filter(it => !(s.items||[]).some(si => (si._id||si) === it._id)).length > 0 ? `
                        <select onchange="addItemToStep(${i}, this.value); this.value=''"
                          class="input" style="margin-top:8px;font-size:12px">
                          <option value="">+ Aggiungi testo...</option>
                          ${items
                            .filter(it => !(s.items||[]).some(si => (si._id||si) === it._id))
                            .map(it => `
                              <option value="${it._id}">
                                ${levelMeta[it.level]?.label} · ${durationLabel[it.duration]} —
                                ${it.text.substring(0,40)}...
                              </option>
                            `).join('')}
                        </select>
                      ` : ''}
                    </div>
                  </div>
                `
              }).join('')
          }
        </div>

        <!-- Pannello aggiungi opera -->
        <div style="position:sticky;top:80px">
          <p style="font-size:11px;letter-spacing:.1em;color:var(--gold);
            text-transform:uppercase;margin-bottom:16px">
            Aggiungi opera (${availableObjects.length} disponibili)
          </p>
          <div style="display:flex;flex-direction:column;gap:6px;max-height:60vh;overflow-y:auto">
            ${availableObjects.map(o => `
              <button onclick="addStep('${o._id}')" style="
                padding:12px 14px;border-radius:3px;text-align:left;cursor:pointer;
                border:1px solid var(--border);background:transparent;
                font-family:inherit;transition:all .15s;width:100%
              "
              onmouseover="this.style.borderColor='rgba(200,169,110,.4)'"
              onmouseout="this.style.borderColor='var(--border)'">
                <p style="font-size:10px;color:var(--gold);text-transform:uppercase;
                  letter-spacing:.08em;margin-bottom:3px">${o.room}</p>
                <p style="font-size:13px;font-weight:500;color:var(--cream);margin-bottom:2px">${o.title}</p>
                <p style="font-size:11px;color:var(--muted)">${o.artist} · ${o.year}</p>
              </button>
            `).join('')}
            ${availableObjects.length === 0
              ? '<p style="font-size:13px;color:var(--faint);text-align:center;padding:20px">Tutte le opere sono già nel percorso.</p>'
              : ''
            }
          </div>
        </div>
      </div>
    </div>
  `
}
async function addOptionalItem(stepIndex, itemId) {
  if (!itemId) return
  const step = visit.steps[stepIndex]
  step.optionalItems = [...(step.optionalItems || []), { _id: itemId }]
  await saveSteps()
}

async function removeOptionalItem(stepIndex, itemId) {
  const step = visit.steps[stepIndex]
  step.optionalItems = (step.optionalItems || []).filter(i => (i._id || i) !== itemId)
  await saveSteps()
}

window.addOptionalItem    = addOptionalItem
window.removeOptionalItem = removeOptionalItem
window.moveStep           = moveStep
window.removeStep         = removeStep
window.addStep            = addStep
window.addItemToStep      = addItemToStep
window.removeItemFromStep = removeItemFromStep

load()