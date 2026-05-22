import './App.css';
import { useEffect, useState } from 'react';
import Axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';
const API_SECRET_TOKEN = process.env.REACT_APP_API_SECRET_TOKEN || '';
const apiClient = Axios.create({
  baseURL: API_URL,
  headers: API_SECRET_TOKEN
    ? {
        Authorization: `Bearer ${API_SECRET_TOKEN}`,
      }
    : {},
});

function App() {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [pais, setPais] = useState('');
  const [cargo, setCargo] = useState('');
  const [experiencia, setexperiencia] = useState('');
  const [empleados, setEmpleados] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchEmpleados = () => {
    setFetching(true);
    apiClient.get('/api/employees')
      .then((response) => setEmpleados(response.data))
      .catch((error) => {
        console.error(error);
        showMessage('Error al cargar empleados.', 'error');
      })
      .finally(() => setFetching(false));
  };

  useEffect(() => {
    fetchEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3500);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = 'Nombre es obligatorio.';
    if (!edad || Number(edad) <= 0) newErrors.edad = 'Edad debe ser mayor a 0.';
    if (!pais.trim()) newErrors.pais = 'País es obligatorio.';
    if (!cargo.trim()) newErrors.cargo = 'Cargo es obligatorio.';
    if (experiencia === '' || Number(experiencia) < 0) newErrors.experiencia = 'Años debe ser 0 o más.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNombre('');
    setEdad('');
    setPais('');
    setCargo('');
    setexperiencia('');
    setEditingId(null);
    setErrors({});
  };

  const submitEmpleado = () => {
    if (!validateForm()) return;
    setLoading(true);

    const payload = { nombre, edad: Number(edad), pais, cargo, experiencia: Number(experiencia) };
    const request = editingId
      ? apiClient.put(`/api/update/${editingId}`, payload)
      : apiClient.post('/api/create', payload);

    request
      .then(() => {
        resetForm();
        fetchEmpleados();
        showMessage(editingId ? 'Empleado actualizado con éxito.' : 'Empleado registrado con éxito.', 'success');
      })
      .catch((error) => {
        console.error(error);
        showMessage('Error al guardar el empleado.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const editEmpleado = (empleado) => {
    setNombre(empleado.nombre);
    setEdad(empleado.edad.toString());
    setPais(empleado.pais);
    setCargo(empleado.cargo);
    setexperiencia(empleado.experiencia.toString());
    setEditingId(empleado.id);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEmpleado = (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) return;
    setLoading(true);
    apiClient.delete(`/api/delete/${id}`)
      .then(() => {
        fetchEmpleados();
        showMessage('Empleado eliminado con éxito.', 'success');
      })
      .catch((error) => {
        console.error(error);
        showMessage('Error al eliminar empleado.', 'error');
      })
      .finally(() => setLoading(false));
  };

  const isFormValid = nombre && edad && pais && cargo && experiencia !== '' && Number(edad) > 0 && Number(experiencia) >= 0;

  return (
    <div className="App">
      <h1>Gestión de empleados</h1>

      <div className="content-grid">
        <section className={`panel panel-form ${editingId ? 'editing-mode' : ''}`}>
          <div className="panel-header">
            <div className="header-title-container">
              <h2>{editingId ? 'Editar empleado' : 'Nuevo empleado'}</h2>
              {editingId && <span className="badge">Modo: Editando</span>}
            </div>
            <p>Completa el formulario para {editingId ? 'actualizar' : 'registrar'} un empleado.</p>
          </div>

          {message && <div className={`message ${messageType}`}>{message}</div>}

          <form
            className="formulario"
            onSubmit={(e) => {
              e.preventDefault();
              submitEmpleado();
            }}
          >
            <div className="field">
              <label>Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                type="text"
                placeholder="Ej. Manuel De Jesús"
              />
              {errors.nombre && <small className="error-text">{errors.nombre}</small>}
            </div>
            <div className="field">
              <label>Edad</label>
              <input
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                type="number"
                min="1"
                placeholder="Ej. 30"
              />
              {errors.edad && <small className="error-text">{errors.edad}</small>}
            </div>
            <div className="field">
              <label>País</label>
              <input
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                type="text"
                placeholder="Ej. Colombia"
              />
              {errors.pais && <small className="error-text">{errors.pais}</small>}
            </div>
            <div className="field">
              <label>Cargo</label>
              <input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                type="text"
                placeholder="Ej. Diseñador"
              />
              {errors.cargo && <small className="error-text">{errors.cargo}</small>}
            </div>
            <div className="field">
              <label>Años de experiencia</label>
              <input
                value={experiencia}
                onChange={(e) => setexperiencia(e.target.value)}
                type="number"
                min="0"
                placeholder="Ej. 4"
              />
              {errors.experiencia && <small className="error-text">{errors.experiencia}</small>}
            </div>

            <div className="actions">
              <button type="submit" disabled={!isFormValid || loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Registrar'}
              </button>
              <button type="button" className="secondary" onClick={resetForm} disabled={loading}>
                {editingId ? 'Cancelar edición' : 'Limpiar'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel panel-table">
          <div className="panel-header">
            <h2>Lista de empleados</h2>
            <p>Haz clic en editar para cambiar datos o elimínalos cuando ya no sean necesarios.</p>
          </div>

          <div className="tabla">
            {fetching ? (
              <div className="loading-state">Cargando empleados...</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Edad</th>
                    <th>País</th>
                    <th>Cargo</th>
                    <th>Experiencia</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">No hay empleados registrados.</td>
                    </tr>
                  ) : (
                    empleados.map((empleado, index) => (
                      <tr key={empleado.id} className={editingId === empleado.id ? 'row-editing' : ''}>
                        <td>{index + 1}</td>
                        <td>{empleado.nombre}</td>
                        <td>{empleado.edad}</td>
                        <td>{empleado.pais}</td>
                        <td>{empleado.cargo}</td>
                        <td>{empleado.experiencia} {empleado.experiencia === 1 ? 'año' : 'años'}</td>
                        <td className="cell-actions">
                          <button className="edit" onClick={() => editEmpleado(empleado)}>
                            ✏️ Editar
                          </button>
                          <button className="delete" onClick={() => deleteEmpleado(empleado.id)}>
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
