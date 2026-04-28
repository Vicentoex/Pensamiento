---
name: ejecutar-tareas
description: "Use when the user asks to execute, work on, or implement development tasks from the Kanban Dev board — reading tasks from the 'Por hacer' column and implementing them"
---

# Ejecutar Tareas

## Overview

Lee el Kanban Dev del vault de Obsidian, identifica las tareas en la columna "Por hacer", y las implementa en código. Al empezar cada tarea, la mueve a "Haciendo".

**Core principle:** Solo ejecutar lo que el usuario ya decidió poner en "Por hacer". Nunca tocar "Ideas".

**Announce at start:** "Estoy usando el skill ejecutar-tareas para procesar las tareas del Kanban Dev."

## Kanban Dev — Referencia

- **Archivo:** `Startup/Zetta Via/02 - Tasks/Kanban Dev.md`
- **Archivos de tarea:** `Startup/Zetta Via/02 - Tasks/{Nombre Tarea}.md`
- **Columnas:** Ideas → Por hacer → Haciendo → Por revisar → Revisado → Alpha → Realizado

## The Process

### Paso 1: Leer y parsear el kanban

1. Leer el archivo `Startup/Zetta Via/02 - Tasks/Kanban Dev.md`
2. Dividir por secciones `##` — cada heading es una columna
3. Dentro de la sección `## Por hacer`, extraer tareas con el patrón:
   ```
   ^- \[ \] \[\[(.+?)\]\]$
   ```
4. Ignorar entradas donde el texto capturado sea `placeholder`
5. Si no hay tareas en "Por hacer": informar al usuario y detenerse

### Paso 2: Para cada tarea en "Por hacer"

**a) Mover al kanban:** Editar `Kanban Dev.md`:
- Eliminar la línea `- [ ] [[{Nombre}]]` de la sección `## Por hacer`
- Insertar esa misma línea al inicio de la sección `## Haciendo`
- Preservar el bloque `%% kanban:settings ... %%` intacto

**b) Leer la tarea:** Buscar el archivo `Startup/Zetta Via/02 - Tasks/{Nombre}.md`
- Si no existe en la raíz, buscar recursivamente en subcarpetas
- Leer los campos: Descripción, Criterios de aceptación, Relacionado
- Si los criterios no son claros: preguntar al usuario ANTES de implementar

**c) Actualizar status:** En el frontmatter del archivo de la tarea, cambiar `status:` a `en-progreso`

**d) Implementar el código:**
- Seguir exactamente los Criterios de aceptación como guía
- Usar los skills existentes según aplique:
  - **REQUIRED SUB-SKILL:** `superpowers:subagent-driven-development` para features complejas
  - **REQUIRED SUB-SKILL:** `superpowers:test-driven-development` si hay tests implicados
  - **REQUIRED SUB-SKILL:** `superpowers:verification-before-completion` antes de terminar

**e) Commit:** Hacer commit con Conventional Commits (`feat:`, `fix:`, etc.)

**f) Reportar:** Informar al usuario qué se hizo y qué debe revisar

### Paso 3: Flujo de decisión

```
¿Hay tareas en "Por hacer"?
    NO → Informar al usuario, detenerse
    SÍ → Para cada tarea:
             ¿Criterios de aceptación claros?
                 NO → Preguntar al usuario
                 SÍ → Mover a "Haciendo" → Leer → Implementar → Commit
         Dejar en "Haciendo" (el usuario la moverá a "Por revisar")
```

## Reglas Estrictas (Iron Law)

```
NUNCA tocar tareas de "Ideas" — solo el usuario las mueve a "Por hacer"
NUNCA mover tareas a "Por revisar" ni columnas posteriores
NUNCA hacer commit a main/master directamente
SIEMPRE preguntar si los criterios no están claros
SIEMPRE usar verification-before-completion antes de terminar
```

## Mapeo columna → status frontmatter

| Columna kanban | status |
|---|---|
| Ideas | idea |
| Por hacer | pendiente |
| Haciendo | en-progreso |
| Por revisar | en-revision |
| Revisado | revisado |
| Alpha | alpha |
| Realizado | completado |

## When to Stop and Ask

- Los criterios de aceptación son ambiguos
- La tarea tiene dependencias (`## Relacionado`) que no están completadas
- Se produce un error de build o lint no solucionable
- La tarea requiere credenciales o configuración externa que el usuario debe proveer

## Integration

**Pairs with:**
- **superpowers:revisar-tareas** — skill complementario de revisión
- **superpowers:subagent-driven-development** — para implementaciones complejas
- **superpowers:test-driven-development** — si la tarea incluye tests
- **superpowers:verification-before-completion** — antes de dar algo por terminado
- **superpowers:finishing-a-development-branch** — al finalizar todas las tareas del batch
