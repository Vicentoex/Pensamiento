# ¿Quién es el Impostor? - Vercel Deployment Design

## Objetivo
Transformar el código monolítico de `Artifact.txt` en una aplicación web optimizada y estructurada, lista para su despliegue inmediato en Vercel.

## Arquitectura
Se utilizará una arquitectura **Vanilla Estática**. Al ser una aplicación ligera y sin estado persistente, no es necesario un framework de Javascript (como Next.js o React), lo que garantiza:
- **Tiempos de carga mínimos** (0 JS bloat).
- **Cero tiempo de build**.
- **Despliegue directo e instantáneo** en la red Edge de Vercel.

## Componentes y Estructura de Directorios

La estructura separará las responsabilidades (Estructura, Estilos, Lógica):

```text
/
├── public/
│   ├── index.html     (Estructura DOM, enlaza a CSS y JS)
│   ├── styles.css     (Variables CSS, layouts, tipografía)
│   └── script.js      (Lógica del botón toggle y manejo del DOM)
├── package.json       (Scripts de utilidad para desarrollo local: `serve`)
└── vercel.json        (Configuración de caché, headers de seguridad)
```

## Flujo de Datos
- La aplicación es estática (SSR/CSR no aplican).
- La interactividad se maneja 100% en el cliente mediante Vanilla JS (`script.js`).
- El estado de la vista (respuestas reveladas u ocultas) es un simple estado local en JS que añade o quita clases CSS del DOM.

## Despliegue (Vercel)
- Vercel servirá el contenido estáticamente.
- `vercel.json` se configurará para optimizar las cabeceras de caché (`Cache-Control`) y evitar que los navegadores guarden el HTML permanentemente, pero permitiendo el caché de assets (CSS/JS) si fuese necesario, o simplemente sirviendo la carpeta base correctamente.
