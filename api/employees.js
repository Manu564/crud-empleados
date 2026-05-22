const { createClient } = require('@supabase/supabase-js');
const { requireAuth, setCorsHeaders } = require('./_utils/auth');
const { validateEmployeePayload } = require('./_utils/validation');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  setCorsHeaders(res, ['GET', 'POST']);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  // GET /api/employees
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase GET error:', error);
        return res.status(500).json({ error: 'Error al obtener empleados' });
      }
      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // POST /api/employees  → create
  if (req.method === 'POST') {
    const { data: employee, errors } = validateEmployeePayload(req.body);

    if (errors) {
      return res.status(400).json({ error: 'Datos invalidos', details: errors });
    }

    try {
      const { data, error } = await supabase
        .from('empleados')
        .insert([employee])
        .select();

      if (error) {
        console.error('Supabase INSERT error:', error);
        return res.status(500).json({ error: 'Error al registrar empleado' });
      }
      return res.status(201).json({ message: 'Empleado registrado con éxito', data: data[0] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
};
