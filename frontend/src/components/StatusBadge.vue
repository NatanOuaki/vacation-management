<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const cls = computed(() => {
  const s = (props.status || '').toLowerCase()
  return [
    'badge',
    s === 'pending' ? 'pending' : s === 'approved' ? 'approved' : 'rejected'
  ]
})
</script>

<template>
  <span :class="cls">{{ props.status }}</span>
</template>

<style scoped>
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.badge.approved {
  background-color: #dcfce7;
  color: #166534;
}

.badge.rejected {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
