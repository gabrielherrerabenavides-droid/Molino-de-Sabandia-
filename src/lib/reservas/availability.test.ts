/**
 * Pruebas de las reglas puras de disponibilidad.
 *
 * Ejecutar:  node --experimental-strip-types --test src/lib/reservas/availability.test.ts
 *
 * El módulo se carga con `import()` dinámico y especificador calculado porque
 * Node necesita la extensión `.ts` explícita mientras TypeScript (sin
 * `allowImportingTsExtensions`) la rechaza en un import estático.
 */
import assert from "node:assert/strict";
import test from "node:test";

const A = (await import(new URL("./availability.ts", import.meta.url).href)) as typeof import("./availability");

const AHORA = new Date("2026-09-11T15:00:00Z"); // 10:00 en Lima
const MIN = "2026-09-14"; // 11 + 3 días

test("todayInTimeZone usa la hora de Lima", () => {
  assert.equal(A.todayInTimeZone(AHORA), "2026-09-11");
  // 02:00 UTC del día 12 son las 21:00 del día 11 en Lima
  assert.equal(A.todayInTimeZone(new Date("2026-09-12T02:00:00Z")), "2026-09-11");
});

test("minSelectableDate aplica 3 días de antelación", () => {
  assert.equal(A.minSelectableDate(AHORA), MIN);
  assert.equal(A.isLeadTimeOk("2026-09-13", AHORA), false);
  assert.equal(A.isLeadTimeOk(MIN, AHORA), true);
  assert.equal(A.isLeadTimeOk("2026-12-01", AHORA), true);
});

test("addDaysIso cruza meses y años sin depender de la zona local", () => {
  assert.equal(A.addDaysIso("2026-01-31", 1), "2026-02-01");
  assert.equal(A.addDaysIso("2026-12-31", 1), "2027-01-01");
  assert.equal(A.addDaysIso("2024-02-28", 1), "2024-02-29"); // año bisiesto
  assert.equal(A.addDaysIso("2026-03-01", -1), "2026-02-28");
});

test("isIsoDate rechaza fechas inexistentes", () => {
  assert.equal(A.isIsoDate("2026-02-30"), false);
  assert.equal(A.isIsoDate("2026-13-01"), false);
  assert.equal(A.isIsoDate("2026-9-1"), false);
  assert.equal(A.isIsoDate("2026-02-28"), true);
});

test("daysOfMonth devuelve todos los días del mes", () => {
  assert.equal(A.daysOfMonth("2026-02").length, 28);
  assert.equal(A.daysOfMonth("2024-02").length, 29);
  assert.equal(A.daysOfMonth("2026-09").length, 30);
  assert.equal(A.daysOfMonth("2026-09")[0], "2026-09-01");
  assert.equal(A.daysOfMonth("2026-09")[29], "2026-09-30");
});

test("una confirmada de día completo bloquea todas las franjas", () => {
  const oc = [{ date: "2026-10-10", slot: "dia" as const, status: "confirmada" as const }];
  const flags = A.slotFlags("2026-10-10", oc, AHORA);
  assert.deepEqual(flags, { manana: false, tarde: false, dia: false });
});

test("una confirmada de mañana bloquea la mañana y el día completo, no la tarde", () => {
  const oc = [{ date: "2026-10-10", slot: "manana" as const, status: "confirmada" as const }];
  const flags = A.slotFlags("2026-10-10", oc, AHORA);
  assert.deepEqual(flags, { manana: false, tarde: true, dia: false });
});

test("una confirmada de tarde bloquea la tarde y el día completo", () => {
  const oc = [{ date: "2026-10-10", slot: "tarde" as const, status: "confirmada" as const }];
  assert.deepEqual(A.slotFlags("2026-10-10", oc, AHORA), { manana: true, tarde: false, dia: false });
});

test("las pendientes no bloquean pero marcan el día como solicitado", () => {
  const oc = [{ date: "2026-10-10", slot: "dia" as const, status: "pendiente" as const }];
  const dia = A.dayAvailability("2026-10-10", oc, AHORA);
  assert.equal(dia.solicitado, true);
  assert.deepEqual(dia.slots, { manana: true, tarde: true, dia: true });
});

test("las canceladas no bloquean ni marcan", () => {
  const oc = [{ date: "2026-10-10", slot: "dia" as const, status: "cancelada" as const }];
  const dia = A.dayAvailability("2026-10-10", oc, AHORA);
  assert.equal(dia.solicitado, false);
  assert.deepEqual(dia.slots, { manana: true, tarde: true, dia: true });
});

test("las reservas de otro día no afectan", () => {
  const oc = [{ date: "2026-10-11", slot: "dia" as const, status: "confirmada" as const }];
  assert.deepEqual(A.slotFlags("2026-10-10", oc, AHORA), { manana: true, tarde: true, dia: true });
});

/**
 * Regla que aplica `actualizarEstado` antes de confirmar (service.ts): se recalcula
 * la ocupación del día con las demás reservas y se rechaza si la franja ya está
 * bloqueada. Las pendientes no bloquean, así que varias pueden acumularse y solo
 * la primera puede pasar a confirmada.
 */
type Slot = (typeof A.SLOTS)[number];
type Estado = (typeof A.RESERVA_STATUSES)[number];

function puedeConfirmar(
  propia: { id: string; date: string; slot: Slot },
  todas: Array<{ id: string; date: string; slot: Slot; status: Estado }>,
): boolean {
  const otras = todas.filter((r) => r.id !== propia.id && r.date === propia.date);
  return !A.isSlotBlocked(propia.slot, A.confirmedSlots(propia.date, otras));
}

test("confirmar revalida la disponibilidad frente a las demás reservas del día", () => {
  const a = { id: "a", date: "2026-10-10", slot: "tarde" as const, status: "pendiente" as const };
  const b = { id: "b", date: "2026-10-10", slot: "tarde" as const, status: "pendiente" as const };

  // Dos pendientes en la misma franja: ambas se pueden confirmar mientras nadie lo esté.
  assert.equal(puedeConfirmar(a, [a, b]), true);
  assert.equal(puedeConfirmar(b, [a, b]), true);

  // Confirmada la primera, la segunda choca (409).
  const confirmadaA = { ...a, status: "confirmada" as const };
  assert.equal(puedeConfirmar(b, [confirmadaA, b]), false);

  // Una reserva ya confirmada no se bloquea a sí misma (no cuenta su propia fila).
  assert.equal(puedeConfirmar(confirmadaA, [confirmadaA, b]), true);

  // "dia" y "manana" del mismo día también son incompatibles entre sí.
  const manana = { id: "c", date: "2026-10-10", slot: "manana" as const, status: "confirmada" as const };
  const diaCompleto = { id: "d", date: "2026-10-10", slot: "dia" as const, status: "pendiente" as const };
  assert.equal(puedeConfirmar(diaCompleto, [manana, diaCompleto]), false);

  // Otro día no interfiere.
  const otroDia = { id: "e", date: "2026-10-11", slot: "tarde" as const, status: "pendiente" as const };
  assert.equal(puedeConfirmar(otroDia, [confirmadaA, otroDia]), true);

  // Cancelar la confirmada libera la franja.
  const canceladaA = { ...a, status: "cancelada" as const };
  assert.equal(puedeConfirmar(b, [canceladaA, b]), true);
});

test("fuera de plazo no hay ninguna franja disponible", () => {
  const dia = A.dayAvailability("2026-09-12", [], AHORA);
  assert.equal(dia.fueraDePlazo, true);
  assert.deepEqual(dia.slots, { manana: false, tarde: false, dia: false });
});

test("buildMonthAvailability devuelve el mes completo con minDate", () => {
  const oc = [
    { date: "2026-09-20", slot: "manana" as const, status: "confirmada" as const },
    { date: "2026-09-21", slot: "tarde" as const, status: "pendiente" as const },
    { date: "2026-10-01", slot: "dia" as const, status: "confirmada" as const },
  ];
  const mes = A.buildMonthAvailability("2026-09", oc, AHORA);
  assert.equal(mes.mes, "2026-09");
  assert.equal(mes.minDate, MIN);
  assert.equal(mes.days.length, 30);
  const d20 = mes.days.find((d) => d.date === "2026-09-20");
  assert.ok(d20);
  assert.deepEqual(d20.slots, { manana: false, tarde: true, dia: false });
  const d21 = mes.days.find((d) => d.date === "2026-09-21");
  assert.ok(d21);
  assert.equal(d21.solicitado, true);
  // La reserva de octubre no debe influir en septiembre
  assert.equal(mes.days.every((d) => d.date.startsWith("2026-09")), true);
});

test("reglas del tipo de evento", () => {
  const rules = { minGuests: 30, maxGuests: 400, slots: ["tarde", "dia"] as const };
  assert.equal(A.slotAllowed("tarde", rules), true);
  assert.equal(A.slotAllowed("manana", rules), false);
  assert.equal(A.guestsWithinRange(30, rules), true);
  assert.equal(A.guestsWithinRange(29, rules), false);
  assert.equal(A.guestsWithinRange(400, rules), true);
  assert.equal(A.guestsWithinRange(401, rules), false);
  assert.equal(A.guestsWithinRange(40.5, rules), false);
});

test("dayHasAllowedSlot solo mira las franjas del tipo de evento", () => {
  const oc = [{ date: "2026-10-10", slot: "manana" as const, status: "confirmada" as const }];
  const dia = A.dayAvailability("2026-10-10", oc, AHORA);
  assert.equal(A.dayHasAllowedSlot(dia, ["manana", "dia"]), false);
  assert.equal(A.dayHasAllowedSlot(dia, ["tarde"]), true);
});

test("normalizePhonePe acepta los formatos habituales del Perú", () => {
  assert.equal(A.normalizePhonePe("987 654 321"), "+51987654321");
  assert.equal(A.normalizePhonePe("+51 987 654 321"), "+51987654321");
  assert.equal(A.normalizePhonePe("0051987654321"), "+51987654321");
  assert.equal(A.normalizePhonePe("(054) 123456"), "+5154123456");
  assert.equal(A.normalizePhonePe("054-123456"), "+5154123456");
  assert.equal(A.normalizePhonePe("12345"), null);
  assert.equal(A.normalizePhonePe("no es un teléfono"), null);
});
