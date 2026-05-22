function parseRequiredString(value, fieldName, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors[fieldName] = `${fieldName} es obligatorio`;
    return '';
  }

  return value.trim();
}

function parseInteger(value, fieldName, errors, { min }) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min) {
    errors[fieldName] = `${fieldName} debe ser un numero entero mayor o igual a ${min}`;
    return null;
  }

  return number;
}

function validateEmployeePayload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return {
      data: null,
      errors: {
        body: 'El cuerpo de la solicitud debe ser un objeto JSON',
      },
    };
  }

  const errors = {};
  const nombre = parseRequiredString(body.nombre, 'nombre', errors);
  const pais = parseRequiredString(body.pais, 'pais', errors);
  const cargo = parseRequiredString(body.cargo, 'cargo', errors);
  const edad = parseInteger(body.edad, 'edad', errors, { min: 1 });
  const experiencia = parseInteger(body.experiencia, 'experiencia', errors, { min: 0 });

  if (Object.keys(errors).length > 0) {
    return {
      data: null,
      errors,
    };
  }

  return {
    data: {
      nombre,
      edad,
      pais,
      cargo,
      experiencia,
    },
    errors: null,
  };
}

module.exports = {
  validateEmployeePayload,
};
