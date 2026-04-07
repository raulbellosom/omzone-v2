# OMZONE — Documento Maestro de Requerimientos

Versión: 1.0  
Estado: Base de redefinición funcional y técnica  
Proyecto Appwrite: `omzone-dev`  
Endpoint Appwrite: `https://aprod.racoondevs.com/v1`  
Stack objetivo: React + Vite + TailwindCSS + Appwrite 1.9.0 self-hosted

---

## 1. Propósito del documento

Este documento define de forma integral la nueva visión funcional, comercial, operativa y técnica de **OMZONE**, después de la reestructuración del proyecto y la migración conceptual desde la versión anterior basada en Appwrite 1.8.1 hacia una nueva implementación sobre **Appwrite 1.9.0** en una nueva instancia self-hosted.

Este documento servirá como base para:

- rediseñar la arquitectura del sistema
- reestructurar la base de datos
- redefinir los módulos del panel administrativo y del front público
- preparar la configuración correcta de Appwrite
- definir Functions, Storage, permisos y flows
- generar posteriormente un backlog de tasks técnicas bien ordenadas para ejecución con agentes como Codex o Claude Code

---

## 2. Contexto de negocio

OMZONE no debe percibirse ni construirse como un marketplace tradicional de clases o tours.

OMZONE es una **plataforma de experiencias wellness premium**, donde el valor principal no es únicamente una sesión, un retiro o un servicio aislado, sino la **experiencia completa** que se comunica, se agenda, se personaliza, se vende y se opera.

La marca busca transmitir:

- bienestar
- transformación
- misticismo
- estilo de vida
- memorabilidad
- hospitalidad curada
- experiencias profundas y diferenciadas

El proyecto debe hacer sentir que el usuario no está comprando “un evento” ni “una clase”, sino una **experiencia integral**.

---

## 3. Visión del sistema

OMZONE será una plataforma web con tres grandes superficies:

### 3.1 Sitio público / catálogo editorial
Superficie pública donde usuarios potenciales descubren experiencias, las exploran mediante páginas ricas en contenido visual y narrativo, consultan agenda/disponibilidad, seleccionan variantes de compra, agregan complementos y completan checkout.

### 3.2 Portal de cliente
Área autenticada para clientes con label `client`, donde pueden:

- consultar reservas
- ver tickets o pases digitales
- revisar compras
- descargar comprobantes
- consultar detalles de su experiencia
- gestionar algunos datos de perfil
- revisar addons incluidos o adquiridos
- consultar estatus de solicitudes o itinerarios futuros

### 3.3 Panel administrativo / operativo
Área para el dueño y operadores internos, donde se gestionará:

- contenido editorial
- experiencias
- sesiones, ediciones y agendas
- precios
- paquetes y bundles
- addons
- órdenes y pagos
- tickets y pases
- clientes
- recursos operativos
- venta asistida o en vivo
- configuración general
- trazabilidad operativa

---

## 4. Naturaleza del negocio

OMZONE administrará y venderá experiencias que pueden ocurrir:

- dentro de las instalaciones principales de OMZONE
- en alguno de los 6 cuartos multiuso del recinto principal
- en exteriores
- en playa
- en otras locaciones especiales

Los cuartos no deben modelarse como el producto principal que el cliente “reserva” directamente en todos los casos.

Primero se vende una **experiencia**. Después, operativamente, se puede asignar:

- una locación
- un espacio
- un cuarto
- un instructor
- una capacidad
- una agenda concreta

Por eso el sistema debe separar claramente:

- la experiencia vendible
- la disponibilidad comercial
- la agenda reservable
- la operación interna

---

## 5. Problema que resuelve la plataforma

OMZONE debe resolver simultáneamente cuatro dimensiones del negocio:

### 5.1 Narrativa de marca
Permitir que la oferta pública se comunique como una marca institucional, aspiracional, premium y emocional.

### 5.2 Venta flexible
Permitir vender productos con distintos modos comerciales sin forzar todo al mismo flujo.

### 5.3 Operación estructurada
Traducir las ventas a reservas, tickets, asignaciones, recursos y seguimiento interno.

### 5.4 Escalabilidad de catálogo
Permitir agregar nuevas experiencias, formatos, addons y paquetes sin rehacer la arquitectura base.

---

## 6. Definición conceptual principal

OMZONE no vende solamente clases, eventos o servicios sueltos. Vende **experiencias**.

Una experiencia puede representar:

- una sesión puntual
- una sesión recurrente
- una práctica privada
- una inmersión
- un retiro espiritual
- una estancia wellness
- una experiencia de varios días
- una experiencia con hospedaje
- una experiencia privada con concierge
- una experiencia compuesta empaquetada

Además, una compra puede combinar:

- una experiencia principal
- uno o varios addons
- uno o varios tickets o asistentes
- un pase consumible
- una edición agendada
- un paquete fijo de varios días

---

## 7. Tipos de productos que debe soportar el sistema

La plataforma deberá soportar como mínimo los siguientes tipos comerciales.

### 7.1 Experiencia reservable individual
Ejemplo:

- sesión de yoga
- sesión de yoga aéreo
- sesión de taichi
- sesión privada
- práctica en playa

### 7.2 Experiencia agendada recurrente
Ejemplo:

- yoga todos los lunes, miércoles y viernes a las 8:00
- yoga surf sábados a las 7:00

### 7.3 Experiencia de bloque o edición
Ejemplo:

- retiro del 5 al 8 de mayo
- inmersión del 10 al 12 de junio
- programa espiritual de 3 días

### 7.4 Addon o complemento
Ejemplo:

- transporte aeropuerto → estudio
- concierge
- wellness kitchen
- hospedaje adicional
- sesión privada complementaria
- welcome pack

### 7.5 Paquete de experiencia fija
Ejemplo:

- experiencia de 5 días con yoga + comida + concierge
- retiro con hospedaje y alimentos incluidos
- programa premium con itinerario cerrado

### 7.6 Pase consumible
Ejemplo:

- paquete de 5 sesiones
- paquete de 10 accesos
- pase mensual con consumos limitados

---

## 8. Enfoque de arquitectura funcional

El sistema deberá separarse en cuatro capas conceptuales.

### 8.1 Capa editorial
Describe y comunica la experiencia.

Incluye:

- títulos
- subtítulos
- storytelling
- galerías
- beneficios
- FAQs
- restricciones
- copy institucional
- secciones de contenido
- templates visuales
- SEO

### 8.2 Capa comercial
Define cómo se vende.

Incluye:

- precio base
- tiers o variantes
- modo de cobro
- moneda
- políticas
- addons permitidos
- capacidad comercial
- reglas de cantidad
- compra directa vs request

### 8.3 Capa de agenda / disponibilidad
Define cuándo y bajo qué calendario se reserva.

Incluye:

- sesiones por horario
- rangos de fechas
- ediciones
- recurrencias
- horarios opcionales
- ventanas de reserva
- cupos

### 8.4 Capa operativa
Define cómo se ejecuta internamente.

Incluye:

- asignación de cuarto o locación
- recursos
- instructores
- tickets
- check-in
- consumo de pases
- órdenes
- snapshots de compra
- estatus internos

---

## 9. Objetivos del sistema

1. Construir una plataforma pública que presente experiencias premium de forma editorial y aspiracional.
2. Permitir al administrador crear experiencias con distintos modos comerciales sin complejidad excesiva.
3. Soportar sesiones recurrentes, eventos por rango de fechas, paquetes fijos y pases consumibles.
4. Permitir addons configurables con reglas propias.
5. Integrar checkout y pagos con Stripe.
6. Generar tickets, reservas, pases o comprobantes según el tipo de producto adquirido.
7. Permitir un portal de cliente para consultar compras y accesos.
8. Permitir un panel interno para venta asistida y operación.
9. Soportar trazabilidad histórica de ventas, incluso si los precios cambian después.
10. Mantener el sistema preparado para crecimiento futuro sin rehacer la base.

---

## 10. Principios rectores

1. **Experience-first**: todo se diseña alrededor de la experiencia.
2. **Editorial-first in public**: el sitio público no debe parecer marketplace.
3. **Composable commerce**: una compra puede estar compuesta por varios elementos.
4. **Operational clarity**: la operación interna debe ser clara y trazable.
5. **Historical integrity**: una venta histórica nunca debe cambiar por actualizar un precio futuro.
6. **Flexible booking modes**: no todas las experiencias comparten el mismo flujo.
7. **Role enforcement by auth labels**: el acceso se gobierna por labels de Appwrite Auth.

---

## 11. Actores del sistema

### 11.1 Root
Usuario fantasma y técnico. No debe mostrarse ni considerarse parte visible de la operación normal del producto.

Acceso esperado:

- acceso completo al panel administrativo
- acceso completo a la landing o portal de client
- acceso técnico de superadministración
- posibilidad de resolver incidencias, soporte y administración profunda

Restricción funcional:

- no debe mostrarse como rol de negocio dentro de la plataforma
- no debe formar parte de flujos visibles normales de UI para asignación comercial regular

### 11.2 Admin
Dueño u operador principal del negocio.

Acceso esperado:

- acceso completo al panel administrativo
- gestión de experiencias
- gestión editorial
- gestión comercial
- gestión operativa
- configuración general
- órdenes, reservas, tickets, clientes, addons, recursos

### 11.3 Operator
Usuario interno operativo o de contenido.

Acceso esperado:

- acceso al panel de la plataforma
- acceso limitado según módulos habilitados
- enfoque en gestión operativa o de contenido
- sin acceso a funciones core sensibles

Ejemplos de restricciones:

- no gestionar configuración crítica
- no gestionar root/admin
- no alterar políticas core o integraciones críticas
- no ejecutar acciones extremadamente sensibles sin validación

### 11.4 Client
Cliente autenticado.

Acceso esperado:

- acceso a portal de client
- ver reservas
- ver tickets
- ver historial de compras
- actualizar datos propios permitidos
- no acceso al panel administrativo

---

## 12. Modelo de roles y permisos

### 12.1 Fuente de verdad
La autorización principal del sistema se basará en los **labels del usuario en Appwrite Auth**.

Labels base acordados:

- `root`
- `admin`
- `client`
- `operator`

### 12.2 Reglas generales

- `root`: acceso total técnico, invisible para flujos normales
- `admin`: acceso total de negocio al panel administrativo
- `client`: acceso al portal de cliente
- `operator`: acceso restringido al panel administrativo según los módulos asignados o permitidos por definición funcional

### 12.3 Reglas de implementación

1. El frontend deberá leer sesión + labels del usuario autenticado.
2. Las rutas estarán protegidas en función de labels.
3. Las Functions sensibles validarán labels del usuario, no solo visibilidad en frontend.
4. Los labels deberán considerarse la capa principal de autorización.
5. Si más adelante se requiere granularidad fina, podrá añadirse una matriz complementaria de permisos, pero en esta fase el sistema se construirá con labels como núcleo de acceso.

### 12.4 Consideración especial
El label `root` existe por razones técnicas y administrativas globales, pero no deberá formar parte del lenguaje cotidiano del producto ni mostrarse como rol “normal” en la interfaz pública de administración.

---

## 13. Módulos funcionales del sistema

### 13.1 Público
- home
- explorador/catálogo de experiencias
- detalle de experiencia
- landing pages editoriales
- agenda / disponibilidad
- pre-checkout
- checkout
- confirmación de compra
- páginas institucionales
- contacto / lead

### 13.2 Cliente
- dashboard del cliente
- mis reservas
- mis tickets
- mis pases
- mis compras
- detalle de orden
- perfil básico
- documentos descargables

### 13.3 Admin / Operator
- dashboard interno
- experiencias
- contenido editorial
- agendas / sesiones / ediciones
- precios / tiers
- paquetes / bundles
- addons
- órdenes
- tickets y check-in
- clientes
- venta asistida
- recursos / locaciones / cuartos
- media library
- settings
- auditoría básica

---

## 14. Flujos principales del negocio

## 14.1 Flujo A — Descubrimiento público y compra directa

1. El usuario entra al sitio público.
2. Explora experiencias o llega a una landing específica.
3. Consulta imágenes, narrativa, beneficios, restricciones y agenda.
4. Selecciona una fecha/sesión/edición si aplica.
5. Selecciona cantidad de asistentes o tickets si aplica.
6. Selecciona addons opcionales si el offering lo permite.
7. Completa checkout.
8. Se procesa el pago.
9. Se genera orden y tickets/pases/reserva según corresponda.
10. El usuario puede consultar todo desde su portal.

## 14.2 Flujo B — Solicitud / request antes de pago

1. El usuario explora una experiencia que no es de compra inmediata.
2. Selecciona datos básicos o fecha deseada.
3. Envía solicitud.
4. El admin revisa y define propuesta.
5. La solicitud puede convertirse en una orden pagable o en una reserva manual.

## 14.3 Flujo C — Venta asistida desde admin

1. El admin u operador inicia una venta desde panel.
2. Selecciona cliente existente o crea uno.
3. Selecciona experiencia principal.
4. Agrega fecha/evento si aplica.
5. Agrega addons.
6. Define cantidad de asistentes o pases.
7. Confirma el precio final.
8. Genera orden o propuesta.
9. Se registra pago o se deja pendiente según el caso.
10. Se generan tickets o reservas.

## 14.4 Flujo D — Compra de paquete fijo

1. El cliente selecciona un paquete que ya incluye varios componentes.
2. El sistema muestra el contenido del paquete de forma editorial y comercial.
3. El usuario compra el paquete por un precio fijo.
4. La orden guarda snapshot completo del paquete y sus inclusiones.
5. Se generan los beneficios, accesos o reservas derivadas según reglas del paquete.

## 14.5 Flujo E — Compra de pase consumible

1. El cliente compra un pack de sesiones o accesos.
2. El sistema genera un “saldo” o entidad consumible.
3. Cada uso futuro del pase deberá reducir disponibilidad consumible.
4. Debe existir trazabilidad de consumo por sesión o reserva.

---

## 15. Requerimientos funcionales principales

## RF-01. Gestión de contenido editorial
El sistema debe permitir crear y editar contenido público orientado a storytelling, catálogo y SEO.

Debe soportar:

- secciones hero
- galerías
- highlights
- descripciones cortas y largas
- SEO básico
- elementos bilingües ES/EN
- templates de layout

## RF-02. Gestión de experiencias
El sistema debe permitir crear experiencias comerciales independientes del contenido editorial.

Debe soportar:

- experiencia individual
- experiencia agendada
- experiencia por edición
- retiro / inmersión / estancia
- servicio privado
- producto compuesto
- pase consumible

## RF-03. Gestión de precios y variantes
Cada experiencia deberá poder tener uno o más precios o tiers.

Debe soportar:

- precio fijo
- por persona
- por grupo
- desde-precio
- cotización
- badges
- labels públicos
- variantes destacadas

## RF-04. Gestión de agenda y disponibilidad
La plataforma debe soportar distintos modos de agenda.

Debe soportar:

- horarios fijos
- recurrencias por día de semana
- rangos de fecha
- eventos puntuales
- ediciones de varios días
- cupos
- apertura y cierre de reserva

## RF-05. Gestión de addons
El sistema debe permitir crear addons con lógica comercial propia.

Ejemplos:

- concierge
- airport transfer
- wellness kitchen
- hospedaje adicional
- add-on privado

Cada addon debe poder definir:

- precio
- tipo de cobro
- si depende de un producto principal
- si es opcional o obligatorio
- si sigue la duración del producto principal
- si se elige por cantidad manual

## RF-06. Gestión de paquetes de experiencia
El sistema debe soportar paquetes fijos compuestos por varios componentes.

Cada paquete debe poder incluir:

- texto editorial
- estructura relacional interna
- precio fijo
- beneficios incluidos
- reglas de generación de tickets o beneficios

## RF-07. Gestión de pases consumibles
El sistema debe permitir vender y administrar pases consumibles.

Debe soportar:

- saldo inicial
- reglas de expiración
- consumo por uso
- relación con sesiones válidas
- historial de consumos

## RF-08. Checkout
El sistema debe permitir checkout para compra directa.

Debe soportar:

- selección de sesión/edición si aplica
- cantidad de asistentes
- selección de addons
- datos del comprador
- integración con Stripe
- confirmación de orden

## RF-09. Solicitudes y cotizaciones
El sistema debe permitir experiencias bajo modelo request.

Debe soportar:

- formulario de solicitud
- fecha tentativa
- cantidad de asistentes
- notas del cliente
- revisión por admin
- cotización o conversión a orden

## RF-10. Órdenes
La plataforma debe registrar toda compra o venta en una entidad de orden.

La orden deberá guardar:

- cliente
- experiencia principal
- selección de precio
- evento/sesión/edición
- addons
- asistentes
- montos
- impuestos si aplican
- método/estado de pago
- snapshot histórico

## RF-11. Tickets y accesos
La plataforma debe generar tickets, pases o accesos según el tipo de compra.

Debe soportar:

- ticket por persona
- ticket por acceso
- tickets múltiples derivados de una sola orden
- QR o código único
- estado de uso
- descarga o visualización posterior

## RF-12. Portal de cliente
El cliente autenticado debe poder consultar y gestionar la información permitida de sus compras.

Debe soportar:

- historial de órdenes
- tickets activos
- reservas futuras
- pases consumibles
- perfil personal

## RF-13. Venta asistida en admin
El admin debe poder generar ventas manualmente desde panel.

Debe soportar:

- selección de cliente
- selección de experiencia
- agregación de addons
- selección de agenda
- cálculo de monto
- generación de orden
- emisión de tickets

## RF-14. Recursos operativos
El sistema debe permitir registrar recursos operativos para ejecución.

Debe soportar:

- cuartos
- locaciones
- espacios
- capacidad física
- notas internas
- disponibilidad operativa futura

## RF-15. Media management
El sistema debe soportar gestión de imágenes y archivos necesarios para la experiencia y el contenido.

Debe soportar:

- portada
- galería
- imágenes de SEO/OG
- documentos descargables
- assets del cliente si aplica

## RF-16. Auditoría básica
El sistema debe registrar eventos importantes para trazabilidad.

Ejemplos:

- creación y edición de experiencias
- cambios de precio
- publicación/despublicación
- creación de orden manual
- cancelaciones relevantes
- check-in o consumo de ticket/pase

---

## 16. Requerimientos no funcionales

## RNF-01. Arquitectura escalable
La base debe permitir agregar más categorías, más experiencias, más addons, más bundles y más recursos sin rehacer la estructura.

## RNF-02. Integridad histórica
Las órdenes y tickets históricos deben conservar snapshot suficiente para no verse afectados por cambios futuros en precios o contenido.

## RNF-03. Seguridad
Las acciones sensibles deben validarse tanto en frontend como en Functions/Backend.

## RNF-04. UX premium
La interfaz pública debe sentirse editorial, premium y experiencial, no tipo marketplace genérico.

## RNF-05. Internacionalización
El sistema debe quedar listo para español e inglés.

## RNF-06. Performance
El sitio público debe optimizar imágenes, rutas y carga de datos para SEO y experiencia real.

## RNF-07. Trazabilidad
Las operaciones sensibles y comerciales deben ser trazables.

## RNF-08. Mantenibilidad
El sistema debe modularizarse para poder reutilizar la UI actual donde aporte valor, sin acoplarla a la lógica antigua.

---

## 17. Decisiones de arquitectura de datos

### 17.1 Estrategia general
Se reutilizará el aprendizaje conceptual del modelo anterior, pero se redefine el sistema alrededor de los siguientes dominios:

- contenido editorial
- experiencias comerciales
- precios/tiers
- agenda/eventos
- addons
- paquetes/pases
- órdenes
- tickets/reservas
- clientes
- recursos operativos

### 17.2 Principio de modelado
Se recomienda modelo híbrido:

- **relacional** para entidades vivas del sistema
- **snapshot JSON** dentro de órdenes y tickets para preservar integridad histórica

### 17.3 Regla histórica
Aunque una orden apunte a una experiencia o tier actual, también deberá guardar una copia histórica de los datos clave vendidos al momento de compra.

Esto aplica especialmente a:

- nombre público
- precio
- moneda
- selección de agenda
- addons incluidos
- reglas de la compra
- asistentes

---

## 18. Propuesta de dominios y tablas principales

> Nota: los nombres finales pueden ajustarse en la fase de diseño detallado, pero esta es la estructura conceptual recomendada.

### 18.1 Seguridad y perfiles
- `user_profiles`
- `admin_activity_logs`

### 18.2 Editorial
- `publications`
- `publication_sections`
- `publication_media`

### 18.3 Comercial
- `experiences`
- `experience_prices`
- `experience_addon_rules`
- `addons`
- `addon_prices`
- `experience_packages`
- `package_items`
- `experience_pass_types`

### 18.4 Agenda
- `experience_events`
- `event_availability`
- `event_instructors` (opcional futuro)

### 18.5 Clientes y ventas
- `customers`
- `orders`
- `order_items`
- `order_addons`
- `tickets`
- `passes`
- `pass_usages`
- `booking_requests`

### 18.6 Operación
- `locations`
- `rooms`
- `resource_assignments`
- `checkins` (futuro o fase posterior)

### 18.7 Sistema
- `system_settings`
- `seo_routes` (opcional)
- `webhooks_logs` (opcional)

---

## 19. Definición conceptual sugerida de entidades

### 19.1 `publications`
Capa editorial visible al público.

Debe contener:

- slug
- título ES/EN
- resumen ES/EN
- descripción ES/EN
- categoría visual
- portada
- galería
- SEO
- flags de publicación
- referencia a experiencia principal cuando aplique

### 19.2 `publication_sections`
Secciones modulares de contenido dentro de una publicación.

Ejemplos:

- hero
- gallery
- highlights
- agenda teaser
- faq
- itinerary
- testimonials
- inclusions
- restrictions

### 19.3 `experiences`
Producto comercial maestro.

Debe definir:

- nombre interno
- nombre público
- tipo de experiencia
- tipo de venta
- tipo de fulfillment
- si requiere agenda
- si requiere fecha
- si permite cantidad
- si usa checkout directo o request
- si genera tickets o reserva
- estado

### 19.4 `experience_prices`
Variantes de precio de una experiencia.

Debe definir:

- nombre del tier
- precio
- moneda
- tipo de precio
- min/max personas
- descripción comercial
- badge
- orden
- activo/inactivo

### 19.5 `addons`
Complementos comprables.

Debe definir:

- nombre
- descripción
- modo comercial
- si depende de otra compra
- si es obligatorio u opcional
- si es público
- si su duración depende del principal

### 19.6 `experience_addon_rules`
Relaciona qué addons están permitidos para una experiencia y bajo qué condiciones.

### 19.7 `experience_events`
Instancias agendadas reales o ventanas reservables.

Debe definir:

- experiencia padre
- tipo de evento
- fecha/hora o rango
- timezone
- capacidad
- estado
- locación opcional

### 19.8 `experience_packages`
Producto empaquetado fijo.

Debe permitir describir una oferta compuesta de varios elementos.

### 19.9 `package_items`
Desglose estructural de lo que incluye un paquete.

Ejemplos:

- incluye 5 sesiones de yoga
- incluye concierge por 5 días
- incluye 10 comidas
- incluye hospedaje

### 19.10 `experience_pass_types`
Define paquetes consumibles.

Ejemplos:

- 5-session pass
- 10-session pass
- monthly pass

### 19.11 `orders`
Entidad transaccional principal.

Debe almacenar:

- cliente
- estado de pago
- estado de orden
- currency
- subtotales
- total
- stripe references
- snapshot de compra

### 19.12 `order_items`
Desglose de la orden.

Debe registrar:

- producto principal
- precio aplicado
- cantidad
- evento asociado si aplica
- snapshot del item

### 19.13 `tickets`
Accesos individuales derivados de una compra.

Debe registrar:

- orden padre
- customer
- event/experience asociados
- qr/code
- status
- usedAt
- snapshot

### 19.14 `passes`
Instancias compradas de un pase consumible.

Debe registrar:

- tipo de pase
- customer
- saldo inicial
- saldo restante
- expiración
- status

### 19.15 `pass_usages`
Historial de consumo de un pase.

Debe registrar:

- pase
- ticket o evento asociado
- fecha de consumo
- cantidad consumida
- nota

### 19.16 `customers`
Perfil comercial del cliente.

Puede coexistir con Appwrite Auth user, pero debe almacenar datos útiles de negocio.

### 19.17 `locations` / `rooms`
Catálogo operativo para asignaciones internas.

---

## 20. Reglas de negocio importantes

1. El sitio público muestra experiencias como contenido premium, no como un grid de compra crudo.
2. No todos los productos comparten el mismo flujo de agenda.
3. Un paquete no debe quedar solo como texto; necesita también estructura operativa.
4. Un addon puede tener reglas de venta distintas al producto principal.
5. Un pase consumible no es lo mismo que una edición multi día.
6. Un evento es una ocurrencia agendada; un paquete es una oferta compuesta.
7. Los precios pueden cambiar en el tiempo sin afectar órdenes pasadas.
8. El `root` no debe formar parte del lenguaje funcional normal del producto.
9. El acceso debe basarse en labels de Auth.
10. Las Functions sensibles deben reforzar permisos y validaciones.
11. Los cuartos/locaciones pertenecen a la operación, no necesariamente al catálogo público como producto directo.
12. Un solo checkout puede generar varios tickets individuales.

---

## 21. Estrategia Appwrite 1.9.0

### 21.1 Servicios Appwrite requeridos
El proyecto deberá usar:

- Auth
- Databases / Tables
- Storage
- Functions
- Sites
- Realtime (opcional donde aporte valor)

### 21.2 Proyecto objetivo
- Endpoint: `https://aprod.racoondevs.com/v1`
- Project ID: `omzone-dev`

### 21.3 Enfoque de seguridad
- Appwrite Auth como fuente de identidad
- labels como base del control de acceso
- permisos sensibles reforzados en Functions
- frontend con route guards por labels

### 21.4 Estrategia de Appwrite Tables
Se recomienda construir el nuevo modelo usando la estructura moderna de bases/tablas/relaciones de Appwrite 1.9.0, manteniendo snapshot JSON en órdenes y tickets donde convenga preservar el histórico.

### 21.5 Consideración práctica
Aunque Appwrite permita relaciones, no debe abusarse de relaciones para reconstruir toda la compra histórica en tiempo real. Las órdenes y tickets deben permanecer estables incluso si cambian experiencias, addons o precios.

---

## 22. Functions requeridas o altamente recomendadas

Las Functions pueden variar de nombre final, pero a nivel de requerimiento se recomienda contemplar al menos las siguientes.

### 22.1 `create-user-profile`
Crear o sincronizar perfil extendido tras alta de usuario.

### 22.2 `sync-auth-label-context`
Sincronizar o validar contexto de labels en flujos internos, si llega a requerirse una capa auxiliar de perfil.

### 22.3 `public-submit-lead`
Recibir solicitudes o formularios públicos de contacto / booking request.

### 22.4 `create-checkout-session`
Generar sesión o intención de pago con Stripe para compra directa.

### 22.5 `stripe-webhook`
Recibir confirmaciones de Stripe y actualizar órdenes, tickets y estados internos.

### 22.6 `admin-create-order`
Permitir a admin/operator generar ventas asistidas con validaciones centralizadas.

### 22.7 `issue-tickets`
Emitir tickets individuales, pases o beneficios derivados de una orden pagada.

### 22.8 `consume-pass`
Consumir saldo de un pase cuando corresponda.

### 22.9 `customer-self-service`
Actualizar datos permitidos del cliente autenticado.

### 22.10 `admin-publish-experience`
Validar y publicar una experiencia o publicación cuando se requiera lógica adicional de publicación.

### 22.11 `generate-pdf-ticket` (opcional, muy recomendable)
Generar PDF descargable de tickets o confirmaciones.

### 22.12 `scheduled-reminders` (opcional futuro)
Recordatorios automáticos previos a eventos o experiencias.

---

## 23. Storage requerido

### 23.1 Buckets sugeridos

#### `media-public`
Para imágenes públicas de experiencias, publicaciones y galerías.

#### `media-private`
Para assets internos o archivos no públicos.

#### `tickets-generated`
Para PDFs o imágenes generadas de tickets/confirmaciones.

#### `customer-documents` (opcional)
Para documentos asociados a clientes, propuestas privadas o archivos operativos.

### 23.2 Tipos de archivos contemplados
- imágenes web
- imágenes OG/SEO
- PDFs de tickets
- archivos descargables informativos
- imágenes para galerías

### 23.3 Reglas generales
- optimizar imágenes para web
- distinguir claramente entre media pública y privada
- conservar referencias estables desde publicaciones y experiencias

---

## 24. Sitio público y UX esperada

La nueva UI pública deberá evitar apariencia de marketplace tradicional.

Debe transmitir:

- experiencia premium
- wellness lifestyle
- narrativa curada
- inmersión
- elegancia visual
- espiritualidad contemporánea
- hospitalidad y transformación

Características esperadas:

- páginas por experiencia muy visuales
- bloques de contenido ricos
- agenda integrada pero elegante
- proceso de selección claro
- checkout limpio
- addons sugeridos de forma natural
- soporte multilenguaje

La UI del proyecto viejo podrá reutilizarse como base visual/estructural donde convenga, pero la lógica del sistema nuevo no deberá quedar atada a la arquitectura vieja.

---

## 25. Panel administrativo esperado

El panel debe ser suficientemente robusto para que el dueño del negocio pueda operar sin depender de desarrollo para cambios cotidianos.

Debe permitir:

- crear experiencias nuevas
- describirlas de forma editorial
- crear precios
- crear agenda
- crear addons
- construir paquetes
- vender manualmente
- revisar órdenes
- revisar tickets
- revisar clientes
- gestionar recursos
- administrar publicación pública

El panel debe estar pensado para dos perfiles principales:

- `admin`
- `operator`

---

## 26. Integración con Stripe

La plataforma deberá prepararse para Stripe como pasarela principal de pagos en checkout directo.

Debe contemplarse:

- creación de checkout sessions o payment intents
- webhook de confirmación
- mapeo entre orden local y transacción externa
- conciliación de estado de pago
- soporte para reintento o fallos de pago

No forma parte de este documento cerrar los detalles fiscales, pero sí dejar la arquitectura lista para ello.

---

## 27. SEO, contenido y marketing

El sistema debe contemplar desde arquitectura:

- metatítulos
- metadescripciones
- OG image
- slugs limpios
- indexabilidad
- contenido bilingüe cuando corresponda
- páginas institucionales
- páginas detalladas por experiencia

El SEO no debe tratarse como accesorio; forma parte central del producto público.

---

## 28. Exclusiones iniciales

Fuera del alcance inicial, salvo que se defina en siguientes fases:

- app móvil nativa
- marketplace multi-vendor
- motor avanzado de availability con bloqueos complejos por recurso en tiempo real
- facturación fiscal profunda
- CRM externo completo
- loyalty avanzado
- automations complejas omnicanal

---

## 29. Riesgos y consideraciones

1. La venta de experiencias con múltiples modos comerciales puede complicarse si se intenta meter todo en una sola estructura rígida.
2. Los paquetes y pases consumibles requieren reglas claras para no mezclar conceptos.
3. Los addons dependientes del producto principal necesitan validación fuerte en checkout.
4. Las órdenes históricas no deben depender únicamente de relaciones vivas.
5. El modelado editorial y comercial debe mantenerse separado para no contaminar el front público con lógica de backoffice.
6. El uso de labels como base de permisos simplifica, pero obliga a cuidar muy bien las validaciones server-side.
7. El `root` debe protegerse conceptualmente y no filtrarse como rol visible de negocio.

---

## 30. Decisiones de producto ya tomadas en esta fase

1. El proyecto se reconstruirá prácticamente desde cero en lógica funcional.
2. La UI anterior podrá reutilizarse parcialmente como base visual.
3. El backend base será Appwrite 1.9.0 en `aprod.racoondevs.com`.
4. El proyecto Appwrite es `omzone-dev`.
5. Los permisos se basarán en labels de Appwrite Auth.
6. Los labels base serán `root`, `admin`, `client`, `operator`.
7. OMZONE será modelado como plataforma de experiencias, no marketplace de tours.
8. El catálogo público será editorial y aspiracional.
9. Se deberán soportar experiencias individuales, agendas recurrentes, ediciones, addons, paquetes y pases consumibles.
10. Se integrará Stripe para pagos.

---

## 31. Meta inmediata posterior a este documento

La siguiente fase recomendada es construir un **documento de tasks maestras mejorado**, derivado de este requerimiento, separando el trabajo por bloques de implementación reales, por ejemplo:

1. base técnica del frontend
2. autenticación y labels
3. route guards
4. perfiles y customers
5. editorial
6. experiences
7. pricing
8. addons
9. agenda
10. orders + checkout
11. tickets + passes
12. portal de cliente
13. panel admin
14. resources operativos
15. functions + stripe + storage
16. deploy final

---

## 32. Resultado esperado del proyecto

Al finalizar la nueva versión de OMZONE, el negocio deberá contar con:

- una plataforma pública de alto valor visual y comercial
- un catálogo de experiencias bien estructurado
- un sistema flexible de agenda y venta
- soporte para addons, bundles y pases
- un panel administrativo utilizable
- un portal de cliente funcional
- integración con Appwrite 1.9.0 y Stripe
- base escalable para crecimiento posterior

---

## 33. Resumen ejecutivo final

OMZONE debe construirse como una **plataforma de experiencias wellness premium**, no como un marketplace tradicional.

Su arquitectura debe separar:

- lo editorial
- lo comercial
- la agenda
- la operación

Debe poder vender:

- experiencias individuales
- experiencias agendadas
- experiencias multi día
- addons
- paquetes fijos
- pases consumibles

Debe operar con:

- Appwrite 1.9.0
- Auth + labels como núcleo de permisos
- Tables/relaciones donde aporten valor
- snapshots históricos donde sea necesario
- Functions para lógica sensible
- Storage para media y tickets
- Stripe para pagos

Este documento es la base oficial para la reestructuración total del proyecto.
