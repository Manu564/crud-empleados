const { createClient } = require('@supabase/supabase-js');
const { requireAuth, setCorsHeaders } = require('../_utils/auth');
const { validateEmployeePayload } = require('../_utils/validation');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  setCorsHeaders(res, ['PUT']);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Extract id from URL: /api/update/123
  const parts = req.url.split('/');
  const id = parts[parts.length - 1];

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const { data: employee, errors } = validateEmployeePayload(req.body);

  if (errors) {
    return res.status(400).json({ error: 'Datos invalidos', details: errors });
  }

  try {
    const { data, error } = await supabase
      .from('empleados')
      .update(employee)
      .eq('id', Number(id))
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase UPDATE error:', error);
      return res.status(500).json({ error: 'Error al actualizar empleado' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    return res.status(200).json({ message: 'Empleado actualizado con éxito', data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
