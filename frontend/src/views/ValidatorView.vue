<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge.vue'

/* --------- State --------- */
const status = ref('')
const list = ref([])

const page = ref(1)
const limit = ref(10)
const totalPages = ref(1)
const totalItems = ref(0)

const sort = ref('created_at') // created_at | start_date | end_date
const dir  = ref('desc')       // asc | desc

const comments = ref({})
const busy = ref(false)
const msg = ref({ type: '', text: '' })

/* --------- Utils --------- */
function toast(type, text) {
  msg.value = { type, text }
  setTimeout(() => (msg.value.text = ''), 2500)
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Fallback si le backend n’envoie pas "days"
function daysFor(r) {
  if (r?.days != null) return Number(r.days)
  const s = new Date(r.start_date), e = new Date(r.end_date)
  const ms = e - s
  const days = Math.floor(ms / 86400000) + 1
  return Math.max(1, days)
}

/* --------- Data load --------- */
async function load() {
  busy.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit.value),
      sort: sort.value,
      dir: dir.value
    })
    if (status.value) params.set('status', status.value)

    const { data } = await api.get(`/requests?${params.toString()}`)

    // Supporte 2 formats: {data, pagination} OU tableau simple (fallback)
    if (Array.isArray(data)) {
      list.value = data
      totalItems.value = data.length
      totalPages.value = 1
    } else {
      list.value = data.data
      totalItems.value = data.pagination?.total ?? data.data?.length ?? 0
      totalPages.value = data.pagination?.pages ?? 1
    }
  } catch (e) {
    toast('bad', 'Error loading requests')
  } finally {
    busy.value = false
  }
}

/* --------- Mutations --------- */
async function approve(id) {
  try {
    await api.patch(`/requests/${id}`, { status: 'Approved' })
    toast('ok', 'Request approved')
    await load()
  } catch {
    toast('bad', 'Approval failed')
  }
}

async function reject(id) {
  try {
    await api.patch(`/requests/${id}`, { status: 'Rejected', comments: comments.value[id] || '' })
    comments.value[id] = ''
    toast('bad', 'Request rejected')
    await load()
  } catch {
    toast('bad', 'Rejection failed')
  }
}

/* --------- Effects --------- */
onMounted(load)
watch([status, sort, dir], () => { page.value = 1; load() })
</script>

<template>
  <section class="card">
<!-- Header / Controls (new) -->
<div class="filters-card">
  <div class="filters-grid">
    <div class="field">
      <label class="label">Status</label>
      <select class="select" v-model="status" @change="page=1; load()">
        <option value="">All</option>
        <option>Pending</option>
        <option>Approved</option>
        <option>Rejected</option>
      </select>
    </div>

    <div class="field">
      <label class="label">Sort by</label>
      <div class="row" style="gap:8px">
        <select class="select" v-model="sort" @change="page=1; load()" style="flex:1">
          <option value="created_at">Created</option>
          <option value="start_date">Start date</option>
          <option value="end_date">End date</option>
        </select>
        <select class="select" v-model="dir" @change="page=1; load()" style="width:120px">
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>
    </div>

    <div class="actions field">
      <label class="label">&nbsp;</label>
      <div class="row" style="gap:8px; justify-content:flex-end">
        <button class="btn ghost" :disabled="busy" @click="load">
          {{ busy ? 'Loading…' : 'Refresh' }}
        </button>
        <button class="btn" @click="status=''; sort='created_at'; dir='desc'; page=1; limit=10; load()">
          Reset
        </button>
      </div>
    </div>
  </div>

  <p class="helper" style="margin:8px 0 0">
    Filter, sort and approve or reject requests.
  </p>
</div>


    <!-- Toast message -->
    <p v-if="msg.text" :style="{ color: msg.type === 'bad' ? '#ff9b9b' : '#b7ffd8', marginTop: '10px' }">
      {{ msg.text }}
    </p>

    <!-- Table -->
    <div class="card" style="margin-top:12px; overflow-x:auto;">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th style="width:360px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in list" :key="r.id">
            <td>#{{ r.id }}</td>
            <td>{{ r.user_name }}</td>
            <td>{{ formatDate(r.start_date) }} → {{ formatDate(r.end_date) }}</td>
            <td>{{ daysFor(r) }}</td>
            <td><span class="helper">{{ r.reason || '—' }}</span></td>
            <td><StatusBadge :status="r.status" /></td>
            <td>
              <div v-if="r.status === 'Pending'" class="row" style="gap:8px; flex-wrap:wrap;">
                <button class="btn ok" @click="approve(r.id)">Approve</button>
                <input
                  class="input"
                  placeholder="Rejection comment…"
                  v-model="comments[r.id]"
                  style="flex:1; min-width:160px"
                />
                <button class="btn bad" @click="reject(r.id)">Reject</button>
              </div>
              <span v-else class="helper">—</span>
            </td>
          </tr>

          <tr v-if="!list.length">
            <td colspan="7" class="helper" style="text-align:center; padding:1rem">
              No requests found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="row" style="justify-content:flex-end; align-items:center; gap:10px; margin-top:12px;">
      <span class="helper">Total: {{ totalItems }}</span>
      <button class="btn ghost" :disabled="page<=1 || busy" @click="page--; load()">Prev</button>
      <span class="helper">Page {{ page }} / {{ totalPages }}</span>
      <button class="btn ghost" :disabled="page>=totalPages || busy" @click="page++; load()">Next</button>
    </div>
  </section>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th {
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
}

td,
th {
  padding: 0.75rem;
  text-align: left;
  font-size: 0.95rem;
  vertical-align: middle;
}

tr:hover td {
  background: #7aa6ff20;
}

.helper {
  color: #6b7280;
  font-size: 0.9rem;
}

.filters-card {
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 12px 16px;
  align-items: end;
}

.field .label {
  display: block;
  font-size: .85rem;
  color: #9aa4b2;
  margin-bottom: 6px;
}

.actions { text-align: center; }

/* Inputs harmonisés */
.select, .input {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #e5e7eb;
}

/* Mobile */
@media (max-width: 860px) {
  .filters-grid { grid-template-columns: 1fr; }
  .actions { text-align: left; }
}


/* Mobile tweaks */
@media (max-width: 768px) {
  td, th { padding: 0.5rem; font-size: 0.9rem; }
}
</style>
