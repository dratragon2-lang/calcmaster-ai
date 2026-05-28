<<<<<<< HEAD
# CalcMaster AI 🧪🔢

CalcMaster AI es una aplicación web moderna y profesional diseñada para resolver cálculos matemáticos complejos, incluyendo **derivadas simbólicas** e **integrales definidas**, mostrando explicaciones paso a paso detalladas, graficando funciones de forma interactiva y permitiendo a los usuarios almacenar su historial de operaciones y exportar reportes en PDF.

---

## Características de la Aplicación

1. **Ingreso y Validación de Funciones:** Valida en tiempo real que las expresiones ingresadas correspondan a funciones reales de variable única ($x$) mediante el compilador de `Math.js`.
2. **Derivación Simbólica:** Implementa un motor recursivo de diferenciación que calcula la derivada analítica término por término (aplicando reglas como la cadena, el producto, el cociente, la potencia generalizada, etc.) y genera un reporte paso a paso detallado de su resolución.
3. **Integración Definida Numérica:** Aplica la regla de Simpson 1/3 para integrar funciones en un intervalo $[a, b]$, mostrando el paso a paso detallado del cálculo numérico (intervalos, coeficientes de peso, sumatoria) y un recálculo de alta precisión.
4. **Gráficos Interactivos:** Visualiza la función o su derivada mediante un gráfico interactivo suave generado con `Chart.js` y `react-chartjs-2`, con capacidades de zoom y lectura de puntos al pasar el cursor.
5. **Historial de Operaciones:** Almacena todos los cálculos en una base de datos PostgreSQL organizada por perfiles de usuario. También cuenta con soporte local (memoria) para usuarios invitados.
6. **Exportación a PDF:** Genera un reporte matemático formal en PDF utilizando `jsPDF` con logotipos, metadatos, resultados destacados y paginación automática para las explicaciones detalladas.

---

## Tecnologías Utilizadas

*   **Frontend:** React (Vite), Tailwind CSS v4, Lucide-React, Math.js, Chart.js, jsPDF.
*   **Backend:** Node.js, Express, PostgreSQL Client (pg), JSON Web Tokens (JWT), BcryptJS.
*   **Base de Datos:** PostgreSQL.

---

## Estructura del Proyecto

```text
calcmaster-ai/
├── backend/                  # Servidor Express API (Arquitectura MVC)
│   ├── src/
│   │   ├── config/           # Conexión DB y Scripts SQL (schema.sql)
│   │   ├── controllers/      # Controladores MVC
│   │   ├── models/           # Modelos de Base de Datos
│   │   ├── routes/           # Enrutamiento de la API
│   │   └── middlewares/      # Verificación de Tokens JWT
│   └── package.json
└── frontend/                 # Cliente React + Tailwind (Vite)
    ├── src/
    │   ├── components/       # Componentes reusables (Gráficos, Navbar)
    │   ├── pages/            # Vistas (Dashboard, Login, Historial, Configuración)
    │   ├── context/          # Estados globales de Autenticación e Historial
    │   └── utils/            # Solucionadores matemáticos y exportación PDF
    └── package.json
```

---

## Instrucciones de Instalación y Ejecución

### 1. Configuración de Base de Datos (PostgreSQL)

1. Crea una base de datos en tu servidor local de PostgreSQL llamada `calcmaster`.
2. El backend está equipado con un script de auto-inicialización que leerá `backend/src/config/schema.sql` y creará automáticamente las tablas `usuarios` y `operaciones` la primera vez que se conecte con éxito.

### 2. Ejecutar el Backend

1. Accede a la carpeta de backend:
   ```bash
   cd backend
   ```
2. Renombra el archivo `.env.example` a `.env` y ajusta las credenciales de tu base de datos:
   ```env
   PORT=5000
   DB_USER=tu_usuario_postgres
   DB_HOST=localhost
   DB_NAME=calcmaster
   DB_PASSWORD=tu_contraseña_postgres
   DB_PORT=5432
   JWT_SECRET=tu_secreto_super_seguro
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *(El servidor correrá en `http://localhost:5000`)*

### 3. Ejecutar el Frontend

1. Accede a la carpeta de frontend:
   ```bash
   cd frontend
   ```
2. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *(El cliente React correrá en `http://localhost:3000`)*

---

## Verificación Matemática Soportada

Prueba ingresar las siguientes fórmulas en la interfaz para verificar el sistema:
*   Polinomios: `x^3 - 5*x^2 + 2*x - 8`
*   Trigonométricas: `sin(x) * cos(x)`
*   Compuestas: `exp(-x^2)` (Campana de Gauss)
*   Integrales definidas racionales: `1 / (x^2 + 1)` en el intervalo `[0, 1]` (cuyo resultado es aproximadamente $\pi/4 \approx 0.785398$).
=======
# calcmaster-ai
Sistema inteligente para el cálculo, análisis y visualización de operaciones matemáticas avanzadas.
>>>>>>> b3839db219bac472f36a0c94adf05297dd71fc94
