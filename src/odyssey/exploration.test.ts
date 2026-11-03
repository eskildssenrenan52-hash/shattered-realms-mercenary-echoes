import { describe, it, expect } from 'vitest';
import { BUILDINGS, FRONTIER_CITIES, TREASURES, ROOM, createInterior, doorOf, prepareExploration, canClaimTreasure, frontierCityAt } from './exploration';
import { generateWorld, W, H, T, SOLID, TS } from './world';
import { ITEMS, NPCS, QUESTS } from './data';
describe('Casas acessíveis como Pokémon',()=>{
  it('oferece uma porta acessível em cada casa',()=>{
    const world=generateWorld();prepareExploration(world);
    for(const b of BUILDINGS){const d=doorOf(b);expect(world.tiles[d.ty*W+d.tx]).toBe(T.DOOR);expect(SOLID.has(world.tiles[(d.ty+1)*W+d.tx])).toBe(false);}
  });
  it('permite caminhar da entrada até a saída em todos os interiores',()=>{
    for(const b of BUILDINGS){const world=createInterior(b);const start=[Math.floor(ROOM.spawnX/TS),Math.floor(ROOM.spawnY/TS)];const queue=[start];const seen=new Set<string>();while(queue.length){const p=queue.shift();if(!p)break;const [x,y]=p;const key=x+','+y;if(seen.has(key)||x<0||y<0||x>=W||y>=H||SOLID.has(world.tiles[y*W+x]))continue;seen.add(key);queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);}expect(seen.has(ROOM.exitX+','+ROOM.exitY)).toBe(true);}
  });
});
describe('Cidades de fronteira',()=>{
  it('apresenta oito cidades com três edifícios acessíveis e identidades próprias',()=>{
    expect(FRONTIER_CITIES).toHaveLength(8);
    for(const city of FRONTIER_CITIES){
      const buildings=BUILDINGS.filter((b)=>b.id.startsWith(`${city.id}_`));
      expect(buildings).toHaveLength(3);
      expect(frontierCityAt(city.tx,city.ty)?.id).toBe(city.id);
      expect(new Set(buildings.map((b)=>b.id)).size).toBe(3);
      for(const building of buildings){expect(building.accent).toBe(city.color);expect(building.note.length).toBeGreaterThan(40);}
      const keeper=NPCS.find((npc)=>npc.id===buildings[0]!.resident);
      const cityQuests=QUESTS.filter((entry)=>entry.giver===keeper?.id&&!entry.id.startsWith('deep_route_'));
      expect(keeper?.lines.length).toBeGreaterThan(0);
      expect(keeper?.interiorOnly).toBe(true);
      expect(cityQuests).toHaveLength(3);
      expect(cityQuests.every((quest)=>!quest.main)).toBe(true);
      expect(cityQuests[1]?.requires).toBe(cityQuests[0]?.id);
      expect(cityQuests[2]?.requires).toBe(cityQuests[1]?.id);
      for(const quest of cityQuests)if(quest.goal.kind==='collect')expect(ITEMS[quest.goal.item]).toBeDefined();
    }
    expect(new Set(FRONTIER_CITIES.map((c)=>c.name)).size).toBe(8);
  });
  it('não sobrepõe as áreas construídas das novas cidades',()=>{
    const cities=BUILDINGS.filter((b)=>b.id.startsWith('city_'));
    for(let i=0;i<cities.length;i++)for(let j=i+1;j<cities.length;j++){
      const a=cities[i]!,b=cities[j]!;
      const overlap=a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
      expect(overlap,`${a.name} / ${b.name}`).toBe(false);
    }
  });
});
describe('Muitos segredos',()=>{
  it('inclui santuários escondidos e dezenas de tesouros válidos',()=>{expect(BUILDINGS.filter(b=>b.secret).length).toBeGreaterThanOrEqual(4);expect(TREASURES.length).toBeGreaterThanOrEqual(30);for(const t of TREASURES){expect(ITEMS[t.item]).toBeDefined();expect(t.tx).toBeLessThan(W);expect(t.ty).toBeLessThan(H);}});
  it('não permite receber o mesmo tesouro duas vezes',()=>{const opened=new Set<string>();expect(canClaimTreasure(opened,'village-well')).toBe(true);opened.add('village-well');expect(canClaimTreasure(opened,'village-well')).toBe(false);});
});
