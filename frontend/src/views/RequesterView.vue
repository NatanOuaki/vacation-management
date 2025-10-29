<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from '../api/client'
import StatusBadge from '../components/StatusBadge.vue'

const USER_ID = 1

/* ---------- Form ---------- */
const form = ref({ start_date: '', end_date: '', reason: '' })
const busy = ref(false)
const msg = ref({ type: '', text: '' })

function toast(type, text) {
  msg.value = { type, text }
  setTimeout(() => (msg.value.text = ''), 2500)
}

function validateForm() {
  if (!form.value.start_date || !form.value.end_date)
    return 'Please fill in start and end date.'
  if (new Date(form.value.end_date) < new Date(form.value.start_date))
    return 'End date must be after start date.'
  return ''
}

async function submitRequest() {
  const err = validateForm()
  if (err) return toast('bad', err)

  try {
    busy.value = true
    await api.post('/requests', { user_id: USER_ID, ...form.value })
    toast('ok', 'Request submitted')
    form.value = { start_date: '', end_date: '', reason: '' }
    await fetchRequests()
  } catch (e) {
    toast('bad', 'Submission failed')
  } finally {
    busy.value = false
  }
}

/* ---------- List + filters ---------- */
const requests = ref([])

const page = ref(1)
const limit = ref(5)
const totalPages = ref(1)
const totalItems = ref(0)
const sort = ref('created_at') // created_at | start_date | end_date
const dir  = ref('desc')       // asc | desc

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Fallback si le backend ne renvoie pas "days"
function daysFor(r) {
  if (r?.days != null) return Number(r.days)
  const s = new Date(r.start_date), e = new Date(r.end_date)
  const days = Math.floor((e - s) / 86400000) + 1
  return Math.max(1, days)
}

async function fetchRequests() {
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit.value),
      sort: sort.value,
      dir: dir.value
    }).toString()

    const { data } = await api.get(`/requests/${USER_ID}?${params}`)
    // Supporte 2 formats: {data, pagination} OU tableau simple (fallback)
    if (Array.isArray(data)) {
      requests.value = data
      totalItems.value = data.length
      totalPages.value = 1
    } else {
      requests.value = data.data
      totalItems.value = data.pagination?.total ?? data.data?.length ?? 0
      totalPages.value = data.pagination?.pages ?? 1
    }
  } catch (err) {
    console.error(err)
    toast('bad', 'Failed to load your requests')
  }
}

onMounted(fetchRequests)
watch([sort, dir, limit], () => { page.value = 1; fetchRequests() })
</script>

<template>
  <div class="grid two">
    <!-- Request form -->
    <section class="card">
      <h3 style="margin-bottom:8px;">New vacation request</h3>
      <p class="helper" style="margin-bottom:14px;">Select dates and reason (optional).</p>

      <label class="label">Start Date</label>
      <input class="input" type="date" v-model="form.start_date" />

      <label class="label" style="margin-top:10px;">End Date</label>
      <input class="input" type="date" v-model="form.end_date" />

      <label class="label" style="margin-top:10px;">Reason</label>
      <textarea class="textarea" v-model="form.reason" placeholder="Family trip, medical, etc."></textarea>

      <div class="row" style="margin-top:14px; gap:8px; flex-wrap:wrap;">
        <button class="btn primary" :disabled="busy" @click="submitRequest">
          {{ busy ? 'Submitting…' : 'Submit Request' }}
        </button>
        <button
          class="btn ghost"
          :disabled="busy"
          @click="form = { start_date: '', end_date: '', reason: '' }"
        >
          Reset
        </button>
      </div>

      <p
        v-if="msg.text"
        :style="{ color: msg.type === 'bad' ? '#ff9b9b' : '#b7ffd8', marginTop: '10px' }"
      >
        {{ msg.text }}
      </p>
    </section>

    <!-- Request list -->
    <section class="card">
      <div class="filters-card">
        <div class="filters-grid">
          <div class="field">
            <label class="label">Sort by</label>
            <div class="row" style="gap:8px">
              <select class="select" v-model="sort" style="flex:1">
                <option value="created_at">Created</option>
                <option value="start_date">Start date</option>
                <option value="end_date">End date</option>
              </select>
              <select class="select" v-model="dir" style="width:120px">
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          <div class="actions field">
            <label class="label">&nbsp;</label>
            <div class="row" style="gap:8px; justify-content:flex-end">
              <button class="btn ghost" @click="fetchRequests">Refresh</button>
              <button class="btn" @click="sort='created_at'; dir='desc'; limit=5; page=1; fetchRequests()">Reset</button>
            </div>
          </div>
        </div>

        <p class="helper" style="margin:8px 0 0">
          Your submitted vacation requests.
        </p>
      </div>

      <div v-if="!requests.length" class="helper">No requests yet.</div>

      <div v-else class="grid" style="grid-template-columns:1fr; gap:10px;">
        <article v-for="r in requests" :key="r.id" class="card" style="padding:12px;border-radius:12px;">
          <div class="row" style="justify-content:space-between; gap:8px; flex-wrap:wrap;">
            <strong>#{{ r.id }}</strong>
            <StatusBadge :status="r.status" />
          </div>

          <div style="margin-top:6px;">
            {{ formatDate(r.start_date) }} → {{ formatDate(r.end_date) }}
            <span class="helper"> • {{ daysFor(r) }} day(s)</span>
          </div>

          <div v-if="r.reason" class="helper" style="margin-top:4px;">Reason: {{ r.reason }}</div>
          <div v-if="r.status === 'Rejected' && r.comments" class="helper" style="margin-top:4px;">
            Reviewer: {{ r.comments }}
          </div>
          <div class="helper" style="margin-top:6px;">
            Created: {{ new Date(r.created_at).toLocaleString() }}
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div class="row" style="justify-content:flex-end; align-items:center; gap:10px; margin-top:12px;" v-if="requests.length">
        <span class="helper">Total: {{ totalItems }}</span>
        <button class="btn ghost" :disabled="page<=1" @click="page--; fetchRequests()">Prev</button>
        <span class="helper">Page {{ page }} / {{ totalPages }}</span>
        <button class="btn ghost" :disabled="page>=totalPages" @click="page++; fetchRequests()">Next</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* --- Filters card (same look as Validator) --- */
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
.actions { text-align: right; }

.select, .input, .textarea {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04);
  color: #e5e7eb;
}
.input { height: 38px; }
.textarea { min-height: 90px; resize: vertical; }

.select:focus, .input:focus, .textarea:focus {
  outline: none;
  border-color: rgba(99, 102, 241, .6);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .18);
}

/* Mobile */
@media (max-width: 860px) {
  .filters-grid { grid-template-columns: 1fr; }
  .actions { text-align: left; }
}
</style>
