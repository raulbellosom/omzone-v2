---
title: Experiencias
description: Cómo crear y configurar una experiencia wellness completa en OMZONE
section: catalog
order: 1
lastUpdated: 2026-05-16
---

# Experiencias

Una **experiencia** es el producto principal que ofrece tu plataforma: una sesión de yoga, un retiro de fin de semana, una estancia en el spa, o cualquier vivencia wellness que quieras vender o reservar. Todo lo que el cliente ve y compra parte de aquí.

Cada experiencia se configura a través de **5 pestañas**: Info, Ediciones, Precios, Complementos y Horarios. Cada una cubre una parte diferente de la experiencia, y es importante completarlas todas antes de publicar.

> **Antes de publicar** necesitas tener al menos: la pestaña Info completa, al menos un precio activo, y si la experiencia requiere fecha, al menos un horario disponible.

---

## Pestaña: Info

Esta es la ficha principal de la experiencia. Aquí defines cómo se llama, cómo se ve, qué tipo de venta es y cómo aparece para los clientes.

### Nombre y URL

**Nombre interno**
Es solo para ti y tu equipo. El cliente nunca lo ve. Útil para diferenciarlo cuando tienes varias versiones de lo mismo.

> Ejemplo: `Yoga Matutino V2 - Temporada Alta`

**Nombre público (EN) / Nombre público (ES)**
Así se llama la experiencia para los clientes. Ponlo atractivo y descriptivo.

> Ejemplo EN: `Morning Flow Yoga` / ES: `Yoga de la Mañana`

**Slug (URL)**
Es la dirección web de la experiencia. Se genera automáticamente a partir del nombre, pero puedes editarla. Solo letras minúsculas, números y guiones.

> Ejemplo: `yoga-de-la-manana` → la URL quedaría `/experiencias/yoga-de-la-manana`

---

### Tipo y modo de venta

**Tipo**
Clasifica qué categoría de experiencia es. Esto afecta cómo se organiza en la plataforma.

| Tipo      | Cuándo usarlo                          |
| --------- | -------------------------------------- |
| Sesión    | Clase o actividad de una o pocas horas |
| Inmersión | Experiencia intensa de un día completo |
| Retiro    | Programa de varios días                |
| Estancia  | Hospedaje + actividades integradas     |
| Privada   | Experiencia exclusiva para un grupo    |
| Paquete   | Conjunto de varias experiencias        |

**Modo de venta**
Define cómo el cliente puede comprar esta experiencia.

| Modo          | Qué significa                                                          |
| ------------- | ---------------------------------------------------------------------- |
| Directa       | El cliente paga en línea en el momento, con tarjeta                    |
| Por solicitud | El cliente envía una solicitud y tú la confirmas (sin pago automático) |
| Asistida      | Solo se puede vender desde el panel de administración                  |
| Por pase      | Solo accesible para clientes que tienen un pase activo                 |

> **Recomendación:** Usa "Directa" para sesiones o actividades de precio fijo. Usa "Por solicitud" para retiros o experiencias privadas donde necesitas coordinar antes de confirmar.

**Tipo de entrega**
Qué recibe el cliente al confirmar su compra.

| Entrega | Qué recibe el cliente                                                   |
| ------- | ----------------------------------------------------------------------- |
| Ticket  | Un ticket digital con código QR para presentar el día de la experiencia |
| Reserva | Una confirmación de reserva (sin ticket físico)                         |
| Pase    | Acceso a un pase recurrente                                             |
| Paquete | Un conjunto de beneficios empaquetados                                  |

---

### Descripción

**Descripción corta (EN) / Descripción corta (ES)**
Un resumen breve de 2 a 3 líneas. Aparece en listados, tarjetas y vistas previas. Máximo 500 caracteres.

> Ejemplo: `Clase de yoga vinyasa de 60 minutos al amanecer con vistas al mar. Todos los niveles bienvenidos. Incluye mat y agua.`

**Descripción larga (EN) / Descripción larga (ES)**
La descripción completa que verá el cliente al abrir la experiencia. Aquí puedes contar todos los detalles: qué incluye, qué esperar, quién la guía, qué llevar. Máximo 5,000 caracteres.

---

### Imagen de portada y galería

**Imagen de portada**
La foto principal que representa la experiencia. Es la primera imagen que verá el cliente. Usa una imagen de alta calidad, horizontal, que transmita la esencia de la experiencia.

**Galería**
Fotos adicionales de la experiencia. Puedes subir varias imágenes que aparecerán en la página de la experiencia.

---

### Comportamiento de reserva

**Requiere selección de fecha/horario**
Si activas esto, el cliente debe elegir un horario disponible al reservar. Si lo desactivas, puede comprar sin elegir fecha.

> Actívalo para: sesiones con horario fijo, retiros con fechas específicas.
> Desactívalo para: experiencias a demanda o paquetes de regalo sin fecha fija.

**Requiere fecha específica**
Actívalo si la experiencia tiene una sola fecha fija (por ejemplo, un retiro de un fin de semana en particular).

**Genera tickets después de la compra**
Si está activo, al confirmar la compra se genera automáticamente un ticket digital para el cliente.

**Permite múltiples asistentes**
Actívalo si el cliente puede comprar para más de una persona en la misma orden.

**Mínimo de asistentes / Máximo de asistentes**
Si permites múltiples asistentes, define cuántos pueden venir como mínimo y como máximo por orden.

> Ejemplo: Mínimo 2, Máximo 8 para una experiencia de grupo pequeño.

---

### Publicación y visibilidad

**Estado**

- **Borrador**: La experiencia existe pero no es visible ni reservable por los clientes. Úsalo mientras la estás configurando.
- **Publicada**: La experiencia es visible para los clientes y se puede reservar (siempre que tenga precio y horario disponibles).

**Orden de despliegue**
Número que determina en qué posición aparece esta experiencia en los listados. Número menor = aparece primero.

> Ejemplo: Si quieres que "Yoga Matutino" aparezca antes que "Meditación Nocturna", dale un número menor a Yoga Matutino.

---

### SEO (posicionamiento en Google)

**Título SEO**
El título que aparecerá en los resultados de búsqueda de Google. Si lo dejas vacío, se usa el nombre público. Mantén menos de 60 caracteres.

> Ejemplo: `Clase de Yoga en Puerto Vallarta | OMZONE Wellness`

**Descripción SEO**
El texto descriptivo que aparece debajo del título en Google. Debe resumir la experiencia en 1-2 oraciones y mencionar la ubicación. Máximo 160 caracteres.

> Ejemplo: `Sesión de yoga vinyasa al amanecer en Puerto Vallarta. Para todos los niveles. Reserva en línea.`

---

## Pestaña: Ediciones

Una **edición** representa una versión o temporada específica de la experiencia. Sirve para organizar experiencias que se repiten en fechas diferentes, como un retiro que tienes en marzo y otro en junio — cada uno es una edición distinta de la misma experiencia.

> **¿Cuándo necesito crear una edición?**
>
> - Para retiros o experiencias con fechas de inicio y fin definidas.
> - Cuando quieres ofrecer la misma experiencia en diferentes temporadas, cada una con sus propios precios o capacidades.
> - Para programas que tienen un período de registro anticipado.
>
> Si tu experiencia es una clase que se da todos los martes, probablemente no necesitas ediciones — solo usa la pestaña Horarios directamente.

### Campos de una edición

**Nombre / Nombre (ES)**
Cómo identificas esta edición. El cliente puede verlo.

> Ejemplo: `Retiro de Primavera 2026` / `Spring Retreat 2026`

**Descripción (EN) / Descripción (ES)**
Detalles específicos de esta edición: fechas del programa, actividades incluidas, novedades respecto a ediciones anteriores.

**Fecha de inicio / Fecha de fin**
El rango de fechas que cubre esta edición.

> Ejemplo: Inicio: 14 de marzo 2026 — Fin: 17 de marzo 2026

**Apertura de registro / Cierre de registro**
Las fechas en que se abre y cierra la inscripción. El registro debe cerrar antes de que empiece la experiencia.

> Ejemplo: Registro abre el 1 de enero, cierra el 10 de marzo.

**Capacidad máxima**
Cuántas personas pueden inscribirse en esta edición en total.

**Estado**

- **Borrador**: En preparación, no visible para clientes.
- **Abierta**: Aceptando reservas o solicitudes.
- **Cerrada**: Registro cerrado, pero puede seguir mostrándose.
- **Completada**: La edición ya ocurrió.
- **Cancelada**: Se canceló.

---

## Pestaña: Precios

Aquí defines cuánto cuesta la experiencia. Puedes tener **varios niveles de precio** para la misma experiencia: por ejemplo, precio estándar, precio early bird, precio VIP.

Cada nivel de precio es una opción que el cliente verá al momento de comprar y podrá elegir la que más le convenga.

### Campos de un nivel de precio

**Nombre / Nombre (ES)**
Cómo aparece este precio para el cliente.

> Ejemplo: `Precio Estándar` / `Early Bird` / `VIP con Todo Incluido`

**Descripción (EN) / Descripción (ES)**
Qué incluye o qué lo diferencia de los demás niveles.

> Ejemplo: `Incluye acceso a todas las sesiones, materiales y alimentación.`

**Tipo de precio**
Cómo se calcula el precio.

| Tipo        | Cómo funciona                                                      |
| ----------- | ------------------------------------------------------------------ |
| Precio fijo | Un precio único, sin importar cuántas personas                     |
| Por persona | Se multiplica por el número de asistentes                          |
| Por grupo   | Un precio fijo para todo el grupo, sin importar cuántos sean       |
| Desde       | Precio mínimo orientativo; el precio real se define al cotizar     |
| Cotización  | Sin precio fijo — el precio se acuerda directamente con el cliente |

**Precio base**
El monto en números. Si el tipo es "Por persona", este es el precio por cada asistente.

> Ejemplo: $1,500 MXN

**Moneda**
MXN (pesos mexicanos) o USD (dólares americanos).

**Mínimo de personas / Máximo de personas**
Opcionalmente limita este nivel de precio a grupos de cierto tamaño.

> Ejemplo: El precio "Por grupo" aplica solo si vienen entre 4 y 10 personas.

**Badge**
Una etiqueta corta que aparece visualmente sobre el precio para destacarlo.

> Ejemplo: `Más popular` / `¡Solo por hoy!` / `Early Bird`

**Destacado**
Actívalo para que este nivel de precio aparezca resaltado visualmente entre las opciones disponibles.

**Activo**
Solo los precios activos aparecen disponibles para los clientes. Puedes desactivar un precio temporalmente sin borrarlo.

**Orden de despliegue**
En qué posición aparece entre los demás niveles de precio.

**Edición**
Si esta experiencia tiene ediciones, puedes ligar este precio a una edición específica. Así el precio "Early Bird de Primavera" solo aplica para la edición de primavera y no aparece en las demás.

---

## Pestaña: Complementos

Los **complementos** son productos o servicios adicionales que el cliente puede agregar al momento de comprar la experiencia. Aparecen en el proceso de compra como opciones extras que el cliente puede incluir o no.

> **Ejemplos de complementos:**
>
> - Transporte de ida y vuelta
> - Habitación individual (upgrade)
> - Fotografías de la sesión
> - Kit de bienvenida
> - Masaje adicional de 30 minutos

> **Importante:** Los complementos se crean primero en la sección "Complementos" del catálogo. Desde esta pestaña solo los asignas a la experiencia — no puedes crear un complemento nuevo desde aquí.

### Campos de una asignación de complemento

**Complemento**
Selecciona del catálogo el complemento que quieres ofrecer con esta experiencia.

**Es obligatorio**
Si lo activas, el cliente no puede completar la compra sin incluir este complemento. Úsalo cuando algo siempre va incluido pero necesitas registrarlo o cobrarlo por separado.

**Es predeterminado**
Si lo activas, el complemento aparece ya seleccionado cuando el cliente llega al paso de extras (aunque puede quitarlo si no es obligatorio).

**Precio personalizado**
Si quieres que este complemento tenga un precio diferente al de su precio en el catálogo general, escríbelo aquí. Si lo dejas vacío, se usa el precio original del complemento.

> Ejemplo: El complemento "Fotografías" normalmente cuesta $800, pero para este retiro quieres ofrecerlo a $600.

**Orden de despliegue**
En qué posición aparece en la lista de complementos disponibles durante la compra.

---

## Pestaña: Horarios

Los **horarios** son los espacios de tiempo específicos en que se puede reservar la experiencia. Cada horario tiene su propia fecha, hora y número de lugares disponibles.

> **Ejemplo:** La experiencia "Yoga Matutino" puede tener un horario cada martes y cada jueves a las 7am. Cada uno de esos horarios es independiente — tiene sus propios lugares disponibles y cuando se llena, ese horario específico ya no aparece disponible, pero los demás sí.

### Campos de un horario

**Fecha y hora de inicio / Fecha y hora de fin**
Cuándo empieza y termina esta sesión u ocurrencia.

> Ejemplo: Martes 20 de mayo 2026, 7:00 AM — 8:00 AM

**Zona horaria**
En qué zona horaria están esas horas. Por defecto es hora del centro de México. Cámbiala si la experiencia ocurre en otra ciudad o país.

**Tipo de horario**

| Tipo              | Cuándo usarlo                                   |
| ----------------- | ----------------------------------------------- |
| Sesión individual | Una clase o actividad de duración corta (horas) |
| Multi-día         | Un espacio que abarca varios días corridos      |
| Día de retiro     | Un día específico dentro de un retiro más largo |
| Privado           | Sesión reservada exclusivamente para un grupo   |

**Edición**
Si la experiencia tiene ediciones, puedes ligar este horario a una edición específica para que el sistema los relacione correctamente.

**Capacidad**
Cuántas personas pueden reservar este horario. Cuando se alcanza ese número, el horario se cierra automáticamente para nuevas reservas.

> Ejemplo: Capacidad 12. Cuando haya 12 reservaciones confirmadas, este horario ya no aparece disponible.

**Ubicación / Sala o espacio**
Dónde ocurre esta sesión. Primero elige la ubicación (espacio físico) y luego la sala o espacio específico dentro de ella.

**Estado**

- **Borrador**: Existe en el sistema pero los clientes no pueden verlo ni reservarlo.
- **Publicado**: Aparece disponible para que los clientes reserven.

**Notas internas**
Texto solo visible para ti y tu equipo. Anota instrucciones especiales, recordatorios o detalles de logística.

> Ejemplo: `Recordar traer el proyector. El instructor llega 30 min antes para preparar el espacio.`

---

## Checklist antes de publicar

Antes de cambiar el estado de una experiencia a **Publicada** y abrirla a los clientes, verifica:

- [ ] Nombre público y descripción corta completados (en español e inglés si aplica)
- [ ] Imagen de portada subida
- [ ] Tipo, Modo de venta y Tipo de entrega correctamente configurados
- [ ] Al menos un nivel de precio activo creado
- [ ] Si la experiencia requiere horario: al menos un horario futuro en estado **Publicado** con lugares disponibles
- [ ] Si usas ediciones: el nivel de precio y el horario están ligados a la misma edición
- [ ] Complementos asignados si aplica (obligatorios y opcionales)

---

## Casos de uso comunes

### Clase semanal recurrente

Una clase de yoga que se repite cada martes y jueves a las 7am:

1. Crea la experiencia → Tipo: **Sesión**, Modo de venta: **Directa**, Tipo de entrega: **Ticket**
2. Activa **Requiere selección de fecha/horario** y **Genera tickets después de la compra**
3. En **Precios**: crea un nivel "Clase individual" a $350 MXN por persona
4. En **Horarios**: agrega un horario para cada martes y jueves, con capacidad de 15 personas cada uno
5. Cambia el estado a **Publicada**

### Retiro de varios días con inscripción anticipada

Un retiro de 4 días que ofreces dos veces al año, con precio especial para quien se inscribe con anticipación:

1. Crea la experiencia → Tipo: **Retiro**, Modo de venta: **Directa** o **Por solicitud**
2. En **Ediciones**: crea "Retiro Mayo 2026" con fechas del 14 al 17 de mayo y cierre de registro el 10 de mayo
3. En **Precios**: crea "Early Bird" ($3,500 MXN) y "Precio Regular" ($4,500 MXN), ambos ligados a esa edición
4. En **Horarios**: crea un horario de tipo Multi-día para el 14 al 17 de mayo, ligado a la misma edición
5. En **Complementos**: agrega "Habitación individual" y "Transporte" como opciones extras
6. Cambia el estado a **Publicada**

### Experiencia privada bajo cotización

Una sesión privada de meditación para grupos donde el precio se acuerda según el tamaño del grupo:

1. Crea la experiencia → Tipo: **Privada**, Modo de venta: **Por solicitud**
2. En **Precios**: crea un nivel con Tipo de precio: **Cotización**
3. No necesitas horarios fijos — el horario se coordina con el cliente al confirmar la solicitud
4. Cambia el estado a **Publicada** para que aparezca en el catálogo y los clientes puedan enviar solicitudes

---

## Páginas relacionadas

- [Ediciones](./editions.md)
- [Niveles de Precio](./pricing-tiers.md)
- [Complementos](./addons.md)
- [Horarios y Agenda](../operations/slots.md)
- [Solicitudes de Reserva](../operations/booking-requests.md)
- [Flujos del Sistema](../reference/flows.md)
