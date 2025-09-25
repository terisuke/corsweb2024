---
title: "【Soporte completo para 5 idiomas】Crónica de una batalla furiosa de 3 horas para expandir un blog que solo era para inglés y japonés a chino, coreano y español"
description: "El impactante hecho de que, aunque pensábamos que era compatible con 5 idiomas, en realidad solo tenía 2. El registro completo de la implementación ultrarrápida del soporte para chino, coreano y español con Claude Code."
pubDate: 2025-09-25
author: "Terisuke"
category: "engineering"
tags: ["多言語化", "i18n", "Astro", "Claude Code", "自動化", "Gemini API"]
image:
  url: "/images/blog/ko-404.avif"
  alt: "韓国語ブログ404ページ"
lang: "es"
featured: true
isDraft: false
---

# [Soporte completo para 5 idiomas] Crónica de una batalla furiosa de 3 horas para expandir un blog de inglés-japonés a chino, coreano y español

"¡Pero si dice que hay soporte para 5 idiomas!"

Fue una tarde de jueves cuando estaba revisando casualmente la implementación de la rama de desarrollo del sitio. Tal como le pedí a Cursor Agent, cinco banderas nacionales aparecían ciertamente en el botón de cambio de idioma. Sin embargo, cuando abrí la página del blog en chino...

![Página del blog en chino con error 404](/images/blog/404.avif)

**404 No encontrado.**

Al investigar, se reveló un hecho impactante.

## Soporte para 2 idiomas con el nombre de soporte para 5 idiomas

```typescript
// En utils/i18n.ts, hay ciertamente traducciones para 5 idiomas...
export type Locale = 'ja' | 'en' | 'zh' | 'ko' | 'es';
```

Según la configuración de i18n, ciertamente hay soporte para 5 idiomas. La página de inicio, la información de la empresa, todo está bien traducido. Sin embargo...

```bash
$ ls src/pages/*/blog/
src/pages/en/blog/:
[...page].astro  [...slug].astro

src/pages/zh/blog/:
ls: src/pages/zh/blog/: No such file or directory

src/pages/ko/blog/:
ls: src/pages/ko/blog/: No such file or directory

src/pages/es/blog/:
ls: src/pages/es/blog/: No this file or directory
```

**Solo el blog admitía inglés y japonés.**

![Mostrando la verificación de la estructura de directorios](/images/blog/keyboardclasher.avif)

## Inicio de implementación rápida con Claude Code

Una vez que se decide, no hay más remedio que implementar los 3 idiomas restantes. Afortunadamente, tenemos Claude Code. Procedimos a implementar de inmediato.

### Paso 1: Duplicar y modificar la página del blog

Primero, copiaremos la página del blog en inglés y la modificaremos para cada idioma.

```bash
# Crea directorios para chino, coreano y español
for lang in zh ko es; do
  mkdir -p src/pages/$lang/blog/
  cp -r src/pages/en/blog/* src/pages/$lang/blog/
done
```

Sin embargo, esto por sí solo no funcionará. Es necesario modificar el filtro de idioma dentro de cada archivo.

```typescript
// Antes de la modificación (común para todos los archivos)
const allPosts = await getCollection('blog', ({ data }) => {
  return data.lang === 'en' && !data.isDraft;
});

// Después de la modificación (ejemplo: versión china)
const allPosts = await getCollection('blog', ({ data }) => {
  return data.lang === 'zh' && !data.isDraft;
});
```

### Paso 2: Crear el script de traducción más potente

Traducir manualmente 8 artículos en japonés no es realista. Por lo tanto, creamos un script de traducción automática utilizando la API de Gemini.

```javascript
// scripts/translate-blog-all-languages.js
const LANGUAGES = {
  en: { name: 'English', author: 'Terisuke' },
  zh: { name: 'Chinese', author: 'Terisuke' },
  ko: { name: 'Korean', author: 'Terisuke' },
  es: { name: 'Spanish', author: 'Terisuke' }
};

async function translateToLanguage(inputFile, targetLang, body, frontmatter) {
  console.log(`📝 Translating to ${LANGUAGES[targetLang].name}...`);

  // Traducir título y descripción
  const titleAndDescription = `Title: ${frontmatter.title}\nDescription: ${frontmatter.description}`;
  const translatedTitleDesc = await translateWithGemini(titleAndDescription, targetLang);

  // Traducir cuerpo
  const translatedBody = await translateWithGemini(body, targetLang);

  // Guardar archivo
  saveTranslatedFile(targetLang, translatedContent);
}
```

https://github.com/Cor-Incorporated/corsweb2024/blob/develop/scripts/translate-blog-all-languages.js

### Paso 3: Batalla mortal contra los errores

Después de ejecutar el script de traducción y verificar con entusiasmo el sitio...

```bash
$ npm run build
✘ [ERROR] Expected "}" but found "."
  script:/ProductsTable.astro:3:33:
    3 │   buttonTexts: {t.buttonTexts},
      ╵                ^
```

**Una tormenta de errores de compilación.**

![Montaña de registros de errores](/images/blog/naniittenda.avif)

## Continuas correcciones de errores

### Problema 1: Código de depuración misterioso en ProductsTable.astro

```javascript
// Código de depuración misterioso que estaba allí por alguna razón
<script>
  console.log('Button text debug:', {
    buttonTexts: {t.buttonTexts},  // ← Esto es un error de sintaxis
    goTo: {t.buttonTexts?.goTo},
    itemName: {item.name}
  });
</script>
```

Resuelto eliminando este código de depuración.

### Problema 2: Falta de soporte lingüístico en CategoryBadge

```typescript
// Antes de la modificación
const categoryLabels = {
  ja: { 'ai': 'AI', 'engineering': 'Ingeniería', ... },
  en: { 'ai': 'AI', 'engineering': 'Engineering', ... },
  // ¡zh, ko, es no existen!
};

// Después de la modificación
const categoryLabels = {
  ja: { ... },
  en: { ... },
  zh: { 'ai': '人工智能', 'engineering': '工程', ... },
  ko: { 'ai': 'AI', 'engineering': '엔지니어링', ... },
  es: { 'ai': 'IA', 'engineering': 'Ingeniería', ... },
};
```

### Problema 3: Los enlaces de PostCard van a inglés en todas partes

```typescript
// Antes de la modificación
const postUrl = currentLocale === 'ja'
  ? `/blog/${cleanSlug}`
  : `/en/blog/${cleanSlug}`;  // ¡Incluso en otros idiomas, se va a /en/!

// Después de la modificación
const postUrl = currentLocale === 'ja'
  ? `/blog/${cleanSlug}`
  : `/${currentLocale}/blog/${cleanSlug}`;
```

### Problema 4: El título sigue en japonés a pesar de estar traducido

Este fue el más problemático. El script de traducción debería haber funcionado correctamente, pero el título y la descripción de frontmatter permanecieron en japonés...

```yaml
# Aunque es un artículo en chino...
---
title: "【爆速15分】MCPサーバーでMCPサーバーを作る！"  # ¡Japonés!
description: "LT中止の絶望から生まれた奇跡..."  # ¡Japonés!
lang: "zh"
---

# 【闪电15分钟】用MCP服务器构建MCP服务器！  # El cuerpo está en chino
```

Después de investigar la causa, se descubrió un error en el procesamiento de análisis del script de traducción. Se implementó una solución creando un script de corrección separado.

```javascript
// scripts/fix-translated-frontmatter.cjs
function extractTitleFromBody(body) {
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.substring(2).trim();  // Extraer del primer encabezado del cuerpo
    }
  }
  return null;
}
```

## Logros de 3 horas furiosas

Aproximadamente 3 horas después del descubrimiento del primer error, finalmente se resolvieron todos los problemas.

### Lista de funciones implementadas

- ✅ Creación de páginas de blog en chino, coreano y español
- ✅ Soporte para 5 idiomas en páginas de categoría
- ✅ Soporte para 5 idiomas en páginas de etiquetas
- ✅ Soporte para 5 idiomas en feeds RSS
- ✅ Soporte para 5 idiomas en páginas de éxito/cancelación de pagos
- ✅ Traducción automática de 8 artículos existentes x 3 idiomas = 24 artículos
- ✅ Resolución de todos los errores de TypeScript
- ✅ Compilación exitosa (317 páginas)

![Blog chino completado](/images/blog/zh.avif)
![Blog coreano completado](/images/blog/ko.avif)
![Blog español completado](/images/blog/es.avif)


### Calidad de la traducción

La traducción de la API de Gemini fue de mayor calidad de lo esperado.

```text
Japonés: 「いい感じにアレしとくアプリ」開発秘話
Chino: "随心所欲处理应用"开发秘辛
Coreano: '적당히 알아서 해주는 앱' 개발 비화
Español: La historia detrás de la aplicación 'Hazlo bien y ya'
```

Se trata de traducciones naturales que capturan adecuadamente los matices de cada idioma.

## Lo que aprendí

### 1. La definición de "soporte" es ambigua

Incluso si se dice "soporte para 5 idiomas", no se sabe realmente hasta qué punto es compatible hasta investigarlo. Es sorprendentemente común que, como en este caso, la página de inicio sea compatible pero el blog no lo sea.

### 2. El poder de la colaboración con Claude Code

El hecho de que la implementación de 5 idiomas x 8 artículos se completara en 3 horas se debe en gran medida a la presencia de Claude Code. Fue especialmente útil en los siguientes aspectos:

- Identificación inmediata de la causa a partir de los mensajes de error
- Aprendizaje de patrones de corrección y aplicación masiva de correcciones similares
- Implementación eficiente de la lógica del script de traducción

### 3. Los scripts de automatización son la justicia

Si hubiera traducido 24 artículos manualmente, probablemente habría tardado una semana. Incluso si se tarda una hora en crear un script de automatización, la recompensa es mucho mayor.

### 4. Los errores son un tesoro

Los errores encontrados esta vez fueron una buena oportunidad para descubrir problemas potenciales en el sistema. En particular, la falta de soporte lingüístico en CategoryBadge habría sido un problema en algún momento.

## Resumen: Hacia un verdadero soporte multilingüe

La impactante verdad de que el sitio que originalmente se creía "con soporte para 5 idiomas" era en realidad un "soporte para 5 idiomas de pacotilla". Sin embargo, con 3 horas de lucha junto a Claude Code, logramos un verdadero soporte para 5 idiomas.

Ahora, tanto en chino, como en coreano o en español, los artículos del blog se muestran correctamente. Ya no aparece el error 404.

Esto es un verdadero soporte multilingüe.

---

*El código implementado está disponible en GitHub. El script de traducción debería ser utilizable en otros proyectos de Astro.*

https://github.com/Cor-Incorporated/corsweb2024

*Las 3 horas luchando junto a Claude Code. Fueron horas intensas pero gratificantes.*