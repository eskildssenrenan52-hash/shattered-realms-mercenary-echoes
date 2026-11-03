import { describe, expect, it } from "vitest";
import { ITEMS } from "./data";
import { H, T, TS, W, type World, solidAt } from "./world";
import {
  MAP_SECRET_CHUNK_COUNT,
  MAP_SECRET_TOTAL,
  mapSecretById,
  mapSecretsInChunk,
  mapSecretsInRect,
} from "./map-secrets";

function openWorld(): World {
  return { tiles: new Uint8Array(W * H).fill(T.GRASS), biomes: new Uint8Array(W * H), nodes: [] };
}

describe("Segredos locais do mapa", () => {
  it("distribui exatamente 44.350 locais entre setores consultados sob demanda", () => {
    let total = 0;
    for (let i = 0; i < MAP_SECRET_CHUNK_COUNT; i++) total += mapSecretsInChunk(i);
    expect(MAP_SECRET_CHUNK_COUNT).toBe(1_200);
    expect(total).toBe(MAP_SECRET_TOTAL);
    expect(total + 650).toBe(45_000);
    expect(mapSecretsInChunk(-1)).toBe(0);
    expect(mapSecretsInChunk(MAP_SECRET_CHUNK_COUNT)).toBe(0);
  });

  it("gera os mesmos IDs/posições no mesmo mundo, sem colisões dentro do setor", () => {
    const world = openWorld();
    const first = mapSecretsInRect(world, 0, 0, 79, 79);
    const second = mapSecretsInRect(world, 0, 0, 79, 79);
    expect(first).toHaveLength(mapSecretsInChunk(0));
    expect(second.map((s) => [s.id, s.tx, s.ty])).toEqual(first.map((s) => [s.id, s.tx, s.ty]));
    expect(new Set(first.map((s) => s.id)).size).toBe(first.length);
    expect(new Set(first.map((s) => `${s.tx},${s.ty}`)).size).toBe(first.length);
    for (const secret of first) {
      expect(secret.key).toBe(`map-secret:${secret.id}`);
      expect(ITEMS[secret.item]).toBeDefined();
      expect(solidAt(world, secret.tx * TS + 8, secret.ty * TS + 8)).toBe(false);
    }
    expect(mapSecretById(world, first[0]!.id)).toEqual(first[0]);
    expect(mapSecretById(world, "invalid")).toBeUndefined();
  });
});
