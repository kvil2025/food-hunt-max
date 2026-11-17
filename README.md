# 🐜 FOOD HUNT MAX 🍬

Un videojuego 3D arcade / hypercasual creado con **Vite + React + Three.js + Web Audio API**, inspirado en el clásico de colonias de hormigas obreras recolectoras de cubos de azúcar y comida.

![Food Hunt Max](https://img.shields.io/badge/Food%20Hunt-MAX-f59e0b?style=for-the-badge&logo=target)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=for-the-badge&logo=three.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=for-the-badge&logo=tailwind-css)

---

## 🎮 Mecánicas de Juego

1. **La Hormiga Obrera:** Controlas a una simpática hormiguita amarilla 3D con grandes ojos expresivos y antenas animadas.
2. **Caza de Alimentos:** Recorre el suelo de madera y acércate a los montículos de cubos de azúcar de colores (Cian, Verde, Naranja, Púrpura, Rojo y Cubos Dorados especiales).
3. **Mochila y Físicas de Bamboleo (Stack Wobble):** A medida que recolectas cubos, se apilan verticalmente sobre tu espalda y se balancean dinámicamente con la inercia del movimiento.
4. **Entrega en el Agujero del Nido:** Lleva los cubos al agujero oscuro en el suelo. Los bloques son absorbidos con una parábola 3D y succión de vórtice mientras ganas monedas.
5. **Estación de Mejoras:**
   * ⚡ **Velocidad:** Corre más rápido.
   * 🎒 **Capacidad de Mochila:** Apila torres de cubos más altas.
   * 🐜 **Hormigas Obreras:** Invoca hormiguitas azules autónomas que recolectan solas.
   * 💎 **Dulzura de Azúcar:** Multiplicador de monedas por bloque.
   * 🧲 **Imán de Comida:** Mayor rango de atracción.

---

## 🕹️ Controles

* **Teclado:** `W, A, S, D` o `Flechas Direccionales`.
* **Móvil / Touch:** Joystick virtual en pantalla con respuesta elástica.
* **Audio:** Efectos de sonido procedurales y música sintetizada con la **Web Audio API** (sin librerías pesadas).

---

## 🚀 Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone <URL_REPOSITORIO>
cd food-hunt-max

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```
