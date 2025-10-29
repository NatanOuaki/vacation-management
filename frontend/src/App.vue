<template>
  <div>
    <header class="card" style="display:flex;justify-content:space-between;align-items:center;padding:1rem 2rem;">
      <h2 style="margin:0;">Vacation Manager</h2>
      <nav style="display:flex;gap:1rem;">
        <RouterLink to="/requester" class="btn ghost">Requester</RouterLink>
        <RouterLink to="/validator" class="btn ghost">Validator</RouterLink>
      </nav>
    </header>

    <main class="container" style="margin-top:2rem;">
      <RouterView />
    </main>
  </div>
</template>
