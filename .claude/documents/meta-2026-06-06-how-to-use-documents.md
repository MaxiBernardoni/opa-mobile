# Meta — Cómo usar los documentos de .claude/documents/

Este documento explica el sistema de documentación del proyecto OPA para que cualquier instancia de Claude Code pueda leer, interpretar, actualizar y crear documentos correctamente.

---

## Propósito de esta carpeta

`.claude/documents/` contiene documentación técnica del estado actual del proyecto. Está pensada para ser leída por Claude Code al comenzar una sesión o tarea, de modo que pueda entender qué se construyó, qué decisiones se tomaron y qué falta hacer — sin necesidad de explorar todo el código desde cero.

---

## Formato del nombre de archivo

Todos los documentos siguen este formato:

```
{content}-{date}-{title}.md
```

| Parte | Descripción | Ejemplo |
|---|---|---|
| `{content}` | Categoría del documento (ver categorías abajo) | `database` |
| `{date}` | Fecha de creación en formato `YYYY-MM-DD` | `2026-06-06` |
| `{title}` | Título descriptivo en kebab-case | `schema-and-seed` |

**Ejemplo completo:** `database-2026-06-06-schema-and-seed.md`

### Categorías válidas

| Categoría | Contenido |
|---|---|
| `database` | Schema de tablas, migraciones, seed data, storage, auth |
| `backend` | Integración con Supabase, hooks, stores, tipos, Edge Functions |
| `frontend` | Pantallas, componentes, rutas, animaciones, config técnica |
| `design` | Sistema visual: colores, tipografía, espaciado, componentes de UI |
| `meta` | Documentación sobre el sistema de documentación en sí |

Si una nueva categoría es necesaria, debe ser de una sola palabra en minúsculas y en español o inglés según encaje mejor con el proyecto.

---

## Cómo leer los documentos

1. **Empezar por este archivo (`meta-`)** para entender el sistema.
2. Leer los documentos relevantes a la tarea actual. No es necesario leerlos todos.
3. Dentro de cada documento, la estructura es:
   - **Resumen del área** al inicio
   - **Estado actual** con detalles técnicos
   - **Pendientes** al final (lista de tareas no implementadas)

El campo `Pendientes` al final de cada documento es especialmente importante: indica qué no está hecho todavía y qué no debe asumirse como implementado.

---

## Cómo crear un documento nuevo

Crear un documento nuevo cuando:
- Se implementa algo significativo que no está cubierto por ningún documento existente
- Se agrega una nueva categoría de funcionalidad
- El documento existente de esa categoría se volvió demasiado largo para ser útil

### Pasos

1. Determinar la categoría correcta (ver tabla de categorías arriba)
2. Usar la fecha del día en formato `YYYY-MM-DD`
3. Elegir un título descriptivo en kebab-case
4. Crear el archivo en `.claude/documents/` con el nombre correcto
5. Seguir el formato de sección que se describe abajo
6. Commitear y pushear junto con los cambios de código relacionados

---

## Cuándo actualizar un documento existente vs. crear uno nuevo

| Situación | Acción |
|---|---|
| Se agregó o cambió algo dentro del área que ya cubre el documento | **Editar el documento existente** — actualizar las secciones afectadas y los Pendientes |
| El área creció tanto que el documento es difícil de navegar | **Crear un documento nuevo** con fecha actualizada y archivar el viejo (agregar nota al inicio del viejo indicando que fue reemplazado) |
| Se implementa un área completamente nueva | **Crear un documento nuevo** con la categoría que corresponda |
| Un Pendiente fue completado | **Editar el documento existente** — mover el ítem de Pendientes a la sección correspondiente |

**Regla general:** editar > crear. Solo crear uno nuevo si el alcance es claramente distinto o el documento existente ya no es manejable.

---

## Formato interno de cada documento

Todos los documentos deben seguir esta estructura base:

```markdown
# {Categoría} — {Título descriptivo}

Párrafo corto explicando qué cubre este documento.

---

## {Sección 1}

Contenido...

---

## {Sección N}

Contenido...

---

## Pendientes

- [ ] Ítem no implementado
- [ ] Otro ítem pendiente
```

### Reglas de formato

- Usar tablas para comparar opciones o listar campos con múltiples atributos
- Usar bloques de código (` ``` `) para SQL, TypeScript, rutas de archivo y comandos
- Los títulos de sección deben ser descriptivos, no genéricos ("Tablas", no "Datos")
- El apartado `Pendientes` es **obligatorio** y siempre va al final
- No incluir decisiones sin justificación: si algo se hizo de una forma específica por una razón técnica, explicarlo brevemente

---

## Cómo resolver conflictos entre documentos

Si dos documentos contienen información contradictoria sobre el mismo tema:

1. **El documento con fecha más reciente tiene precedencia** sobre el más antiguo
2. Actualizar el documento más antiguo para que sea consistente con el nuevo
3. Si la contradicción es intencional (cambio de decisión técnica), agregar una nota en el documento viejo:
   ```
   > ⚠️ Esta sección fue reemplazada. Ver `{nuevo-documento}.md` para el estado actual.
   ```

---

## Qué NO incluir en los documentos

- Código completo de archivos enteros (solo snippets relevantes)
- Decisiones pendientes de aprobación del usuario (eso va en la conversación)
- TODOs vagos sin contexto ("mejorar performance")
- Información que ya está en el código y es obvia por los nombres

---

## Documentos actuales

| Archivo | Cubre |
|---|---|
| `database-2026-06-06-schema-and-seed.md` | Schema de tablas, seed data, storage buckets, auth trigger |
| `backend-2026-06-06-supabase-integration.md` | Cliente Supabase, auth flow, hooks de datos, tipos TypeScript |
| `frontend-2026-06-06-screens-and-components.md` | Pantallas, componentes, design tokens, config técnica |
| `design-2026-06-06-visual-system.md` | Paleta, tipografía, tarjetas, recursos en Storage, principios |
| `meta-2026-06-06-how-to-use-documents.md` | Este archivo |
