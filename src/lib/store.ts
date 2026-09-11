/**
 * Almacén de documentos JSON por colección.
 *  - Con DATABASE_URL / POSTGRES_URL (Neon, Vercel Postgres): tabla `documents` (jsonb) creada al vuelo.
 *  - Sin base de datos: archivo JSON en `.data/<coleccion>.json` (desarrollo), en `MOLINO_DATA_DIR`
 *    si se indica (volumen persistente) o en `/tmp` (producción sin DB: efímero).
 * Uso: const reservas = collection<Reserva>("reservas"); await reservas.insert(doc);
 */
import { neon } from "@neondatabase/serverless";
import { promises as fs } from "node:fs";
import path from "node:path";

export type Doc = { id: string; createdAt: string; updatedAt: string };

export interface Collection<T extends Doc> {
  insert(doc: T): Promise<T>;
  get(id: string): Promise<T | null>;
  findOne(pred: (d: T) => boolean): Promise<T | null>;
  /** Búsqueda exacta por un campo de primer nivel (usa índice en Postgres para `code` y `token`). */
  findBy(field: "code" | "token", value: string): Promise<T | null>;
  list(filter?: (d: T) => boolean): Promise<T[]>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
  /** Borrado definitivo de un documento. Devuelve `true` si existía. */
  remove(id: string): Promise<boolean>;
}

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
export const storageMode: "postgres" | "file" = dbUrl ? "postgres" : "file";

/** Carpeta del almacén en modo archivo, si el operador la fija a mano (volumen persistente). */
const customDir = process.env.MOLINO_DATA_DIR?.trim() || null;

/**
 * Dónde escribe el modo archivo: la carpeta indicada por `MOLINO_DATA_DIR`, o
 * `.data/` en desarrollo, o `/tmp/molino-data` en producción (efímero).
 */
function dataDir(): string {
  if (customDir) return customDir;
  return process.env.NODE_ENV === "production" ? path.join("/tmp", "molino-data") : path.join(process.cwd(), ".data");
}

/**
 * ¿Lo que se guarda sobrevive a un reinicio o a un despliegue nuevo? Postgres sí;
 * el modo archivo solo si escribe en una carpeta que el operador declara persistente
 * (`MOLINO_DATA_DIR`) o si estamos en desarrollo. En producción sin ninguna de las
 * dos cosas el destino es `/tmp`, que se pierde: de ahí depende, por ejemplo, que se
 * acepte o no el registro electrónico del Libro de Reclamaciones.
 */
export const storageDurable: boolean =
  storageMode === "postgres" || customDir !== null || process.env.NODE_ENV !== "production";

/** Texto para el panel de administración: dónde acaban los datos y si es duradero. */
export function storageLabel(name: string): string {
  if (storageMode === "postgres") return "Neon Postgres";
  const destino = path.join(dataDir(), `${name}.json`);
  return storageDurable ? `archivo ${destino}` : `archivo ${destino} (efímero: configura DATABASE_URL)`;
}

function fileCollection<T extends Doc>(name: string): Collection<T> {
  const dir = dataDir();
  const file = path.join(dir, `${name}.json`);
  let queue: Promise<unknown> = Promise.resolve();
  const read = async (): Promise<T[]> => {
    try { return JSON.parse(await fs.readFile(file, "utf8")) as T[]; } catch { return []; }
  };
  const write = async (docs: T[]) => { await fs.mkdir(dir, { recursive: true }); await fs.writeFile(file, JSON.stringify(docs, null, 2)); };
  const serial = <R>(fn: () => Promise<R>): Promise<R> => { const p = queue.then(fn, fn); queue = p.catch(() => undefined); return p; };
  return {
    insert: (doc) => serial(async () => { const docs = await read(); docs.push(doc); await write(docs); return doc; }),
    get: async (id) => (await read()).find((d) => d.id === id) ?? null,
    findOne: async (pred) => (await read()).find(pred) ?? null,
    findBy: async (field, value) => (await read()).find((d) => (d as Record<string, unknown>)[field] === value) ?? null,
    list: async (filter) => { const docs = await read(); return (filter ? docs.filter(filter) : docs).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    update: (id, patch) => serial(async () => {
      const docs = await read(); const i = docs.findIndex((d) => d.id === id); if (i < 0) return null;
      docs[i] = { ...docs[i], ...patch, updatedAt: new Date().toISOString() }; await write(docs); return docs[i];
    }),
    remove: (id) => serial(async () => {
      const docs = await read(); const i = docs.findIndex((d) => d.id === id); if (i < 0) return false;
      docs.splice(i, 1); await write(docs); return true;
    }),
  };
}

function pgCollection<T extends Doc>(name: string): Collection<T> {
  const sql = neon(dbUrl as string);
  let ready: Promise<void> | null = null;
  const ensure = () => (ready ??= sql`CREATE TABLE IF NOT EXISTS documents (
      id text PRIMARY KEY, collection text NOT NULL, data jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`
    .then(() => sql`CREATE INDEX IF NOT EXISTS documents_collection_idx ON documents (collection, created_at DESC)`)
    .then(() => sql`CREATE INDEX IF NOT EXISTS documents_code_idx ON documents (collection, (data->>'code'))`)
    .then(() => sql`CREATE INDEX IF NOT EXISTS documents_token_idx ON documents (collection, (data->>'token'))`)
    .then(() => undefined));
  const rows = async (): Promise<T[]> => { await ensure(); const r = await sql`SELECT data FROM documents WHERE collection = ${name} ORDER BY created_at DESC`; return r.map((x) => x.data as T); };
  return {
    insert: async (doc) => { await ensure(); await sql`INSERT INTO documents (id, collection, data) VALUES (${doc.id}, ${name}, ${JSON.stringify(doc)}::jsonb)`; return doc; },
    get: async (id) => { await ensure(); const r = await sql`SELECT data FROM documents WHERE id = ${id} AND collection = ${name}`; return (r[0]?.data as T) ?? null; },
    findOne: async (pred) => (await rows()).find(pred) ?? null,
    findBy: async (field, value) => {
      await ensure();
      const r = field === "code"
        ? await sql`SELECT data FROM documents WHERE collection = ${name} AND data->>'code' = ${value} LIMIT 1`
        : await sql`SELECT data FROM documents WHERE collection = ${name} AND data->>'token' = ${value} LIMIT 1`;
      return (r[0]?.data as T) ?? null;
    },
    list: async (filter) => { const all = await rows(); return filter ? all.filter(filter) : all; },
    update: async (id, patch) => {
      await ensure(); const r = await sql`SELECT data FROM documents WHERE id = ${id} AND collection = ${name}`; const cur = r[0]?.data as T | undefined; if (!cur) return null;
      const next = { ...cur, ...patch, updatedAt: new Date().toISOString() } as T;
      await sql`UPDATE documents SET data = ${JSON.stringify(next)}::jsonb, updated_at = now() WHERE id = ${id}`; return next;
    },
    remove: async (id) => {
      await ensure();
      const r = await sql`DELETE FROM documents WHERE id = ${id} AND collection = ${name} RETURNING id`;
      return r.length > 0;
    },
  };
}

export function collection<T extends Doc>(name: string): Collection<T> {
  return storageMode === "postgres" ? pgCollection<T>(name) : fileCollection<T>(name);
}

export function newId() { return crypto.randomUUID(); }
export function nowIso() { return new Date().toISOString(); }

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 símbolos sin ambigüedad (0/O, 1/I)

/** Año actual en hora de Lima (el servidor puede correr en UTC). */
export function limaYear(now: Date = new Date()) {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", year: "numeric" }).format(now));
}

/** Código público legible para referencia humana, p. ej. MS-2026-7K3Q. NO es un secreto: no da acceso a nada por sí solo. */
export function publicCode(prefix: string) {
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(4))) s += ALPHABET[b % ALPHABET.length];
  return `${prefix}-${limaYear()}-${s}`;
}

/** Token de acceso opaco de 130 bits (26 símbolos) para enlaces de constancia. Compáralo siempre de forma exacta. */
export function accessToken() {
  let s = "";
  for (const b of crypto.getRandomValues(new Uint8Array(26))) s += ALPHABET[b % ALPHABET.length];
  return s;
}
export const ACCESS_TOKEN_RE = /^[A-Z2-9]{26}$/;

/** Número correlativo atómico por nombre (p. ej. hojas de reclamación). En Postgres usa una SEQUENCE. */
export async function nextSequence(name: string): Promise<number> {
  const safe = name.replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  if (storageMode === "postgres") {
    const sql = neon(dbUrl as string);
    await sql.query(`CREATE SEQUENCE IF NOT EXISTS seq_${safe}`);
    const r = await sql.query(`SELECT nextval('seq_${safe}') AS n`);
    return Number((r as Array<{ n: string | number }>)[0].n);
  }
  const dir = dataDir();
  const file = path.join(dir, "sequences.json");
  await fs.mkdir(dir, { recursive: true });
  let counters: Record<string, number> = {};
  try { counters = JSON.parse(await fs.readFile(file, "utf8")) as Record<string, number>; } catch { counters = {}; }
  counters[safe] = (counters[safe] ?? 0) + 1;
  await fs.writeFile(file, JSON.stringify(counters, null, 2));
  return counters[safe];
}
