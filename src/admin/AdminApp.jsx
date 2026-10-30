import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaults, groups, sections } from "../data/registry";
import { validateOverrides } from "../data/validate";
import { api } from "./api";
import EventsEditor from "./EventsEditor";
import FieldEditor from "./FieldEditor";
import "./admin.css";

const IDLE_MS = 30 * 60 * 1000;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Every item in a list gets every field its siblings have (e.g. a new
// drink gets "options" even if the last item was a bite).
function normalise(key, value) {
  const def = defaults[key];
  if (!Array.isArray(def) || !def.length || typeof def[0] !== "object") return value;
  const union = {};
  for (const item of def) for (const [k, v] of Object.entries(item)) if (!(k in union)) union[k] = v;
  const blank = (v) => (typeof v === "string" ? "" : Array.isArray(v) ? [] : v);
  return value.map((item) => {
    const out = {};
    for (const [k, v] of Object.entries(union)) out[k] = k in item ? item[k] : k === "colors" ? { ...v } : blank(v);
    return out;
  });
}

function buildDraft(overrides) {
  return Object.fromEntries(
    Object.keys(sections).map((k) => [k, normalise(k, structuredClone(k in overrides ? overrides[k] : defaults[k]))])
  );
}

// Only sections that differ from the code defaults get saved.
function toOverrides(draft) {
  const out = {};
  for (const [k, v] of Object.entries(draft)) if (!same(v, normalise(k, defaults[k]))) out[k] = v;
  return out;
}

export default function AdminApp() {
  const [status, setStatus] = useState({ loading: true });

  useEffect(() => {
    document.title = "Admin · Breakfast Club";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    api
      .me()
      .then((me) => setStatus({ loading: false, ...me }))
      .catch((err) => setStatus({ loading: false, error: err.message }));
  }, []);

  if (status.loading) return <div className="admin admin--center"><p>Loading…</p></div>;
  if (status.error) return <Shell><Notice title="Can't open the admin">{status.error}</Notice></Shell>;
  if (!status.setup?.ready) return <Shell><SetupNeeded setup={status.setup} /></Shell>;
  if (!status.authed) {
    return (
      <Login
        totp={status.setup.totp}
        flash={status.flash}
        onDone={() => setStatus({ ...status, authed: true, flash: null })}
      />
    );
  }
  return <Dashboard onLoggedOut={(msg) => setStatus({ ...status, authed: false, flash: msg })} />;
}

function Shell({ children }) {
  return (
    <div className="admin admin--center">
      <div className="admin-card">{children}</div>
    </div>
  );
}

function Notice({ title, children }) {
  return (
    <>
      <h1 className="admin-card__title">{title}</h1>
      <p>{children}</p>
    </>
  );
}

function SetupNeeded({ setup = {} }) {
  const row = (ok, text) => (
    <li data-ok={ok || undefined}>
      {ok ? "✓" : "✗"} {text}
    </li>
  );
  return (
    <>
      <h1 className="admin-card__title">Admin isn't switched on yet</h1>
      <p>The site owner's developer needs to finish setup in Vercel (see ADMIN-SETUP.md):</p>
      <ul className="admin-checklist">
        {row(setup.storage, "Storage connected (Upstash Redis)")}
        {row(setup.password, "ADMIN_PASSWORD_HASH set")}
        {row(setup.secret, "ADMIN_SESSION_SECRET set")}
        {row(setup.totp, "ADMIN_TOTP_SECRET set (2-step login — recommended)")}
      </ul>
    </>
  );
}

function Login({ totp, flash, onDone }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [state, setState] = useState({ busy: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: "" });
    try {
      await api.login(password, code);
      setPassword("");
      onDone();
    } catch (err) {
      setState({ busy: false, error: err.message });
      setCode("");
    }
  }

  return (
    <div className="admin admin--center">
      <form className="admin-card admin-login" onSubmit={submit}>
        <p className="admin-brand">
          <i aria-hidden="true" /> Breakfast Club
        </p>
        <h1 className="admin-card__title">Website admin</h1>
        {flash && <p className="admin-msg admin-msg--ok">{flash}</p>}
        <div className="af-field">
          <label className="af-label" htmlFor="pw">Password</label>
          <input id="pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required maxLength={256} autoFocus />
        </div>
        {totp && (
          <div className="af-field">
            <label className="af-label" htmlFor="code">6-digit code from your authenticator app</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
        )}
        {state.error && <p className="af-error" role="alert">{state.error}</p>}
        <button className="ab ab--primary ab--block" disabled={state.busy}>
          {state.busy ? "Checking…" : "Log in"}
        </button>
        <p className="af-hint admin-login__note">Protected area. Every login is logged and the owner is alerted.</p>
      </form>
    </div>
  );
}

function Dashboard({ onLoggedOut }) {
  const [doc, setDoc] = useState(null); // { version, updatedAt }
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState("calendar");
  const [msg, setMsg] = useState(null); // { type, text }
  const [busy, setBusy] = useState(false);

  const handleError = useCallback(
    (err) => {
      if (err.status === 401) onLoggedOut("Your session ended. Please log in again.");
      else setMsg({ type: "error", text: err.message });
    },
    [onLoggedOut]
  );

  const load = useCallback(async () => {
    try {
      const data = await api.content();
      const d = buildDraft(data.overrides || {});
      setDoc({ version: data.version, updatedAt: data.updatedAt });
      setSaved(d);
      setDraft(structuredClone(d));
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = draft && saved && !same(draft, saved);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const h = (e) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // Log out automatically after 30 minutes without activity.
  const last = useRef(Date.now());
  useEffect(() => {
    const bump = () => (last.current = Date.now());
    const evs = ["pointerdown", "keydown", "scroll"];
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(async () => {
      if (Date.now() - last.current > IDLE_MS) {
        clearInterval(t);
        await api.logout().catch(() => {});
        onLoggedOut("You were logged out after 30 minutes of inactivity.");
      }
    }, 30000);
    return () => {
      clearInterval(t);
      evs.forEach((e) => window.removeEventListener(e, bump));
    };
  }, [onLoggedOut]);

  async function publish() {
    const overrides = toOverrides(draft);
    try {
      validateOverrides(overrides);
    } catch (err) {
      setMsg({ type: "error", text: `Fix this first — ${err.message}` });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const res = await api.save(overrides, doc.version);
      setDoc({ version: res.version, updatedAt: res.updatedAt });
      setSaved(structuredClone(draft));
      setMsg({ type: "ok", text: "Published! Changes are live on the site within about 20 seconds." });
    } catch (err) {
      handleError(err);
    } finally {
      setBusy(false);
    }
  }

  async function logout(all) {
    if (dirty && !window.confirm("You have unpublished changes. Log out anyway?")) return;
    try {
      await (all ? api.logoutAll() : api.logout());
    } catch {
      /* already logged out */
    }
    onLoggedOut(all ? "Logged out on every device." : "Logged out.");
  }

  const ctx = useMemo(
    () => ({
      optionGroups: draft?.optionGroups,
      templates: Object.fromEntries(Object.entries(sections).map(([k, s]) => [k, s.itemTemplate ? [s.itemTemplate] : undefined])),
    }),
    [draft?.optionGroups]
  );

  if (!draft) return <div className="admin admin--center"><p>{msg?.text || "Loading content…"}</p></div>;

  const setSection = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="admin">
      <header className="admin-top">
        <p className="admin-brand">
          <i aria-hidden="true" /> Breakfast Club <span>Admin</span>
        </p>
        <nav className="admin-top__actions">
          <a className="ab ab--ghost ab--sm" href="/" target="_blank" rel="noopener">
            View site ↗
          </a>
          <button type="button" className="ab ab--ghost ab--sm" onClick={() => logout(false)}>
            Log out
          </button>
        </nav>
      </header>

      <div className="admin-body">
        <nav className="admin-tabs" aria-label="Sections">
          {[...groups, { id: "security", label: "History & security" }].map((g) => (
            <button key={g.id} type="button" aria-current={tab === g.id ? "page" : undefined} onClick={() => setTab(g.id)}>
              {g.label}
            </button>
          ))}
        </nav>

        <main className="admin-main">
          {msg && (
            <div className={`admin-msg admin-msg--${msg.type}`} role={msg.type === "error" ? "alert" : "status"}>
              {msg.text}
              <button type="button" onClick={() => setMsg(null)} aria-label="Dismiss">✕</button>
            </div>
          )}

          {tab === "calendar" && (
            <>
              <EventsEditor
                events={draft.events}
                onChange={setSection("events")}
                calendarPage={draft.calendarPage}
                meetupWeekday={draft.shop.meetupWeekday}
              />
              <SectionPanel k="calendarPage" draft={draft} saved={saved} setDraft={setDraft} ctx={ctx} />
            </>
          )}

          {tab === "security" && (
            <Security
              doc={doc}
              dirty={dirty}
              onRestored={load}
              onError={handleError}
              onLogoutAll={() => logout(true)}
              setMsg={setMsg}
            />
          )}

          {tab !== "calendar" &&
            tab !== "security" &&
            Object.entries(sections)
              .filter(([, s]) => s.group === tab)
              .map(([k]) => <SectionPanel key={k} k={k} draft={draft} saved={saved} setDraft={setDraft} ctx={ctx} />)}
        </main>
      </div>

      <div className="admin-save" data-dirty={dirty || undefined}>
        <span>
          {dirty
            ? "You have unpublished changes."
            : `All changes published${doc.updatedAt ? ` · last ${new Date(doc.updatedAt).toLocaleString("en-GB")}` : ""}`}
        </span>
        <span className="admin-save__btns">
          <button
            type="button"
            className="ab ab--ghost"
            disabled={!dirty || busy}
            onClick={() => window.confirm("Throw away your unpublished changes?") && setDraft(structuredClone(saved))}
          >
            Discard
          </button>
          <button type="button" className="ab ab--primary" disabled={!dirty || busy} onClick={publish}>
            {busy ? "Publishing…" : "Publish changes"}
          </button>
        </span>
      </div>
    </div>
  );
}

function SectionPanel({ k, draft, saved, setDraft, ctx }) {
  const s = sections[k];
  const changed = !same(draft[k], saved[k]);
  const custom = !same(draft[k], normalise(k, defaults[k]));
  return (
    <details className="admin-panel">
      <summary>
        <span>{s.label}</span>
        {changed && <em className="af-pill af-pill--new">Unpublished</em>}
      </summary>
      <div className="admin-panel__body">
        <FieldEditor name={k} value={draft[k]} ctx={ctx} onChange={(v) => setDraft((d) => ({ ...d, [k]: v }))} />
        {custom && (
          <button
            type="button"
            className="ab ab--ghost ab--sm admin-panel__reset"
            onClick={() =>
              window.confirm(`Put "${s.label}" back to the original website text?`) &&
              setDraft((d) => ({ ...d, [k]: normalise(k, structuredClone(defaults[k])) }))
            }
          >
            Reset to original
          </button>
        )}
      </div>
    </details>
  );
}

function Security({ doc, dirty, onRestored, onError, onLogoutAll, setMsg }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.history().then(setData).catch(onError);
  }, [doc.version, onError]);

  async function restore(version) {
    if (dirty) {
      setMsg({ type: "error", text: "Publish or discard your current changes before restoring an old version." });
      return;
    }
    if (!window.confirm(`Restore the site to version ${version}? (You can undo this from the same list.)`)) return;
    try {
      await api.restore(version, doc.version);
      setMsg({ type: "ok", text: `Restored version ${version}. It's live now.` });
      onRestored();
    } catch (err) {
      onError(err);
    }
  }

  const when = (iso) => new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const ACTIONS = {
    login: "Logged in",
    "login-failed": "Wrong password/code",
    "login-blocked": "Login blocked (too many tries)",
    logout: "Logged out",
    "logout-all": "Logged out everywhere",
    save: "Published changes",
    restore: "Restored old version",
    upload: "Uploaded image",
  };

  return (
    <div className="admin-sec">
      <section className="admin-panel admin-panel--flat">
        <h2>Security</h2>
        <p className="af-hint">
          Lost a phone or think someone else has the password? Log out every device now, then change the
          password in Vercel.
        </p>
        <button type="button" className="ab ab--danger" onClick={onLogoutAll}>
          Log out on all devices
        </button>
      </section>

      <section className="admin-panel admin-panel--flat">
        <h2>Version history</h2>
        <p className="af-hint">Current version: {doc.version}. Restore any earlier version if something goes wrong.</p>
        {!data ? (
          <p>Loading…</p>
        ) : data.history.length === 0 ? (
          <p className="af-hint">No earlier versions yet.</p>
        ) : (
          <ul className="admin-log">
            {data.history.map((h) => (
              <li key={h.version}>
                <span>
                  <strong>Version {h.version}</strong> · {h.updatedAt ? when(h.updatedAt) : "original"}
                </span>
                <button type="button" className="ab ab--soft ab--sm" onClick={() => restore(h.version)}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-panel admin-panel--flat">
        <h2>Activity log</h2>
        {data && (
          <ul className="admin-log admin-log--compact">
            {data.audit.map((a, i) => (
              <li key={i} data-warn={a.action.startsWith("login-") || undefined}>
                <span>
                  <strong>{ACTIONS[a.action] || a.action}</strong>
                  {a.version ? ` · v${a.version}` : ""}
                </span>
                <span className="af-hint">
                  {when(a.at)} · {a.ip}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
