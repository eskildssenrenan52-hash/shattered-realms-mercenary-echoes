import { describe, expect, it } from "vitest";
import { knownSkills } from "./skill-play";
import type { Game } from "./engine";

describe("compatibilidade de habilidades salvas", () => {
  it("não tenta iterar ranks da árvore como se fossem habilidades do grimório", () => {
    const game = { p: { spirits: ["salamando"], skills: { vigor: 2 } } } as unknown as Game;
    expect(knownSkills(game)).toEqual(["salamando"]);
  });

  it("preserva arrays de habilidades de saves antigos", () => {
    const game = { p: { spirits: ["dryad"], skills: ["barreira"] } } as unknown as Game;
    expect(knownSkills(game)).toEqual(["dryad", "barreira"]);
  });
});
