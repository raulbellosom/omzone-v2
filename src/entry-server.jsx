import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import AppProviders from "./AppProviders";
import env from "./config/env";
import { homeLanguage } from "./lib/homeContent";

export const publicConfig = {
  siteUrl: env.siteUrl, appwriteEndpoint: env.appwriteEndpoint,
  appwriteProjectId: env.appwriteProjectId, appwriteDatabaseId: env.appwriteDatabaseId,
  collectionHomeContent: env.collectionHomeContent,
  allowedBuckets: env.imageBuckets.map((bucket) => bucket.id),
};

export function render(url, bootstrap) {
  const language = homeLanguage(new URL(url, bootstrap.config.siteUrl).pathname);
  // React 19 hoists metadata into <head>; Helmet 3 no longer fills context.helmet.
  // Render a document so native hoisting and client hydration agree on ownership.
  const document = renderToString(
    <html lang={language}><head /><body><div id="root">
      <AppProviders Router={StaticRouter} routerProps={{ location: url }} bootstrap={bootstrap} />
    </div></body></html>,
  );
  const parts = document.match(/<head>([\s\S]*?)<\/head><body><div id="root">([\s\S]*)<\/div><\/body><\/html>$/);
  if (!parts) throw new Error("Unexpected server document structure");
  return {
    html: parts[2], head: parts[1], htmlAttributes: `lang="${language}"`,
  };
}
