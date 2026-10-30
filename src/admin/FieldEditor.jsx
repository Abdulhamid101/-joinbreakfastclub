// Builds a form for any piece of content automatically from its shape:
// text → input/textarea, number → number box, on/off → switch, lists →
// add/remove/reorder, groups → nested fields. That's what lets the owner
// edit every section of the site without anyone writing new admin code.
import { useId, useRef, useState } from "react";
import { HINTS, LONG, label } from "./labels";
import { api, prepareImage } from "./api";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const isHex = (v) => /^#[0-9a-f]{3,8}$/i.test(v);
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export default function FieldEditor({ name, value, onChange, parentKey, ctx }) {
  const id = useId();
  const hint = HINTS[name];
  const title = label(name);

  if (typeof value === "boolean") {
    return (
      <label className="af-switch">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="af-switch__track" aria-hidden="true" />
        <span>{title}</span>
      </label>
    );
  }

  if (typeof value === "number") {
    if (name === "meetupWeekday") {
      return (
        <Field id={id} title={title} hint={hint}>
          <select id={id} value={value} onChange={(e) => onChange(Number(e.target.value))}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </Field>
      );
    }
    return (
      <Field id={id} title={title} hint={hint}>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min="0"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </Field>
    );
  }

  if (typeof value === "string") {
    if (name === "image") return <ImageField id={id} title={title} value={value} onChange={onChange} />;
    if (parentKey === "colors" || (isHex(value) && name !== "id")) {
      return (
        <Field id={id} title={title} hint={hint}>
          <span className="af-color">
            <input type="color" value={isHex(value) && value.length === 7 ? value : "#000000"} onChange={(e) => onChange(e.target.value)} aria-label={title} />
            <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
          </span>
        </Field>
      );
    }
    const type =
      name === "date" || parentKey === "closedDates"
        ? "date"
        : name === "startTime" || name === "endTime"
          ? "time"
          : name === "email" || name === "orderEmail"
            ? "email"
            : "text";
    const long = type === "text" && (LONG.has(name) || value.length > 90);
    return (
      <Field id={id} title={title} hint={hint}>
        {long ? (
          <textarea id={id} rows={Math.min(10, Math.max(3, Math.ceil(value.length / 70)))} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </Field>
    );
  }

  if (Array.isArray(value)) {
    if (name === "options" && ctx?.optionGroups) {
      return (
        <Field title={title} hint={hint}>
          <div className="af-checks">
            {Object.entries(ctx.optionGroups).map(([key, g]) => (
              <label key={key} className="af-check">
                <input
                  type="checkbox"
                  checked={value.includes(key)}
                  onChange={(e) => onChange(e.target.checked ? [...value, key] : value.filter((v) => v !== key))}
                />
                {g.label || key}
              </label>
            ))}
          </div>
        </Field>
      );
    }
    const objects = value.length ? isObj(value[0]) : isObj(ctx?.templates?.[name]?.[0]);
    return objects ? (
      <ObjectList name={name} value={value} onChange={onChange} ctx={ctx} />
    ) : (
      <StringList name={name} value={value} onChange={onChange} hint={hint} />
    );
  }

  if (isObj(value)) {
    return (
      <fieldset className="af-group">
        {parentKey !== undefined && <legend>{title}</legend>}
        {Object.entries(value).map(([k, v]) => (
          <FieldEditor key={k} name={k} value={v} parentKey={name} ctx={ctx} onChange={(nv) => onChange({ ...value, [k]: nv })} />
        ))}
      </fieldset>
    );
  }

  return null;
}

function Field({ id, title, hint, children }) {
  return (
    <div className="af-field">
      <label className="af-label" htmlFor={id}>
        {title}
      </label>
      {children}
      {hint && <p className="af-hint">{hint}</p>}
    </div>
  );
}

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
};

function StringList({ name, value, onChange, hint }) {
  const isDate = name === "closedDates";
  return (
    <div className="af-field">
      <span className="af-label">{label(name)}</span>
      <div className="af-strings">
        {value.map((v, i) => (
          <div className="af-strings__row" key={i}>
            <input
              type={isDate ? "date" : "text"}
              value={v}
              aria-label={`${label(name)} ${i + 1}`}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <RowTools i={i} n={value.length} onMove={(d) => onChange(move(value, i, d))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          </div>
        ))}
        <button type="button" className="ab ab--soft ab--sm" onClick={() => onChange([...value, ""])}>
          + Add
        </button>
      </div>
      {hint && <p className="af-hint">{hint}</p>}
    </div>
  );
}

function RowTools({ i, n, onMove, onRemove, onDuplicate }) {
  return (
    <span className="af-tools">
      <button type="button" onClick={() => onMove(-1)} disabled={i === 0} aria-label="Move up" title="Move up">
        ↑
      </button>
      <button type="button" onClick={() => onMove(1)} disabled={i === n - 1} aria-label="Move down" title="Move down">
        ↓
      </button>
      {onDuplicate && (
        <button type="button" onClick={onDuplicate} aria-label="Duplicate" title="Duplicate">
          ⧉
        </button>
      )}
      <button
        type="button"
        className="af-tools__del"
        onClick={() => {
          if (window.confirm("Remove this item?")) onRemove();
        }}
        aria-label="Remove"
        title="Remove"
      >
        ✕
      </button>
    </span>
  );
}

const itemTitle = (item, i) => item.name || item.title || item.label || item.q || item.heading || `Item ${i + 1}`;

// A fresh item shaped like the existing ones, with text cleared.
function blankLike(v, key) {
  if (typeof v === "string") return key === "colors" || isHex(v) ? v : "";
  if (Array.isArray(v)) return v.length && isObj(v[0]) ? [blankLike(v[0])] : [];
  if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, k === "colors" ? { ...x } : blankLike(x, k)]));
  return v;
}

function ObjectList({ name, value, onChange, ctx }) {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });

  const update = (i, next) => {
    const prev = value[i];
    // Keep an item's id in step with its name while it's new.
    if ("id" in next && (next.name !== prev.name || next.title !== prev.title)) {
      const oldAuto = !prev.id || prev.id === slugify(prev.name || prev.title || "");
      if (oldAuto) next = { ...next, id: slugify(next.name || next.title || "") };
    }
    onChange(value.map((x, j) => (j === i ? next : x)));
  };

  const add = () => {
    const base = value.length ? value[value.length - 1] : ctx?.templates?.[name]?.[0] || {};
    const item = blankLike(base);
    if ("available" in item) item.available = true;
    onChange([...value, item]);
    setOpen((s) => new Set(s).add(value.length));
  };

  const duplicate = (i) => {
    const copy = structuredClone(value[i]);
    if ("id" in copy) copy.id = `${copy.id}-copy`.slice(0, 60);
    if ("name" in copy) copy.name = `${copy.name} (copy)`;
    const next = [...value];
    next.splice(i + 1, 0, copy);
    onChange(next);
  };

  return (
    <div className="af-field">
      <span className="af-label">{label(name)}</span>
      <div className="af-items">
        {value.map((item, i) => (
          <div className="af-item" key={i} data-open={open.has(i) || undefined}>
            <div className="af-item__head">
              <button type="button" className="af-item__title" onClick={() => toggle(i)} aria-expanded={open.has(i)}>
                {item.image ? <img src={item.image} alt="" /> : null}
                <span>{itemTitle(item, i)}</span>
                {item.available === false && <em className="af-pill af-pill--warn">Sold out</em>}
                {item.sizes?.[0] && typeof item.sizes[0].price === "number" && (
                  <em className="af-pill">₦{item.sizes[0].price.toLocaleString("en-NG")}</em>
                )}
              </button>
              <RowTools
                i={i}
                n={value.length}
                onMove={(d) => onChange(move(value, i, d))}
                onDuplicate={"id" in item ? () => duplicate(i) : undefined}
                onRemove={() => onChange(value.filter((_, j) => j !== i))}
              />
            </div>
            {open.has(i) && (
              <div className="af-item__body">
                {Object.entries(item).map(([k, v]) => (
                  <FieldEditor key={k} name={k} value={v} parentKey={name} ctx={ctx} onChange={(nv) => update(i, { ...item, [k]: nv })} />
                ))}
              </div>
            )}
          </div>
        ))}
        <button type="button" className="ab ab--soft ab--sm" onClick={add}>
          + Add {label(name).toLowerCase().replace(/s$/, "")}
        </button>
      </div>
    </div>
  );
}

export function ImageField({ id, title = "Image", value, onChange }) {
  const input = useRef(null);
  const [state, setState] = useState({ busy: false, error: "" });

  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setState({ busy: true, error: "" });
    try {
      const blob = await prepareImage(file);
      const { url } = await api.upload(blob);
      onChange(url);
      setState({ busy: false, error: "" });
    } catch (err) {
      setState({ busy: false, error: err.message });
    }
  }

  return (
    <div className="af-field">
      <span className="af-label" id={`${id}-l`}>
        {title}
      </span>
      <div className="af-image">
        <div className="af-image__preview">{value ? <img src={value} alt="" /> : <span>No image</span>}</div>
        <div className="af-image__actions">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} aria-labelledby={`${id}-l`} />
          <button type="button" className="ab ab--soft ab--sm" disabled={state.busy} onClick={() => input.current?.click()}>
            {state.busy ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button type="button" className="ab ab--ghost ab--sm" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      {state.error && <p className="af-error">{state.error}</p>}
      <p className="af-hint">{HINTS.image}</p>
    </div>
  );
}
