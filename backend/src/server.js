import express from 'express'
import Knex from 'knex'
import knexfile from '../knexfile.js'
import 'dotenv/config'

const db = Knex(knexfile.development)
const app = express()

// ✅ GESTION CORS COMPLÈTE ET UNIVERSELLE
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')

  // ⚡ Répond immédiatement aux prévols (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }

  next()
})

app.use(express.json())

app.get('/health', (req, res) => res.json({ ok: true }))

// ====================
//   VACATION ROUTES
// ====================

// 1️⃣ GET /api/requests → all requests (Validator)
// GET /api/requests?status=&page=1&limit=10&sort=start_date|end_date|created_at&dir=asc|desc
app.get('/api/requests', async (req, res) => {
  try {
    const { status } = req.query
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100)
    const offset = (page - 1) * limit

    const sort = ['start_date','end_date','created_at'].includes(req.query.sort) ? req.query.sort : 'created_at'
    const dir  = (req.query.dir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'

    // base query
    let base = db('vacation_requests')
      .join('users', 'vacation_requests.user_id', '=', 'users.id')
      .modify(q => { if (status) q.where('vacation_requests.status', status) })

    // total count
    const [{ count }] = await base.clone().count('* as count')

    // page data + computed days
    const data = await base
      .clone()
      .select(
        'vacation_requests.*',
        'users.name as user_name',
        'users.role as user_role',
        db.raw('(vacation_requests.end_date - vacation_requests.start_date + 1) as days')
      )
      .orderBy(`vacation_requests.${sort}`, dir)
      .limit(limit)
      .offset(offset)

    res.json({
      data,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.max(Math.ceil(Number(count) / limit), 1)
      },
      sorting: { sort, dir },
      filter: { status: status || null }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
})


// 2️⃣ GET /api/requests/:userId → requests by user
// GET /api/requests/:userId?page=1&limit=10&sort=start_date|end_date|created_at&dir=asc|desc
app.get('/api/requests/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const page  = Math.max(parseInt(req.query.page || '1', 10), 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100)
    const offset = (page - 1) * limit

    const sort = ['start_date','end_date','created_at'].includes(req.query.sort) ? req.query.sort : 'created_at'
    const dir  = (req.query.dir || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc'

    const base = db('vacation_requests').where({ user_id: userId })

    const [{ count }] = await base.clone().count('* as count')

    const data = await base
      .clone()
      .select(
        '*',
        db.raw('(end_date - start_date + 1) as days')
      )
      .orderBy(sort, dir)
      .limit(limit)
      .offset(offset)

    res.json({
      data,
      pagination: {
        total: Number(count),
        page,
        limit,
        pages: Math.max(Math.ceil(Number(count) / limit), 1)
      },
      sorting: { sort, dir }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch user requests' })
  }
})


// 3️⃣ POST /api/requests → create new request
app.post('/api/requests', async (req, res) => {
  try {
    const { user_id, start_date, end_date, reason } = req.body
    if (!user_id || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const [id] = await db('vacation_requests').insert({
      user_id,
      start_date,
      end_date,
      reason,
      status: 'Pending'
    }).returning('id')

    res.json({ id, message: 'Request created' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create request' })
  }
})

// 4️⃣ PATCH /api/requests/:id → approve or reject
app.patch('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, comments } = req.body

    await db('vacation_requests')
      .where({ id })
      .update({ status, comments })

    res.json({ message: 'Request updated' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update request' })
  }
})

// ====================
//   START SERVER
// ====================

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`✅ API running at http://localhost:${port}`)
})
