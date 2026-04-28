---
name: revisar-tareas
description: "Use when the user asks to review, verify, or audit completed development tasks from the Kanban Dev board — reading tasks from the 'Por revisar' column and checking the implementation"
---

# Revisar Tareas

## Overview

Lee el Kanban Dev del vault de Obsidian, identifica las tareas en "Por revisar", verifica que la implementación cumple los criterios de aceptación, ejecuta build y lint, y genera un reporte detallado por tarea.

**Core principle:** Revisión exhaustiva con evidencia concreta para cada criterio de aceptación. No mover tareas — eso lo decide el usuario.

**Announce at start:** "Estoy usando el skill revisar-tareas para revisar las tareas del Kanban Dev."

## Kanban Dev — Referencia

- **Archivo:** `Startup/Zetta Via/02 - Tasks/Kanban Dev.md`
- **Archivos de tarea:** `Startup/Zetta Via/02 - Tasks/{Nombre Tarea}.md`

## The Process

### Paso 1: Leer y parsear el kanban

1. Leer el archivo `Startup/Zetta Via/02 - Tasks/Kanban Dev.md`
2. Extraer tareas de la sección `## Por revisar` con el patrón:
   ```
   ^- \[ \] \[\[(.+?)\]\]$
   ```
3. Ignorar entradas `placeholder`
4. Si no hay tareas en "Por revisar": informar al usuario y detenerse

### Paso 2: Para cada tarea en "Por revisar"

**a) Leer la tarea:** Obtener Criterios de aceptación del archivo `.md`

**b) Identificar cambios:** Ejecutar `git log --oneline -10` y `git diff HEAD~N --name-only` para encontrar archivos modificados en la implementación

**c) Verificar cada criterio de aceptación:**
- Buscar el código/archivo que implementa ese criterio
- Determinar: ✅ Cumplido / ❌ No cumplido / ⚠️ Parcial
- Incluir evidencia (ruta de archivo, función, línea)

**d) Verificaciones técnicas:**
```bash
npm run build    # ¿Compila sin errores?
npm run lint     # ¿Errores de estilo o tipos?
```
- Si existen tests relevantes: ejecutar `npm run test:e2e` o tests específicos

**e) Revisión de código:**
- Buscar problemas de seguridad (inyecciones, secrets hardcodeados, RLS desactivado)
- Verificar que se usan `createServerClient` en Server Components y `createBrowserClient` en Client Components
- Comprobar que TypeScript strict está respetado (sin `any`)
- Revisar que las migraciones SQL están en `supabase/migrations/`

**f) Generar reporte** (ver formato abajo)

### Paso 3: Presentar reporte consolidado al usuario

## Formato de Reporte

```markdown
## Revisión: [Nombre Tarea]

### Criterios de aceptación
- ✅ [Criterio 1] — evidencia: `src/app/.../route.ts:42`
- ❌ [Criterio 2] — no implementado / motivo
- ⚠️ [Criterio 3] — parcial: falta X

### Build & Lint
- **Build:** ✅ OK / ❌ FAIL — [detalles del error]
- **Lint:** ✅ 0 errores / ❌ N errores — [listado]

### Código revisado
- Archivos modificados: [lista]
- Issues encontrados: [lista]
- Sugerencias: [lista]

### Veredicto: ✅ APROBADO / 🔄 REQUIERE CAMBIOS
[Resumen en 1-2 frases]
```

## Reglas Estrictas (Iron Law)

```
NUNCA mover tareas del kanban — el usuario decide qué pasa a "Revisado" o vuelve a "Haciendo"
NUNCA marcar como aprobado sin verificar CADA criterio de aceptación con evidencia
SIEMPRE ejecutar build antes de dar veredicto
Si un criterio requiere verificación manual que Claude no puede hacer, indicarlo explícitamente
```

## When to Stop and Ask

- La tarea no tiene criterios de aceptación definidos
- No se encuentran commits asociados a la tarea
- El build falla con errores que sugieren implementación incompleta

## Integration

**Pairs with:**
- **superpowers:ejecutar-tareas** — skill que implementa las tareas que este skill revisa
- **superpowers:requesting-code-review** — para reviews más profundas
- **superpowers:verification-before-completion** — proceso de verificación detallado
- **superpowers:systematic-debugging** — si se encuentran bugs durante la revisión
