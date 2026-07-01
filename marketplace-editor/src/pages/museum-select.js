if (!getUser()) location.href = '/login.html'

const museums = [
  {
    id: 'galleria-estense',
    name: 'Galleria Estense',
    city: 'Modena',
    description: 'Una delle più importanti collezioni d\'arte del Rinascimento e del Barocco italiano, ospitata nel Palazzo dei Musei di Modena.',
    works: 12,
    visits: 4,
    color: '#C8A96E',
  },
  {
    id: 'pinacoteca-nazionale',
    name: 'Pinacoteca Nazionale',
    city: 'Bologna',
    description: 'Raccoglie opere dal Duecento al Settecento con focus sulla scuola bolognese. Disponibile prossimamente.',
    works: 0,
    visits: 0,
    color: '#5B9BD5',
    comingSoon: true,
  },
  {
    id: 'mambo',
    name: 'MAMbo',
    city: 'Bologna',
    description: 'Museo d\'Arte Moderna di Bologna, dedicato all\'arte contemporanea italiana e internazionale. Disponibile prossimamente.',
    works: 0,
    visits: 0,
    color: '#5DB87A',
    comingSoon: true,
  },
]

function render() {
  const selected = localStorage.getItem('selectedMuseum') || 'galleria-estense'

  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh;background:var(--bg);padding:48px 24px">
      <div style="max-width:800px;margin:0 auto">

        <div style="margin-bottom:48px">
          <p style="font-size:11px;letter-spacing:.14em;color:var(--gold);
            text-transform:uppercase;margin-bottom:12px">ArtAround</p>
          <h1 class="serif" style="font-size:44px;font-weight:400;line-height:1.05;margin-bottom:12px">
            Scegli il museo
          </h1>
          <p style="font-size:14px;color:var(--muted)">
            Seleziona il museo per cui vuoi creare o sfogliare contenuti.
          </p>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin-bottom:40px">
          ${museums.map(m => `
            <div onclick="${m.comingSoon ? '' : `selectMuseum('${m.id}')`}" style="
              padding:24px;border-radius:4px;cursor:${m.comingSoon ? 'default' : 'pointer'};
              border:2px solid ${selected === m.id ? m.color : 'var(--border)'};
              background:${selected === m.id ? `rgba(${hexToRgb(m.color)},.06)` : 'rgba(255,255,255,.02)'};
              opacity:${m.comingSoon ? '.5' : '1'};
              transition:all .15s;position:relative
            "
            ${!m.comingSoon ? `
              onmouseover="this.style.borderColor='${m.color}'"
              onmouseout="this.style.borderColor='${selected === m.id ? m.color : 'var(--border)'}'"
            ` : ''}>
              ${m.comingSoon ? `
                <span style="position:absolute;top:12px;right:12px;font-size:10px;
                  padding:3px 8px;border-radius:2px;background:rgba(255,255,255,.06);
                  color:var(--faint)">Presto</span>
              ` : ''}
              ${selected === m.id ? `
                <span style="position:absolute;top:12px;right:12px;font-size:10px;
                  padding:3px 8px;border-radius:2px;background:rgba(${hexToRgb(m.color)},.15);
                  color:${m.color}">✓ Selezionato</span>
              ` : ''}
              <div style="width:32px;height:3px;background:${m.color};border-radius:2px;margin-bottom:16px"></div>
              <h3 class="serif" style="font-size:22px;font-weight:400;margin-bottom:4px">${m.name}</h3>
              <p style="font-size:12px;color:var(--gold);margin-bottom:12px">${m.city}</p>
              <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:16px">${m.description}</p>
              ${!m.comingSoon ? `
                <div style="display:flex;gap:16px;font-size:11px;color:var(--faint)">
                  <span>${m.works} opere</span>
                  <span>${m.visits} visite</span>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <div style="display:flex;gap:12px;justify-content:flex-end">
          <a href="/index.html" class="btn btn-outline">← Torna al marketplace</a>
          <button onclick="confirmSelection()" class="btn btn-gold" style="padding:12px 32px">
            Entra nel museo →
          </button>
        </div>
      </div>
    </div>
  `
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return `${r},${g},${b}`
}

function selectMuseum(id) {
  localStorage.setItem('selectedMuseum', id)
  render()
}

function confirmSelection() {
  const selected = localStorage.getItem('selectedMuseum') || 'galleria-estense'
  location.href = '/index.html'
}

window.selectMuseum    = selectMuseum
window.confirmSelection = confirmSelection

render()