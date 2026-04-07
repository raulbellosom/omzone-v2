---
description: "Usar cuando se creen o modifiquen componentes React de OMZONE: estructura, naming, hooks, estados, superficies, estilo visual y patrones comunes."
applyTo: "src/**/*.jsx,src/**/*.js"
---

# Convenciones de Componentes React — OMZONE

## 1. Stack y entorno

| Clave | Valor |
|---|---|
| Framework | React + Vite |
| Lenguaje | JavaScript (no TypeScript) |
| CSS | TailwindCSS |
| Enfoque | Mobile-first |
| Estado global | Context API (o Zustand si escala) |
| Routing | React Router |
| HTTP | Appwrite SDK para JS |

---

## 2. Naming obligatorio

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | `PascalCase` | `ExperienceCard`, `CheckoutSummary` |
| Archivos de componente | `PascalCase.jsx` | `ExperienceCard.jsx` |
| Hooks | `useCamelCase` | `useExperiences`, `useAuth`, `useCheckout` |
| Archivos de hook | `useCamelCase.js` | `useExperiences.js` |
| Constantes | `UPPER_SNAKE_CASE` | `API_ENDPOINT`, `MAX_ADDONS` |
| Utils/helpers | `camelCase` | `formatPrice`, `buildSlotLabel` |
| Contextos | `PascalCase` + Context | `AuthContext`, `CartContext` |
| Páginas | `PascalCase` + Page | `ExperienceDetailPage`, `AdminDashboardPage` |

---

## 3. Estructura de carpetas

```
src/
  components/
    common/             # Componentes reutilizables (Button, Modal, Card, Input)
    public/             # Componentes del sitio público
      experiences/      # Cards, detalle, galería, agenda
      checkout/         # Formulario, resumen, confirmación
      layout/           # Navbar, Footer, Hero
    admin/              # Componentes del panel admin
      experiences/      # CRUD, tablas, formularios
      orders/           # Listado, detalle, reembolso
      slots/            # Gestión de agenda
      operators/        # Invitación, listado
      settings/         # Configuración de negocio
      layout/           # Sidebar, TopBar, AdminShell
    portal/             # Componentes del portal de cliente
      orders/           # Historial, detalle
      tickets/          # Mis tickets, descarga
      passes/           # Pases activos, saldo
      profile/          # Edición de perfil
      layout/           # PortalShell, PortalNav
  hooks/
    useAuth.js          # Login, logout, sesión, labels
    useExperiences.js   # Fetch de experiencias, ediciones, detalle
    useSlots.js         # Disponibilidad, selección de fecha/hora
    useCheckout.js      # Carrito, create-checkout, redirect
    useOrders.js        # Órdenes del usuario o admin
    useTickets.js       # Tickets, validación, descarga
    usePasses.js        # Pases consumibles, saldo
    useAdmin.js         # Operaciones admin (CRUD catálogos)
    useStorage.js       # Upload, preview, getFileUrl
  contexts/
    AuthContext.jsx     # Estado de autenticación global
    CartContext.jsx     # Estado del carrito de compra
  pages/
    public/             # Páginas del sitio público
    admin/              # Páginas del panel admin
    portal/             # Páginas del portal de cliente
  lib/
    appwrite.js         # Inicialización del SDK de Appwrite
    constants.js        # Constantes globales
    formatters.js       # Formateo de precios, fechas, etc.
  routes/
    AppRouter.jsx       # Router principal con guards
    AdminRoutes.jsx     # Rutas protegidas de admin
    PortalRoutes.jsx    # Rutas protegidas de portal
```

---

## 4. Las 3 superficies de OMZONE

### 4.1 Sitio público — premium editorial
- **Destinado a**: visitantes anónimos y clientes.
- **Filosofía visual**: aspiracional, sensorial, wellness, editorial. NUNCA marketplace genérico.
- **Componentes típicos**: Hero sections, cards de experiencias con imagen prominente, galería, storytelling, checkout elegante.
- **Patrones**: imágenes grandes, tipografía expresiva, espacios de respiración, scroll suave, animaciones sutiles.

### 4.2 Panel admin — productividad operativa
- **Destinado a**: admin y operator (con permisos diferenciados).
- **Filosofía visual**: claro, eficiente, funcional. Densidad de información alta pero organizada.
- **Componentes típicos**: Sidebar, tablas con filtros, formularios CRUD, dashboards con métricas, modales de acción.
- **Patrones**: sidebar colapsable, tablas con acciones por fila, formularios en columna, feedback inmediato (toasts).

### 4.3 Portal de cliente — limpio y personal
- **Destinado a**: clientes autenticados.
- **Filosofía visual**: limpio, personal, wellness sutil. No tan editorial como público, no tan denso como admin.
- **Componentes típicos**: Dashboard resumen, lista de órdenes, tickets con QR, pases con saldo, edición de perfil.
- **Patrones**: cards apiladas, línea de tiempo de órdenes, botones de descarga claros, navegación simple.

---

## 5. Estados obligatorios por componente

Todo componente que consume datos debe manejar estos 4 estados:

```jsx
function ExperienceList() {
  const { data, loading, error } = useExperiences();

  // 1. LOADING
  if (loading) return <LoadingSkeleton />;

  // 2. ERROR
  if (error) return <ErrorState message="No pudimos cargar las experiencias" retry={refetch} />;

  // 3. EMPTY
  if (!data?.length) return <EmptyState message="Aún no hay experiencias disponibles" />;

  // 4. SUCCESS
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(exp => <ExperienceCard key={exp.$id} experience={exp} />)}
    </div>
  );
}
```

### 5.1 Componentes de estado reutilizables
```
components/common/
  LoadingSkeleton.jsx    # Skeleton animado que refleja la forma del contenido
  ErrorState.jsx         # Mensaje de error + botón de retry
  EmptyState.jsx         # Mensaje de vacío + CTA contextual
```

---

## 6. Hooks — reglas de diseño

### 6.1 Un hook por dominio
Cada dominio de datos tiene su propio hook. No mezclar lógica de experiencias con lógica de órdenes.

### 6.2 Estructura base de hook
```javascript
import { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';

export function useExperiences(filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const response = await databases.listDocuments(
          'omzone_db',
          'experiences',
          // queries basadas en filters
        );
        setData(response.documents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [/* dependencias relevantes */]);

  return { data, loading, error };
}
```

### 6.3 Reglas de hooks
- Siempre retornar `{ data, loading, error }` como mínimo.
- No hacer fetch en el componente directamente — siempre a través de hook.
- Incluir función de retry/refetch cuando la data puede cambiar.
- No hardcodear IDs de database/colecciones — importar de constants.

---

## 7. Guards de ruta

### 7.1 Patrón de ProtectedRoute
```jsx
function ProtectedRoute({ allowedLabels, children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSkeleton />;
  if (!user) return <Navigate to="/login" />;
  if (!allowedLabels.some(label => user.labels.includes(label))) {
    return <Navigate to="/" />;
  }
  return children;
}
```

### 7.2 Aplicación en rutas
```jsx
// Admin — solo admin y root
<Route path="/admin/*" element={
  <ProtectedRoute allowedLabels={['admin', 'root']}>
    <AdminLayout />
  </ProtectedRoute>
} />

// Portal — solo client
<Route path="/portal/*" element={
  <ProtectedRoute allowedLabels={['client']}>
    <PortalLayout />
  </ProtectedRoute>
} />
```

### 7.3 Regla importante
Los guards son para **UX** (evitar que el usuario vea una pantalla que no le corresponde). La **seguridad real** está en los permisos de colecciones y validación en Functions.

---

## 8. Patrones de componente

### 8.1 Card de experiencia (público)
```jsx
// Estructura mínima — la card debe ser visual, no lista de datos
<article className="group cursor-pointer">
  <div className="aspect-[4/3] overflow-hidden rounded-lg">
    <img src={previewUrl} alt={experience.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
  </div>
  <div className="mt-3 space-y-1">
    <span className="text-xs uppercase tracking-wider text-stone-500">{experience.type}</span>
    <h3 className="text-lg font-medium">{experience.name}</h3>
    <p className="text-sm text-stone-600 line-clamp-2">{experience.shortDescription}</p>
    <p className="text-base font-medium">Desde {formatPrice(experience.basePrice)}</p>
  </div>
</article>
```

### 8.2 Formulario admin
```jsx
// Formularios siempre con feedback inmediato
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Campos agrupados lógicamente */}
  <fieldset className="space-y-4">
    <legend className="text-lg font-medium">Información básica</legend>
    {/* inputs */}
  </fieldset>

  {/* Feedback de validación inline */}
  {fieldErrors.name && <p className="text-sm text-red-600">{fieldErrors.name}</p>}

  {/* Acciones siempre visibles */}
  <div className="flex gap-3 sticky bottom-0 bg-white py-4">
    <Button type="submit" loading={submitting}>Guardar</Button>
    <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
  </div>
</form>
```

---

## 9. Estilo TailwindCSS

### 9.1 Paleta de referencia
- **Primarios**: tonos terrosos/naturales (stone, amber, sage) — no azules corporativos.
- **Acentos**: tonos cálidos para CTAs y highlights.
- **Fondos**: blancos cálidos, cremas suaves, no gris frío.
- **Texto**: stone-800 para body, stone-500 para secondary.

### 9.2 Reglas de estilo
- Mobile-first: escribir clases base para móvil, agregar breakpoints para desktop.
- No usar `!important` ni estilos inline.
- Preferir utilidades de Tailwind sobre CSS custom.
- Espaciado consistente: usar la escala de Tailwind (4, 6, 8, 12, 16).
- Bordes redondeados suaves (`rounded-lg`, `rounded-xl`), no ángulos duros.

---

## 10. Reglas generales

### 10.1 Hacer
- Separar componentes pequeños y composables.
- Un componente = una responsabilidad.
- Extraer lógica de data a hooks.
- Manejar los 4 estados (loading, error, empty, success).
- Usar keys estables en listas (`$id` de Appwrite).
- Formatear precios con helper (`$4,500 MXN`, no `4500`).
- Formatear fechas con helper (relativo o localizado).

### 10.2 No hacer
- No meter toda la lógica de una página en un solo componente.
- No hacer fetch directamente en el componente — usar hook.
- No hardcodear strings de UI que puedan cambiar.
- No usar `index` como key en listas que pueden reordenarse.
- No ignorar estados de loading/error/empty.
- No crear UI que parezca marketplace genérico en el sitio público.
- No exponer IDs internos en la UI al usuario final.

---

## 11. Checklist por componente

- [ ] Nombre en `PascalCase`, archivo `.jsx`
- [ ] Maneja los 4 estados: loading, error, empty, success
- [ ] Data consumida via hook (no fetch directo)
- [ ] Responsive mobile-first (clases base + breakpoints)
- [ ] Visual coherente con la superficie (público/admin/portal)
- [ ] Keys estables en listas
- [ ] Precios y fechas formateados con helpers
- [ ] Sin lógica de negocio en el componente (solo presentación)
- [ ] Accesible (alt en imágenes, labels en inputs, contraste)
- [ ] Sin hardcoded strings que deberían ser constantes
