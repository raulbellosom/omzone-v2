# Publicación de Home y SEO en producción

El panel `/admin/hero-slides` permite editar contenido y SEO EN/ES en dos pestañas. **Guardar y publicar** persiste ambas en Appwrite. `/` muestra inglés y `/es` español. Los slides conservan sus operaciones independientes.

Producción requiere **Nginx + un proceso Node**. Copiar solo `dist` seguirá dando una SPA y no habilitará el HTML dinámico. Los ejemplos usan `/srv/omzone/current`, usuario `omzone` y Node en `/usr/bin/node`: adaptarlos a las rutas y usuario reales del VPS.

## Development y comprobación local

El Site `omzone-v2` conserva `npm run build` y `dist`, con lectura de textos desde el navegador y noindex en el HTML de los builds del proyecto de development. No ejecuta este SSR. El esquema de `omzone-dev` ya se inicializó; el script puede repetirse sin sobrescribir contenido:

```sh
node scripts/seed-home-content.mjs --project omzone-dev --env-file .env
npm run build:ssr
npm run test:home
npm run start:ssr
```

El servidor escucha en `127.0.0.1:3000`. Sin configuración adicional usa `noindex`. Para que el origen de canonical sea el local, establecer `PUBLIC_SITE_URL=http://localhost:3000` en el proceso. `npm run dev` y `npm run preview` sirven el modo SPA, no son pruebas de SSR.

```sh
curl -i http://localhost:3000/
curl -i http://localhost:3000/es
```

Pruebas adicionales: `node tests/home-browser.mjs` (Puppeteer instalado por la dependencia de desarrollo `md-to-pdf`; permite `CHROME_BIN` para Chrome/Edge) y `node tests/home-appwrite.mjs` (solo `omzone-dev`, crea y elimina fixtures; requiere API key en `.env`).

## Preparar el lanzamiento de producción

1. Confirmar `.env.prod` con proyecto **`omzone`**, endpoint correcto, `VITE_SITE_URL=https://omzone.com`, `VITE_UNDER_CONSTRUCTION=false`. El identificador de base es `omzone_db`; la nueva colección usa `home_content` por defecto. `APPWRITE_COLLECTION_HOME_CONTENT=home_content` es opcional. No copiar `.env` de development al VPS.
2. Ejecutar el alta **una vez sobre el proyecto explícito de producción**, desde una máquina con credenciales. Este paso aún no se ha ejecutado como parte del desarrollo:

   ```sh
   node scripts/seed-home-content.mjs --project omzone --env-file .env.prod
   ```

   La clave necesita administrar la colección, atributos y documento inicial. Solo se utiliza para el alta. Si detecta permisos/esquema incompatibles, el script se detiene. No aplicar un push global de `appwrite.json` a producción para esta migración. El script no copia cambios editoriales de development: producción se inicializa con los textos originales si aún no existe el documento.
3. Construir con Node 22 y las dependencias del lockfile:

   ```sh
   npm ci
   npm run build:production
   npm run test:home
   ```

   Este comando usa **modo `prod`**, porque el archivo del proyecto se llama `.env.prod`. `npm run build` por sí solo no selecciona ese archivo ni genera servidor. El build verifica que el proyecto sea `omzone`. Las claves `APPWRITE_API_KEY` no se exponen a Vite; cualquier variable `VITE_*` debe ser pública.
4. Preparar un directorio de release con `dist/`, `dist-ssr/`, `server/`, `src/lib/homeContent.js`, `package.json` y `package-lock.json`. Instalar allí `npm ci --omit=dev`. No se necesitan `.env`, API keys, Vite ni el SDK de administración en el proceso de ejecución. Conservar juntos los bundles cliente/servidor de la misma compilación y el release anterior para rollback.
5. Ajustar e instalar [omzone-home.service](../../deploy/omzone-home.service) para el usuario y directorio reales. Node debe poder leer el release. El servicio enlaza solo loopback y se inicia con `HOME_NOINDEX=false` únicamente en producción. El dominio se configura con `PUBLIC_SITE_URL`, no con la cabecera Host recibida.

   ```sh
   sudo systemctl daemon-reload
   sudo systemctl enable --now omzone-home
   curl -i http://127.0.0.1:3000/healthz
   curl -i http://127.0.0.1:3000/es
   ```

6. Incorporar [nginx-home.conf](../../deploy/nginx-home.conf) **dentro del server HTTPS existente**, manteniendo TLS, redirecciones y cabeceras propias del sitio. Combinar sus locations con las existentes; no duplicar `location /`. El root debe apuntar al `dist` del mismo release del servicio. Revisar que ninguna caché/CDN ignore `Cache-Control: no-store` para `/` y `/es`.

   ```sh
   sudo nginx -t
   sudo systemctl reload nginx
   ```

No existe acceso/configuración del VPS en esta entrega: estos comandos constituyen el procedimiento de despliegue, no evidencia de que se haya ejecutado.

## Aceptación en el dominio real

- `curl -i https://omzone.com/` y `/es`: 200, H1 y descripción publicados dentro del body, title/description/canonical únicos dentro de head, tres enlaces hreflang, idioma correcto. No debe haber `noindex` ni `X-Robots-Tag: noindex` heredados de staging. `/es/` redirige a `/es`.
- Guardar un cambio editorial de prueba desde el panel y comprobar el siguiente GET, sin reiniciar ni recompilar. Restaurar el texto aprobado. Comprobar EN y ES; no usar solo el inspector DOM después de ejecutar JavaScript.
- Abrir con una preferencia de idioma distinta en localStorage: la URL determina Home y no hay errores de hidratación. Navegar al catálogo y volver por logo/Home. Verificar acceso al panel y al portal con sus roles existentes.
- Revisar la imagen social con una solicitud anónima, `robots.txt` y `sitemap.xml` (incluye `/es`). Los buscadores deciden cuándo rastrean y actualizan sus resultados.
- Revisar `journalctl -u omzone-home`: no debe registrar datos de sesión ni credenciales. `/healthz` verifica que el proceso está vivo; no verifica Appwrite. Monitorizar también GET `/` para detectar 503 de contenido.

La suite local cubre fallos de Appwrite, timeout, documento inválido, fallback 503, escape de texto y cambios sin rebuild. No provocar una caída del backend de producción para probarlos.

## Actualizaciones y rollback

Para cambios de código, construir otro release, comprobarlo y activar su ruta coordinadamente con Nginx y el servicio; reiniciar `omzone-home`. No mezclar un `dist` nuevo con un renderer antiguo. Conservar temporalmente assets del release anterior si se necesita soportar pestañas abiertas.

Para rollback, volver al release y configuración Nginx anteriores, comprobar `nginx -t` y reiniciar/reconfigurar el servicio según corresponda. Si se vuelve al hosting estático previo se pierde temporalmente el SSR dinámico. No eliminar `home_content` ni sobrescribir sus textos: conservar el documento permite reactivar el renderer después.

Para cambios de contenido no se despliega nada: **Guardar y publicar** actualiza el documento. Los visitantes nuevos reciben la publicación; las pestañas abiertas se actualizan al recargar. Ante fallos de Appwrite se sirve 503, `Retry-After: 60`, `no-store` y el último contenido válido de ese proceso o los valores iniciales. No hay promesa de historial editorial ni resolución de ediciones simultáneas.
