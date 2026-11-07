# Folhas de mercenários: mesmo processo das skins de IA (scripts/build-ai-skins.py).
# A IA repinta assets/look-gen/base_big_m.png (base 4x, fundo magenta) como cada mercenário;
# aqui a repintura é amostrada de volta sobre a silhueta exata da base 128x384,
# para reaproveitar todos os quadros/animações de player/base.
# Também converte retratos-mestres public/mercenaries/<id>.png em runtime/<id>.webp 512x512
# quando o WebP ainda não existe.
# Uso: python3 scripts/build-merc-sheets.py id1 id2 ...  (lê assets/look-gen/merc_<id>.png)
import os
import sys
from pathlib import Path
import numpy as np
from PIL import Image

base = np.asarray(Image.open("public/kaetram/img/sprites/player/base.png").convert("RGBA"))
os.makedirs("public/mercenaries/sheets", exist_ok=True)
for name in sys.argv[1:]:
    ai = np.asarray(Image.open(f"assets/look-gen/merc_{name}.png").convert("RGB").resize((512, 1536), Image.LANCZOS)).astype(int)
    out = np.zeros_like(base)
    H, W = base.shape[:2]
    for y in range(H):
        for x in range(W):
            if base[y, x, 3] < 10:
                continue
            blk = ai[y * 4 + 1:y * 4 + 3, x * 4 + 1:x * 4 + 3].reshape(-1, 3)
            r, g, b = blk.mean(axis=0)
            if r - g > 90 and b - g > 90:  # magenta vazou: usa cor da base escurecida
                r, g, b = base[y, x, :3] * 0.6
            out[y, x] = (r, g, b, 255)
    Image.fromarray(out.astype(np.uint8)).save(f"public/mercenaries/sheets/{name}.png", optimize=True)
    portrait = f"public/mercenaries/{name}.png"
    webp = f"public/mercenaries/runtime/{name}.webp"
    if not os.path.exists(webp):
        os.makedirs(os.path.dirname(webp), exist_ok=True)
        if os.path.exists(portrait):
            Image.open(portrait).convert("RGB").resize((512, 512), Image.LANCZOS).save(webp, quality=86)
        else:
            # Uses the first down-facing 32×32 cell as a crisp pixel-art roster portrait.
            frame = Image.fromarray(out.astype(np.uint8)).crop((0, 0, W // 4, H // 12))
            frame.resize((512, 512), Image.Resampling.NEAREST).save(webp, format="WEBP", lossless=True, method=6)
    print(name)

# Keep runtime registration in sync with successfully built sheets only.
sheet_files = list(Path("public/mercenaries/sheets").glob("*.png"))
legacy_ids = sorted(p.stem for p in sheet_files if not p.stem.startswith("fronteira-"))
expanded_ids = sorted(
    (p.stem for p in sheet_files if p.stem.startswith("fronteira-")),
    key=lambda value: int(value.split("-", 2)[1]),
)
def ts_array(name, values):
    body = "".join(f'  "{value}",\n' for value in values)
    return f"export const {name} = [\n{body}] as const;\n"

manifest = (
    "// Gerado por scripts/build-merc-sheets.py; contém somente folhas AI finalizadas.\n"
    + ts_array("LEGACY_AI_MERCENARY_SHEET_IDS", legacy_ids)
    + "\n"
    + ts_array("AI_EXPANDED_MERCENARY_SHEET_IDS", expanded_ids)
)
Path("src/odyssey/mercenary-skins.ts").write_text(manifest, encoding="utf-8")
