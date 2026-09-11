/**
 * Almacén de documentos JSON por colección.
 *  - Con DATABASE_URL / POSTGRES_URL (Neon, Vercel Postgres): tabla `documents` (jsonb) creada al vuelo.
 *  - Sin base de datos: archivo JSON en `.data/<coleccion>.json` (desarrollo) o `/tmp` (producción sin DB, efímero).
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
  list(filter?: (d: T) => boolean): Promise<T[]>;
  update(id: string, patch: Partial<T>): Promise<T | null>;
}

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
export const storageMode: "postgres" | "file" = dbUrl ? "postgres" : "file";

function fileCollection<T extends Doc>(name: string): Collection<T> {
  const dir = process.env.NODE_ENV === "production" ? path.join("/tmp", "molino-data") : path.join(process.cwd(), ".data");
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
    list: async (filter) => { const docs = await read(); return (filter ? docs.filter(filter) : docs).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    update: (id, patch) => serial(async () => {
      const docs = await read(); const i = docs.findIndex((d) => d.id === id); if (i < 0) return null;
      docs[i] = { ...docs[i], ...patch, updatedAt: new Date().toISOString() }; await write(docs); return docs[i];
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
    .then(() => undefined));
  const rows = async (): Promise<T[]> => { await ensure(); const r = await sql`SELECT data FROM documents WHERE collection = ${name} ORDER BY created_at DESC`; return r.map((x) => x.data as T); };
  return {
    insert: async (doc) => { await ensure(); await sql`INSERT INTO documents (id, collection, data) VALUES (${doc.id}, ${name}, ${JSON.stringify(doc)}::jsonb)`; return doc; },
    get: async (id) => { await ensure(); const r = await sql`SELECT data FROM documents WHERE id = ${id} AND collection = ${name}`; return (r[0]?.data as T) ?? null; },
    findOne: async (pred) => (await rows()).find(pred) ?? null,
    list: async (filter) => { const all = await rows(); return filter ? all.filter(filter) : all; },
    update: async (id, patch) => {
      await ensure(); const r = await sql`SELECT data FROM documents WHERE id = ${id} AND collection = ${name}`; const cur = r[0]?.data as T | undefined; if (!cur) return null;
      const next = { ...cur, ...patch, updatedAt: new Date().toISOString() } as T;
      await sql`UPDATE documents SET data = ${JSON.stringify(next)}::jsonb, updated_at = now() WHERE id = ${id}`; return next;
    },
  };
}

export function collection<T extends Doc>(name: string): Collection<T> {
  return storageMode === "postgres" ? pgCollection<T>(name) : fileCollection<T>(name);
}

export function newId() { return crypto.randomUUID(); }
export function nowIso() { return new Date().toISOString(); }
/** Código público legible, p. ej. MS-2026-7K3Q. */
export function publicCode(prefix: string) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = "";
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `${prefix}-${new Date().getFullYear()}-${s}`;
}
