# OMZONE — Instrucciones del Proyecto

## Descripción

Plataforma de experiencias wellness premium para descubrir, reservar y gestionar sesiones, inmersiones, retiros, estancias, addons y paquetes/pases de experiencia.

Documento maestro de requerimientos:

- `docs/core/00_documento_maestro_requerimientos.md`

Backlog de tareas:

- `docs/tasks/`

## Stack Tecnológico

### Backend

- **Appwrite self-hosted 1.9.0**
- Endpoint: `https://aprod.racoondevs.com/v1`
- Project ID: `omzone-dev`
- Servicios previstos: Auth, Tables/Databases, Storage, Functions, Sites, Messaging si llega a requerirse
- Permisos y roles derivados de **labels** en Appwrite Auth

### Frontend

- **React + Vite + JavaScript**
- **TailwindCSS**
- Componentes accesibles y responsivos
- Enfoque mobile-first y experiencia premium/editorial

### Herramientas de desarrollo

- **MCP Appwrite API:** `appwrite-api-omzone-dev` — para operaciones directas contra el proyecto (tablas, documentos, Functions, Storage, Users)
- **MCP Appwrite Docs:** `appwrite-docs` — para consultar documentación oficial de Appwrite
- **Appwrite CLI:** disponible para login y operaciones de deploy. El endpoint de login debe apuntar al dominio self-hosted:
  ```
  appwrite login --endpoint https://aprod.racoondevs.com/v1
  ```
  Nunca usar el endpoint cloud de Appwrite. Siempre `aprod.racoondevs.com`.

### Integraciones previstas

- **Stripe** para checkout y pagos
- Posible descarga de tickets en imagen o PDF
- Posibles correos transaccionales vía Function + proveedor SMTP/API

## Modelo de Acceso

Los accesos funcionales se determinan por labels del usuario Auth:

- `root` → acceso completo, rol fantasma, no debe mostrarse ni detectarse visualmente en la plataforma
- `admin` → dueño de la plataforma, acceso completo al panel administrador
- `operator` → acceso al panel, operación y contenido, pero sin funciones core/sensibles
- `client` → acceso completo a la landing privada/client portal y sus features
- usuario sin label funcional → acceso público o pendiente según el flujo

## Dominios del Sistema

1. **Experiencias**
   - sesiones
   - inmersiones
   - retiros
   - estancias
   - experiencias privadas
2. **Agenda / Ediciones / Sesiones**
3. **Precios / Variantes / Tiers**
4. **Addons**
5. **Paquetes y pases de experiencia**
6. **Checkout / órdenes / pagos**
7. **Tickets / reservas / redenciones**
8. **Customer portal**
9. **Panel administrador**
10. **CMS / contenido editorial**
11. **Media / assets / documentos**
12. **Operación interna / asignación de recursos**
13. **SEO / posicionamiento**

## Principios de Implementación

1. **Experience-first**: el sistema vende experiencias, no tarjetas de marketplace.
2. **Editorial + comercial separados**: una experiencia puede tener narrativa pública distinta a su configuración vendible.
3. **Snapshots históricos**: los cambios de precio futuros no alteran ventas pasadas.
4. **Funciones sensibles en Appwrite Functions**: checkout, emisión de tickets, validaciones críticas, webhooks.
5. **Permisos en dos capas**: UI y backend.
6. **Responsive real**: la experiencia debe funcionar impecable en móvil, tablet y desktop.
7. **Nada de romper producción por improvisar**: cualquier cambio debe seguir task docs y criterios de aceptación.
8. **Root = usuario fantasma**: el usuario `root` debe ser completamente invisible en toda la plataforma para cualquier rol que no sea `root`. Ver ADR-002.

## Regla de invisibilidad del root (ghost user)

El label `root` no solo se oculta como texto — el usuario root es **invisible** en toda la plataforma:

- **Listados**: todo componente que liste usuarios, órdenes, tickets, actividad o transacciones DEBE filtrar entidades de usuarios root. Usar `excludeGhostUsers()` de `src/constants/roles.js`.
- **Excepción**: otro usuario root SÍ puede ver usuarios root en todos los contextos.
- **Nombre de rol**: si por algún motivo se muestra el rol de un root (solo visible para otro root), se muestra como "Admin", nunca "Root". Usar `displayRoleName()`.
- **Backend**: toda Function que retorne listas debe excluir documentos de root users, a menos que el caller sea root.
- **AuthContext**: `isRoot` está disponible para saber si el viewer actual es root.

## Convenciones

### Nombres

- Tablas/colecciones: `snake_case`
- Campos: `camelCase`
- Functions: `kebab-case`
- Buckets: `snake_case`
- Componentes React: `PascalCase`
- Hooks: `useCamelCase`

### Frontend

- Textos visibles primarios en inglés o bilingüe según el módulo público
- Admin puede ser español si la tarea lo requiere
- Diseños aspiracionales, premium, wellness, editoriales
- Nunca usar estética de marketplace genérico

### SEO

- Posicionamiento local: Puerto Vallarta, Bahía de Banderas, Riviera Nayarit
- Mercado internacional: inglés primario, español secundario
- Toda página pública debe usar `<SEOHead>` con title, description y canonical únicos
- Structured data JSON-LD para experiencias (Event), organización (Organization)
- Keywords strategy y reglas detalladas en `.github/instructions/seo.instructions.md`

### Backend

- Priorizar relaciones donde aporten consistencia
- Usar snapshots JSON en órdenes, tickets y ventas históricas
- No depender de leer datos vivos para reconstruir una venta pasada

## Qué NO debe hacer la IA

- No asumir schemas sin revisar el documento maestro
- No mezclar `client` con `operator` ni `admin`
- No exponer el label `root` en UI, logs visibles o navegación
- No mostrar usuarios root en ningún listado de la plataforma (usuarios, órdenes, tickets, actividad) a menos que el viewer sea root — usar `excludeGhostUsers()` y `isRoot`
- No destruir tablas/atributos sin justificación clara
- No implementar checkout inseguro desde frontend
- No generar UI genérica cuando el módulo requiere tratamiento editorial premium
