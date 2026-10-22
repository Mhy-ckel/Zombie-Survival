let bgCanvas = null;

export function buildBackground(width, height) {
  const dpr = window.devicePixelRatio || 1;

  bgCanvas = document.createElement("canvas");
  bgCanvas.width = Math.max(1, Math.floor(width * dpr));
  bgCanvas.height = Math.max(1, Math.floor(height * dpr));

  const g = bgCanvas.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Seeded random so the map looks the same after every resize
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Ground base
  const base = g.createLinearGradient(0, 0, 0, height);
  base.addColorStop(0, "#22331f");
  base.addColorStop(1, "#1a2718");
  g.fillStyle = base;
  g.fillRect(0, 0, width, height);

  // Tiles with slightly different shades
  const tile = 72;
  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const shade = rand();
      g.fillStyle = shade > 0.5
        ? "rgba(255, 255, 255, " + (shade - 0.5) * 0.06 + ")"
        : "rgba(0, 0, 0, " + (0.5 - shade) * 0.12 + ")";
      g.fillRect(x, y, tile, tile);
    }
  }

  // Dirt road across the middle
  const roadY = height * 0.5;
  const roadH = Math.max(70, height * 0.18);
  const road = g.createLinearGradient(0, roadY - roadH / 2, 0, roadY + roadH / 2);
  road.addColorStop(0, "rgba(92, 72, 48, 0)");
  road.addColorStop(0.2, "rgba(92, 72, 48, 0.75)");
  road.addColorStop(0.8, "rgba(92, 72, 48, 0.75)");
  road.addColorStop(1, "rgba(92, 72, 48, 0)");
  g.fillStyle = road;
  g.fillRect(0, roadY - roadH / 2, width, roadH);

  // Dashed center line on the road
  g.fillStyle = "rgba(230, 220, 180, 0.25)";
  for (let x = 10; x < width; x += 90) {
    g.fillRect(x, roadY - 2, 44, 4);
  }

  // Dirt patches
  for (let i = 0; i < 14; i++) {
    g.fillStyle = "rgba(80, 60, 38, " + (0.12 + rand() * 0.12) + ")";
    g.beginPath();
    g.ellipse(rand() * width, rand() * height, 30 + rand() * 70, 18 + rand() * 40, rand() * Math.PI, 0, Math.PI * 2);
    g.fill();
  }

  // Grass tufts
  g.lineWidth = 1.5;
  for (let i = 0; i < 260; i++) {
    const x = rand() * width;
    const y = rand() * height;
    g.strokeStyle = rand() > 0.5 ? "rgba(90, 140, 70, 0.55)" : "rgba(60, 105, 52, 0.55)";
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - 3, y - 7);
    g.moveTo(x, y);
    g.lineTo(x + 1, y - 9);
    g.moveTo(x, y);
    g.lineTo(x + 4, y - 6);
    g.stroke();
  }

  // Stones
  for (let i = 0; i < 40; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = 2 + rand() * 5;
    g.fillStyle = "rgba(0, 0, 0, 0.25)";
    g.beginPath();
    g.ellipse(x + 1.5, y + 2, r, r * 0.7, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "rgba(120, 124, 120, 0.8)";
    g.beginPath();
    g.ellipse(x, y, r, r * 0.7, 0, 0, Math.PI * 2);
    g.fill();
  }

  // Cracks in the ground
  g.strokeStyle = "rgba(0, 0, 0, 0.3)";
  g.lineWidth = 1.2;
  for (let i = 0; i < 12; i++) {
    let x = rand() * width;
    let y = rand() * height;
    g.beginPath();
    g.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (rand() - 0.5) * 36;
      y += (rand() - 0.5) * 36;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // Dark vignette around the edges
  const vignette = g.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.35,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.55)");
  g.fillStyle = vignette;
  g.fillRect(0, 0, width, height);
}

export function drawBackground(ctx, width, height, fallbackColor) {
  if (bgCanvas) {
    ctx.drawImage(bgCanvas, 0, 0, width, height);
  } else {
    ctx.fillStyle = fallbackColor;
    ctx.fillRect(0, 0, width, height);
  }
}
