import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const vite = await createServer({
  appType: "custom",
  configFile: false,
  root,
  resolve: { alias: { "@": root } },
  server: { middlewareMode: true },
});

after(async () => {
  await vite.close();
});

async function readCssTree(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const contents = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return readCssTree(entryPath);
      }
      return entry.name.endsWith(".css") ? readFile(entryPath, "utf8") : "";
    }),
  );
  return contents.join("\n");
}

test("emits the catalog's animation and scrolling utilities", async () => {
  const css = await readCssTree(path.join(root, "dist"));

  assert.match(css, /--tw-enter-opacity/);
  assert.match(css, /scrollbar-width:\s*thin/);
  assert.match(css, /scrollbar-width:\s*none/);
  assert.match(css, /scrollbar-gutter:\s*stable/);
  assert.match(css, /scroll-fade-reveal-b/);
  assert.match(css, /mask-image:/);
  assert.match(css, /tw-shimmer/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test("forwards progress semantics to the primitive", async () => {
  const { Progress } = await vite.ssrLoadModule("/components/ui/progress.tsx");
  const html = renderToStaticMarkup(React.createElement(Progress, { value: 37 }));

  assert.match(html, /aria-valuenow="37"/);
  assert.match(html, /aria-valuetext="37%"/);
  assert.match(html, /data-state="loading"/);
});

test("emits chart themes for the starter's media dark mode", async () => {
  const { ChartStyle } = await vite.ssrLoadModule("/components/ui/chart.tsx");
  const html = renderToStaticMarkup(
    React.createElement(ChartStyle, {
      id: "contract",
      config: {
        latency: { theme: { light: "#ffffff", dark: "#000000" } },
      },
    }),
  );

  assert.match(html, /\[data-chart=contract\]/);
  assert.match(html, /@media \(prefers-color-scheme: dark\)/);
  assert.doesNotMatch(html, /\.dark/);
});

test("renders sidebar skeletons deterministically", async () => {
  const { SidebarMenuSkeleton } = await vite.ssrLoadModule(
    "/components/ui/sidebar.tsx",
  );
  const first = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));
  const second = renderToStaticMarkup(React.createElement(SidebarMenuSkeleton));

  assert.equal(first, second);
  assert.match(first, /--skeleton-width:70%/);
});

test("release policy holds non-finite and negative evidence scores", async () => {
  const { evaluateGate } = await vite.ssrLoadModule("/lib/policy.ts");
  const valid = {
    deploymentId: "edge-model-1", riskScore: 10, driftScore: 10,
    evidenceDeploymentId: "edge-model-1",
    artifactSha256: "a".repeat(64),
    evidenceArtifactSha256: "a".repeat(64),
    signatureValid: true, attestationValid: true, regressionPassed: true,
    approverOneId: "security", approverOneApproved: true,
    approverTwoId: "operations", approverTwoApproved: true,
  };
  assert.equal(evaluateGate(valid).status, "approved");
  assert.equal(evaluateGate({...valid, approverTwoId: " SECURITY "}).status, "manual_hold");
  for (const invalid of [{riskScore: NaN}, {riskScore: -1}, {driftScore: Infinity}]) {
    assert.equal(evaluateGate({...valid, ...invalid}).status, "manual_hold");
  }
  assert.equal(evaluateGate({...valid, evidenceDeploymentId: "edge-model-2"}).status, "manual_hold");
  assert.equal(evaluateGate({...valid, evidenceArtifactSha256: "b".repeat(64)}).status, "manual_hold");
  assert.equal(evaluateGate({...valid, artifactSha256: "invalid"}).status, "manual_hold");
});
