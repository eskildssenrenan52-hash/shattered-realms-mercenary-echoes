import { NPCS, type NpcDef } from "./data";
import { BUILDINGS, FRONTIER_CITIES, doorOf } from "./exploration";
import { findNearbyWalkableTile } from "./farlands";
import { W, type World } from "./world";

const cache = new WeakMap<World, NpcDef[]>();

/** Moradores do lado de fora das casas: cidades novas não podem parecer abandonadas. */
export function frontierTownNpcs(world: World): NpcDef[] {
  const cached = cache.get(world);
  if (cached) return cached;

  const cityBuildings = BUILDINGS.filter((building) => building.id.startsWith("city_"));
  const reserved = new Set<number>();

  // Preserve corredores e soleiras para que os moradores não tapem a entrada.
  for (const building of cityBuildings) {
    const door = doorOf(building);
    for (let dy = 0; dy <= 3; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x = door.tx + dx;
        const y = door.ty + dy;
        if (x >= 0 && y >= 0) reserved.add(y * W + x);
      }
    }
  }

  const residents: NpcDef[] = [];
  for (const city of FRONTIER_CITIES) {
    const buildings = cityBuildings.filter((building) => building.id.startsWith(`${city.id}_`));
    for (const building of buildings) {
      if (!building.resident) continue;
      const template = NPCS.find((npc) => npc.id === building.resident);
      if (!template) continue;

      const door = doorOf(building);
      const spot = findNearbyWalkableTile(world, door.tx + 2, door.ty + 1, reserved, 8);
      if (!spot) continue;
      reserved.add(spot.y * W + spot.x);
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const x = spot.x + dx;
          const y = spot.y + dy;
          if (x >= 0 && y >= 0) reserved.add(y * W + x);
        }
      }

      const cityKeeper = !!template.interiorOnly;
      residents.push({
        ...template,
        id: cityKeeper ? template.id : `town_${building.id}_${template.id}`,
        name: cityKeeper ? template.name : `${template.name} · ${city.name}`,
        title: template.title.includes(city.name)
          ? template.title
          : `${template.title} · ${city.name}`,
        tx: spot.x,
        ty: spot.y,
        interiorOnly: false,
      });
    }
  }

  cache.set(world, residents);
  return residents;
}
