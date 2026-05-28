-- Schema for CalcMaster AI Database

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Create operaciones table
CREATE TABLE IF NOT EXISTS operaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'derivada', 'integral', 'grafica'
    funcion VARCHAR(255) NOT NULL,
    resultado VARCHAR(255),
    pasos TEXT, -- detailed resolution steps
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
