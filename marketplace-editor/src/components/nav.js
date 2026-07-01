function renderNav(activePage = '') {
  const user = getUser()
  if (!user) return ''

  return `
    <nav class="nav">
      <div class="nav-logo">Art<em>Around</em>
        <span style="font-size:12px;color:var(--faint);font-family:Inter,sans-serif;font-style:normal">
          Marketplace
        </span>
      </div>
      <div class="nav-links">
        <a href="/museum-select.html" class="nav-link ${activePage==='museum'?'active':''}" title="Cambia museo">🏛️</a>
        <a href="/index.html" class="nav-link ${activePage==='marketplace'?'active':''}">Marketplace</a>
        ${user.role === 'author' ? `
          <a href="/editor.html" class="nav-link ${activePage==='editor'?'active':''}">Le mie visite</a>
          <a href="/items.html"  class="nav-link ${activePage==='items' ?'active':''}">I miei item</a>
        ` : ''}
        <span class="nav-user">${user.username}</span>
        <button onclick="doLogout()" class="btn btn-outline btn-sm">Esci</button>
      </div>
    </nav>
  `
}

window.renderNav = renderNav