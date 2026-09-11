// Capturas de la portada para revisión visual. Uso: node scripts/shots.mjs [baseUrl] [outDir]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3011";
const outDir = process.argv[3] ?? "./shots";
const path = process.argv[4] ?? "/";
const name = process.argv[5] ?? "home";

const VIEWPORTS = [
  { id: "desktop", width: 1440, height: 900 },
  { id: "mobile", width: 390, height: 844 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    isMobile: vp.id === "mobile",
    hasTouch: vp.id === "mobile",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("requestfailed", (req) => errors.push(`REQUEST FAILED ${req.url()}`));

  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = () => {
        y += window.innerHeight * 0.8;
        window.scrollTo(0, y);
        if (y < document.body.scrollHeight) setTimeout(step, 110);
        else setTimeout(resolve, 500);
      };
      step();
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
    offenders: Array.from(document.querySelectorAll("body *"))
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
      .slice(0, 10)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 70)} → ${Math.round(el.getBoundingClientRect().right)}`),
  }));

  await page.screenshot({ path: `${outDir}/${name}-${vp.id}.png`, fullPage: true });
  console.log(`[${vp.id}] scrollWidth=${overflow.scrollWidth} innerWidth=${overflow.innerWidth}`);
  if (overflow.offenders.length) console.log(`[${vp.id}] desbordes:`, overflow.offenders);
  if (errors.length) console.log(`[${vp.id}] consola:`, [...new Set(errors)].slice(0, 8));
  await context.close();
}

await browser.close();
console.log("listo");
