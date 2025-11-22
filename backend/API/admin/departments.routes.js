const express = require('express')
const router = express.Router()
const supabase = require('../../supabaseClient')
const { authMiddleware, requireRole } = require('../../middlewares/authMiddleware')

// GET /api/departments
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Department')
      .select('department_id, name');
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch departments', details: error.message || error });
    }
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
})

// POST /api/departments
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing required field', fields: ['name'] });
    }
    // Uniqueness check on name
    const { data: existing, error: existErr } = await supabase
      .from('Department')
      .select('department_id')
      .eq('name', name)
      .limit(1);
    if (existErr) {
      return res.status(500).json({ error: 'Failed checking name uniqueness', details: existErr.message || existErr });
    }
    if (existing && existing.length) {
      return res.status(409).json({ error: 'Department name already exists' });
    }
    const { data: insertRows, error: insertErr } = await supabase
      .from('Department')
      .insert([{ name}])
      .select('department_id, name')
      .limit(1);
    if (insertErr || !insertRows || !insertRows.length) {
      return res.status(500).json({ error: 'Failed creating department', details: insertErr?.message || insertErr });
    }
    return res.status(201).json(insertRows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
})

// PATCH /api/departments/:id
router.patch('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const deptId = req.params.id;
    const { name} = req.body;
    // Fetch existing
    const { data: existingRows, error: findErr } = await supabase
      .from('Department')
      .select('department_id, name')
      .eq('department_id', deptId)
      .limit(1);
    if (findErr) {
      return res.status(500).json({ error: 'Failed fetching department', details: findErr.message || findErr });
    }
    if (!existingRows || !existingRows.length) {
      return res.status(404).json({ error: 'Department not found' });
    }
    const existing = existingRows[0];
    // Name uniqueness check
    if (name && name !== existing.name) {
      const { data: dupRows, error: dupErr } = await supabase
        .from('Department')
        .select('department_id')
        .eq('name', name)
        .limit(1);
      if (dupErr) {
        return res.status(500).json({ error: 'Failed checking name uniqueness', details: dupErr.message || dupErr });
      }
      if (dupRows && dupRows.length) {
        return res.status(409).json({ error: 'Department name already exists' });
      }
    }
    const updateObj = {};
    if (name !== undefined) updateObj.name = name;
    if (description !== undefined) updateObj.description = description;
    if (!Object.keys(updateObj).length) {
      return res.json(existing); // nothing to update
    }
    const { data: updRows, error: updErr } = await supabase
      .from('Department')
      .update(updateObj)
      .eq('department_id', deptId)
      .select('department_id, name')
      .limit(1);
    if (updErr || !updRows || !updRows.length) {
      return res.status(500).json({ error: 'Failed updating department', details: updErr?.message || updErr });
    }
    return res.json(updRows[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
})

// DELETE /api/departments/:id
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const deptId = req.params.id;
    // Attempt delete
    const { error: delErr } = await supabase
      .from('Department')
      .delete()
      .eq('department_id', deptId);
    if (delErr) {
      if (delErr.code === '23503') { // FK violation
        return res.status(409).json({ error: 'Cannot delete department with related records (e.g., doctors)' });
      }
      return res.status(500).json({ error: 'Failed deleting department', details: delErr.message || delErr });
    }
    return res.json({ message: 'Department deleted successfully', id: deptId });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error', details: err.message || err });
  }
})

module.exports = router