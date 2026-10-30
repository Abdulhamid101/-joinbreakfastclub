// Generates the admin secrets to paste into Vercel → Settings →
// Environment Variables. Run:  npm run admin:setup
// Nothing is saved to disk or sent anywhere.
import crypto from "node:crypto";
import readline from "node:readline";
import { base32Encode, hashPassword, totpAt } from "../api/_lib/auth.js";

// Reads a line without echoing it when run in a real terminal.
function ask(question, { hidden = false } = {}) {
  process.stdout.write(question);
  if (!hidden || !process.stdin.isTTY) {
    return new Promise((resolve) => {
      const rl = readline.createInterface({ input: process.stdin });
      rl.once("line", (line) => {
        rl.close();
        resolve(line);
      });
    });
  }
  return new Promise((resolve) => {
    let value = "";
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");
    const onData = (ch) => {
      if (ch === "\r" || ch === "\n" || ch === "\u0004") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.off("data", onData);
        process.stdout.write("\n");
        resolve(value);
      } else if (ch === "\u0003") {
        process.exit(1);
      } else if (ch === "\u007f" || ch === "\b") {
        if (value) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        value += ch;
        process.stdout.write("*".repeat(ch.length));
      }
    };
    process.stdin.on("data", onData);
  });
}

function strength(pw) {
  const problems = [];
  if (pw.length < 12) problems.push("at least 12 characters");
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) problems.push("upper and lower case letters");
  if (!/\d/.test(pw)) problems.push("a number");
  if (!/[^A-Za-z0-9]/.test(pw)) problems.push("a symbol");
  return problems;
}

console.log("\nBreakfast Club — admin setup\n");
let password;
for (;;) {
  password = await ask("Choose the admin password: ", { hidden: true });
  const problems = strength(password);
  if (problems.length) {
    console.log(`  Too weak — needs ${problems.join(", ")}.\n`);
    continue;
  }
  const again = await ask("Type it again: ", { hidden: true });
  if (again !== password) {
    console.log("  They don't match, try again.\n");
    continue;
  }
  break;
}

const hash = await hashPassword(password);
const sessionSecret = crypto.randomBytes(48).toString("base64url");
const totpSecret = base32Encode(crypto.randomBytes(20));
const label = encodeURIComponent("Breakfast Club:admin");
const otpauth = `otpauth://totp/${label}?secret=${totpSecret}&issuer=${encodeURIComponent("Breakfast Club")}&algorithm=SHA1&digits=6&period=30`;

console.log(`
──────────────────────────────────────────────────────────────────────
Add these in Vercel → your project → Settings → Environment Variables
(Environment: Production, and Preview if you use it). Mark them Sensitive.
──────────────────────────────────────────────────────────────────────

ADMIN_PASSWORD_HASH
${hash}

ADMIN_SESSION_SECRET
${sessionSecret}

ADMIN_TOTP_SECRET            (2-step login — strongly recommended)
${totpSecret}

──────────────────────────────────────────────────────────────────────
2-step login: on the owner's phone open Google Authenticator (or Authy,
Microsoft Authenticator) → + → "Enter a setup key":
   Account:  Breakfast Club admin
   Key:      ${totpSecret.match(/.{1,4}/g).join(" ")}
   Type:     Time based
Or turn this link into a QR code and scan it:
   ${otpauth}

Check: the app should show ${totpAt(totpSecret, Math.floor(Date.now() / 30000))} right now (it changes every 30s).
──────────────────────────────────────────────────────────────────────
Then redeploy. Give the owner the password + authenticator, nothing else.
`);
