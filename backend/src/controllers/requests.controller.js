import { db } from '../db/knex.js';
import { createRequestSchema, updateStatusSchema } from '../validators/request.validators.js';

export const createRequest = async (req, res, next) => {
  try {
    const { error, value } = createRequestSchema.validate(req.body, { abortEarly: false });
    if (error) { error.isJoi = true; throw error; }

    const user = await db('users').where({ id: value.user_id }).first();
    if (!user || user.role !== 'requester') {
      return res.status(400).json({ error: 'Invalid requester user_id' });
    }

    const [created] = await db('vacation_requests')
      .insert({
        user_id: value.user_id,
        start_date: value.start_date,
        end_date: value.end_date,
        reason: value.reason || null,
        status: 'Pending'
      })
      .returning('*');

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const getUserRequests = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const list = await db('vacation_requests')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const getAllRequests = async (req, res, next) => {
  try {
    const { status } = req.query; // Optional: Pending|Approved|Rejected
    let q = db('vacation_requests as vr')
      .join('users as u', 'u.id', 'vr.user_id')
      .select(
        'vr.*',
        'u.name as user_name',
        'u.role as user_role'
      )
      .orderBy('vr.created_at', 'desc');

    if (status) q = q.where('vr.status', status);
    const list = await q;
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { error, value } = updateStatusSchema.validate(req.body, { abortEarly: false });
    if (error) { error.isJoi = true; throw error; }

    const { id } = req.params;

    const existing = await db('vacation_requests').where({ id }).first();
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    const [updated] = await db('vacation_requests')
      .where({ id })
      .update({
        status: value.status,
        comments: value.status === 'Rejected' ? (value.comments || '') : null
      })
      .returning('*');

    res.json(updated);
  } catch (err) {
    next(err);
  }
};
