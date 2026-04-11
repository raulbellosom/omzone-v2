# TASK-064: Legal Pages — Terms, Privacy Policy, Refund Policy (Bilingual)

## Objetivo

Implementar las tres páginas legales requeridas para operar pagos con Stripe y cumplir con legislación mexicana (LFPDPPP) y estándares internacionales (GDPR): Términos de Servicio, Política de Privacidad y Política de Reembolso. Contenido bilingüe ES/EN con español como versión legalmente vinculante.

## Contexto

- Stripe requiere que merchants tengan refund policy y terms of service visibles antes de procesar pagos.
- Las páginas `TermsPage.jsx` y `PrivacyPage.jsx` existen como placeholders con texto "coming soon".
- No existe `RefundPolicyPage.jsx`.
- La Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México exige aviso de privacidad.
- Prerrequisito para TASK-066 (Stripe Payment Element con consent checkbox).

## Alcance

- Reescribir `TermsPage.jsx` con estructura de secciones renderizadas desde i18n
- Reescribir `PrivacyPage.jsx` con contenido LFPDPPP-compliant
- Crear `RefundPolicyPage.jsx`
- Registrar ruta `/refund-policy` en `App.jsx`
- Agregar `REFUND_POLICY` a `constants/routes.js`
- Agregar link en footer (PublicLayout)
- Contenido completo bilingüe EN/ES en `landing.json`

## Fuera de alcance

- Cookie consent banner (task separada)
- Políticas de operador/admin
- Contratos con facilitadores

## Dominio

- [x] Editorial (contenido público, SEO)
- [x] Transaccional (términos de compra, reembolsos)

## Entidades / tablas implicadas

Ninguna — contenido estático vía i18n.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `TermsPage` | público | modificar | Estructura de secciones |
| `PrivacyPage` | público | modificar | Estructura de secciones |
| `RefundPolicyPage` | público | crear | Nueva página |
| `PublicLayout` footer | público | modificar | Agregar link refund |

## Criterios de aceptación

- [x] Las 3 páginas renderizan correctamente en EN y ES
- [x] SEOHead con title, description y canonical únicos en cada página
- [x] Footer tiene links a las 3 páginas legales
- [x] Contenido cubre: uso de plataforma, compras, datos personales, terceros (Stripe), reembolsos
- [x] Versión ES es la legalmente vinculante (indicado en cada página)
- [x] Responsive en móvil (lectura cómoda)

## Dependencias

- Ninguna

## Estimación de complejidad

Simple — contenido estático + i18n.
