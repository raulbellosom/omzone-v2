import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_HOME_CONTENT, HOME_FIELDS, homeLanguage, homePresentation, normalizeHomeContent, serializeHomeBootstrap, validateHomeContent } from "../src/lib/homeContent.js";

test("publication requires all EN/ES fields and respects limits", () => {
  assert.equal(validateHomeContent(DEFAULT_HOME_CONTENT).valid, true);
  for (const [field, max] of Object.entries(HOME_FIELDS)) {
    assert.equal(validateHomeContent({ ...DEFAULT_HOME_CONTENT, [field]: "   " }).errors[field], "required");
    assert.equal(validateHomeContent({ ...DEFAULT_HOME_CONTENT, [field]: "a".repeat(max + 1) }).errors[field], "tooLong");
  }
});
test("normalization keeps only public fields and one brand suffix", () => {
  const result = normalizeHomeContent({ ...DEFAULT_HOME_CONTENT, seoTitle: "  Wellness — OMZONE — OMZONE  ", apiKey: "secret", ogBucketId: "unused" });
  assert.equal(result.seoTitle, "Wellness");
  assert.equal(result.apiKey, undefined);
  assert.equal(result.ogBucketId, "");
});
test("image selection requires a public bucket and a valid identifier", () => {
  assert.equal(validateHomeContent({ ...DEFAULT_HOME_CONTENT, ogImageId: "image", ogBucketId: "private" }, ["public"]).valid, false);
  assert.equal(validateHomeContent({ ...DEFAULT_HOME_CONTENT, ogImageId: "../image", ogBucketId: "public" }, ["public"]).valid, false);
  assert.equal(validateHomeContent({ ...DEFAULT_HOME_CONTENT, ogImageId: "image", ogBucketId: "public" }, ["public"]).valid, true);
});
test("Home URLs determine locale and canonical independently of preferences", () => {
  assert.equal(homeLanguage("/"), "en");
  assert.equal(homeLanguage("/es"), "es");
  assert.equal(homeLanguage("/experiences"), null);
  const result = homePresentation(DEFAULT_HOME_CONTENT, "es", { siteUrl: "https://example.test/" });
  assert.equal(result.title, DEFAULT_HOME_CONTENT.heroTitleEs);
  assert.equal(result.canonical, "https://example.test/es");
  assert.equal(result.alternates["x-default"], "https://example.test/");
});
test("bootstrap cannot close its script or inject HTML", () => {
  const value = { text: '</script><script>alert("x")</script>&\u2028\u2029' };
  const serialized = serializeHomeBootstrap(value);
  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/);
  assert.deepEqual(JSON.parse(serialized), value);
});
