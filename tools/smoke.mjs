/**
 * Live smoke test for the deployed StanMart site.
 *
 *   node tools/smoke.mjs [baseUrl]
 *
 * Defaults to the production URL. Override the Chrome binary with
 * CHROME_PATH and the owner credentials with ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const BASE = process.argv[2] || process.env.BASE_URL || "https://stanmart-website.vercel.app";
const PORT = Number(process.env.CHROME_PORT || 9335);
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";

const EMAIL = process.env.ADMIN_EMAIL || "owner@stanmart.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Stanmart#2026";

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.handlers = [];
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.handlers.forEach((h) => h(msg.method, msg.params));
      }
    });
  }
  send(method, params = {}) {
    this.id += 1;
    const id = this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`timeout: ${method}`));
        }
      }, 20000);
    });
  }
  on(fn) {
    this.handlers.push(fn);
  }
  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || "evaluate failed");
    }
    return result.result.value;
  }
}

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${process.env.TMP || "C:\\Temp"}\\opencode\\chrome-stanmart`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let target = null;
for (let i = 0; i < 40; i += 1) {
  await sleep(300);
  try {
    const res = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(BASE)}`, {
      method: "PUT",
    });
    if (res.ok) {
      target = await res.json();
      break;
    }
  } catch {
    /* chrome not up yet */
  }
}
if (!target) {
  chrome.kill();
  throw new Error("Could not connect to Chrome");
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});

const cdp = new CDP(ws);
await cdp.send("Page.enable");
await cdp.send("Runtime.enable");
await cdp.send("Log.enable");

let errors = [];
cdp.on((method, params) => {
  if (method === "Runtime.exceptionThrown") {
    errors.push(`exception: ${params.exceptionDetails?.exception?.description || "unknown"}`);
  }
  if (method === "Runtime.consoleAPICalled" && params.type === "error") {
    errors.push(`console: ${params.args.map((a) => a.value || a.description).join(" ")}`);
  }
  if (method === "Log.entryAdded" && params.entry.level === "error") {
    errors.push(`log: ${params.entry.text} ${params.entry.url || ""}`);
  }
});

let passed = 0;
let failed = 0;
function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ` -- ${detail}` : ""}`);
  }
}

function waitForLoad() {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 10000);
    cdp.on((method) => {
      if (method === "Page.loadEventFired") {
        clearTimeout(timer);
        resolve();
      }
    });
  });
}

async function goto(path, settle = 1500) {
  const loaded = waitForLoad();
  await cdp.send("Page.navigate", { url: `${BASE}${path}` });
  await loaded;
  await sleep(settle);
}

// 1. Home page renders with products
await goto("/");
await cdp.evaluate("window.scrollTo(0, document.body.scrollHeight)");
await sleep(6000);
await cdp.evaluate("window.scrollTo(0, 0)");
await sleep(1500);
const home = await cdp.evaluate(`(() => ({
  text: document.body.innerText.length,
  broken: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'))
}))()`);
check("home renders", home.text > 400, `text=${home.text}`);
check("home has no broken images", home.broken.length === 0, `broken=${home.broken.join(", ")}`);

// 2. Deep links work (the SPA rewrite in vercel.json)
await goto("/login");
const onLogin = await cdp.evaluate("location.pathname");
check("deep link /login serves the app", onLogin === "/login", `path=${onLogin}`);

// 3. Log in with the owner credentials
await cdp.evaluate(`(() => {
  const inputs = [...document.querySelectorAll('input')];
  const email = inputs.find(i => i.type === 'email');
  const pw = inputs.find(i => i.type === 'password');
  if (!email || !pw) return 'missing inputs';
  const set = (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  set(email, ${JSON.stringify(EMAIL)});
  set(pw, ${JSON.stringify(PASSWORD)});
  // the navbar also renders forms, so submit the one that owns the email field
  email.closest('form').requestSubmit();
  return true;
})()`);
await sleep(1500);
const session = await cdp.evaluate(`(() => {
  const raw = sessionStorage.getItem('stanmart_session');
  return raw ? JSON.parse(raw) : null;
})()`);
check(
  "owner login succeeds",
  !!session && session.email === EMAIL.toLowerCase(),
  `session=${JSON.stringify(session)}`,
);
const loginError = await cdp.evaluate(
  `document.querySelector('.auth-error') ? document.querySelector('.auth-error').innerText : ''`,
);
check("no login error shown", !loginError, loginError);

// 4. Admin route is reachable now that we are signed in
await goto("/admin");
const admin = await cdp.evaluate(`(() => ({
  path: location.pathname,
  text: document.body.innerText.length,
  hasForm: !!document.querySelector('.admin-form'),
  hasUploadZone: !!document.querySelector('.upload-drop'),
  hasExport: /Export full catalog/i.test(document.body.innerText),
  hasImport: /Import JSON/i.test(document.body.innerText),
  hasCustomHeading: /Your products \\(\\d+\\)/.test(document.body.innerText)
}))()`);
check("admin route stays on /admin", admin.path === "/admin", `path=${admin.path}`);
check("admin page renders content", admin.text > 200, `text=${admin.text}`);
check("admin page has the add-product form", admin.hasForm, "");
check("admin page has the image upload zone", admin.hasUploadZone, "");
check("admin page can export/import the catalogue", admin.hasExport && admin.hasImport, "");
check("admin page shows the custom product list", admin.hasCustomHeading, "");

// 5. Unauthenticated /admin should redirect to /login
await cdp.evaluate("sessionStorage.clear(); localStorage.clear();");
await goto("/admin");
const guard = await cdp.evaluate("location.pathname");
check("admin is guarded when signed out", guard === "/login", `path=${guard}`);

const noise = errors.filter((e) => !/favicon|404 \(Not Found\)/i.test(e));
check("no console errors", noise.length === 0, noise.join(" | "));

console.log(`\n${passed} passed, ${failed} failed`);
chrome.kill();
process.exit(failed === 0 ? 0 : 1);
