---
title: "¡Crea un servidor MCP con un servidor MCP en 15 minutos! La historia detrás de la aplicación 'Hazlo bien y ya'"
description: "La milagrosa creación nacida de la desesperación por la cancelación de una LT. Un relato de la experiencia definitiva de codificación vibrante lograda con Claude Desktop y Claude Code."
pubDate: 2025-08-02
author: "Terisuke"
category: "lab"
tags: ["MCP", "Claude Desktop", "vibe coding", "締切駆動開発", "創造的プロジェクト"]
image:
  url: "/images/blog/スクリーンショット-2025-08-02-21.12.56.avif"
  alt: "YouTube LIVEの企画"
lang: "es"
featured: true
---

# ¡Crea un servidor MCP en un servidor MCP en 15 minutos! La historia detrás de la aplicación "Hazlo bien y ya"

La tarde del último día de julio, mi corazón, que estaba reconfortablemente caliente como en un baño de vapor, se enfrió en un instante. Esta historia comienza en el momento en que se canceló abruptamente el evento LT de la semana 60.
![Captura de pantalla de tuiteo de conmoción por la cancelación del LT](/images/blog/スクリーンショット-2025-08-02-18.25.01.avif)

## Un gran regreso desde la desesperación

Había participado en un evento LT cada semana sin falta. Justo antes de la esperada semana 60, recibí la inesperada notificación de cancelación. Sin embargo, no podía rendirme. Como una revancha del fracaso masivo en YouTube LIVE durante el Año Nuevo, decidí organizar una iniciativa increíble de emergencia.

**"En 2 horas, usando herramientas de IA, haré 'vibe coding' basándome en un tema, desplegaré hasta el final, y en los últimos 30 minutos crearé diapositivas para hacer un LT en YouTube LIVE".**

![Plan de YouTube LIVE](/images/blog/スクリーンショット-2025-08-02-18.52.51.avif)

Al pedir temas en X, llegaron innumerables peticiones descabelladas. Procesamos con éxito dos temas, y quedaban 15 minutos para empezar a crear las diapositivas a las 21:00. En el momento en que giré la ruleta una vez más, apareció el tema del destino.

!["Una aplicación que elige algo al azar en tu escritorio y lo arregla bien cuando le pides 'Arréglalo bien' (irreversible)"](/images/blog/スクリーンショット-2025-08-02-20.15.01.avif)

Mi cerebro se congeló por un instante. ¿Cómo iba a implementar esto en los últimos 15 minutos?

## La técnica prohibida de crear un servidor MCP usando un servidor MCP

En medio de la desesperación, se me ocurrió una idea. En Claude Desktop, había registrado "Claude Code" como mi servidor MCP. Y lo que necesitaba ahora era un servidor MCP. Es decir...

**Simplemente, crearía un servidor MCP usando un servidor MCP.**

Decidí intentar implementar esta estructura anidada. No podía detener YouTube LIVE. Aposté todo o nada, con la audiencia observando.

```javascript
// Parte del código generado
const randomElements = {
  folders: [
    'El jardín secreto',
    'Recuerdos perdidos',
    'Melancolía de lunes',
    'Euforia de viernes',
    'La habitación cerrada',
    'Parece importante de alguna manera'
  ],

  actions: [
    'createRandomFolder',
    'createArtFolder',
    'renameRandomFile',
    'hideSecretFile',
    'createTimeCapule'
  ]
};
```

## El milagro de la aplicación completada en 15 minutos

Claude Code no defraudó. Sin escribir una sola línea de código, solo a través de la interacción, se completó un servidor MCP con las siguientes funciones:

### Siete acciones aleatorias implementadas

1. **Creación de carpetas aleatorias**: Genera carpetas con nombres poéticos como "Melancolía de lunes" o "Euforia de viernes".
2. **Creación de archivos aleatorios**: Genera automáticamente haikus, horóscopos, notas de compra, etc.
3. **Organización de archivos**: Mueve archivos de imagen a la carpeta "Tesoros encontrados".
4. **Renombrado de archivos**: Renombra capturas de pantalla a algo como "Probablemente importante.png".
5. **Galería de escritorio**: Exhibe obras de arte moderno en ASCII art.
6. **Creación de archivos secretos**: Genera un archivo oculto llamado `.secret_treasure.txt`.
7. **Cápsula del tiempo**: Crea un mensaje para ti mismo dentro de un año.

### Ejemplo de contenido generado

```text
// Haiku
Archivos dispersos
en el escritorio
cielo de verano

// Nota de compra
- Leche
- Pan
- Libro de autoayuda para organizar
- Motivación (si está a la venta)
- Tiempo (si también estuviera a la venta)

// Filosofía del escritorio
"Un escritorio perfectamente organizado es
un escritorio que no se utiliza"
- Alguna persona importante (probablemente)
```

## El misterioso incidente de la implementación de la interfaz de usuario HTML

Lo más divertido fue que Claude Code implementó por sí solo una interfaz de usuario HTML. Quizás porque le pedí una "aplicación", se completó una interfaz web impresionante que se movía dinámicamente. Sin embargo, este servidor MCP solo se puede usar a través de Claude Desktop. Al final, la interfaz de usuario no se usó en absoluto, solo existió.

Incluso preguntando a la IA por qué la implementó, no obtuve respuesta.

## Resultado de la implementación práctica

Registré el servidor MCP completado en Claude Desktop y lo ejecuté. Sorprendentemente, funcionó perfectamente a la primera.

### Primera ejecución: Inauguración de la Galería de Escritorio
```
✨ ¡Lo he arreglado bien!

🎨 ¡Hemos inaugurado la "Galería de Escritorio"! También hemos expuesto obras de arte.
```

Una carpeta de galería apareció de repente en mi escritorio. Dentro, se encontraba una obra de arte moderno en ASCII art.

### Segunda ejecución: El destino de las capturas de pantalla
```
✨ ¡Lo he arreglado bien!

🏷️ ¡He renombrado "Captura de pantalla_2024-08-01.png" a "Probablemente importante.png"!
```

Una carpeta con un montón de capturas de pantalla se convirtió en "Probablemente importante.png" en un instante. Quizás fuera importante, o quizás no.

## Aprendizaje técnico

Aunque a primera vista parezca una broma, hubo varios descubrimientos importantes.

### 1. El potencial del MCP (Model Context Protocol)
Los servidores MCP se pueden implementar de forma sorprendentemente sencilla. Para algo como "manipular el escritorio", 15 minutos son suficientes.

### 2. La realización del desarrollo de IA por IA
La estructura anidada de crear un servidor MCP con Claude Code nos dio un vistazo al futuro donde la IA crea IA. Los humanos solo necesitan aportar ideas, y la implementación puede dejarse completamente a la IA.

### 3. El poder del desarrollo impulsado por plazos
La situación extrema de los últimos 15 minutos, por el contrario, hizo explotar la creatividad. Si hubiera tenido tiempo, habría intentado hacer algo "correcto" y probablemente habría resultado aburrido.

### Puntos clave de la implementación

```javascript
class IikanjiServer {
  async handleIikanjini(args) {
    const desktopPath = args.desktopPath || path.join(os.homedir(), 'Desktop');

    // Selecciona una acción aleatoria
    const action = randomElements.actions[
      Math.floor(Math.random() * randomElements.actions.length)
    ];

    // Ejecuta cada acción
    switch (action) {
      case 'createArtFolder':
        result = await this.createArtFolder(desktopPath);
        break;
      // ... otras acciones
    }

    return {
      content: [{
        type: 'text',
        text: `✨ ¡Lo he arreglado bien!\n\n${result}`,
      }],
    };
  }
}
```

Aunque es una estructura simple, con esto se convierte en un servidor MCP legítimo que se puede llamar desde Claude Desktop.

## La creatividad generada por el "vibe coding"

Con esta experiencia, estoy convencido. El "vibe coding", que se crea con el impulso y la energía del momento en lugar de perseguir la exactitud técnica o la perfección, tiene un encanto único.

- **Las restricciones generan creatividad**: La limitación de tiempo de 15 minutos dio lugar a ideas innovadoras.
- **No busques la perfección**: La ambigüedad de "arreglarlo bien" genera diversión.
- **Prioridad a la diversión**: Se prioriza "divertirse creándolo" sobre la utilidad práctica.

## Conclusión: La alegría de crear algo loco

La "aplicación 'Hazlo bien y ya'" es, técnicamente hablando, un servidor MCP extremadamente simple. Sin embargo, su concepto, el proceso de implementación y la imprevisibilidad de los resultados que produce la convierten en una aplicación especial.

Nacida de la desesperación de la cancelación de un evento LT, esta aplicación demostró el potencial del desarrollo impulsado por plazos y un nuevo estilo de desarrollo en la era de la IA. Los servidores MCP se pueden crear con IA. Y crear cosas locas es, después de todo, divertido.

La próxima vez que tu escritorio esté desordenado, ¿por qué no le pides que "lo arregle bien y ya"? Seguramente lo arreglará bien de una manera que nunca podrías haber imaginado.

Sin embargo, ten cuidado si tienes archivos importantes, ya que el resultado es irreversible. Pero eso también es parte de la vida.

---

*Puedes ver cómo fue la transmisión real de YouTube LIVE aquí. Te recomiendo encarecidamente que veas el milagroso proceso de desarrollo a partir de los últimos 15 minutos.*

https://www.youtube.com/live/9gGjM0YrqJE?si=kGLBBCYsQp5F4GPi

*Por cierto, aquí está el servidor MCP de "Hazlo bien y ya" que creé.*

https://github.com/terisuke/iikanjini

*Te animo a que lo pruebes.*