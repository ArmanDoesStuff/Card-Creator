
import { layouts } from "./layouts.js";

const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");
let frame = new Image();

// Load the correct frame based on dropdown
export function loadFrame() {
  const style = document.getElementById("cardStyle").value;
  frame = new Image();
  frame.src = `templates/${style}.png`;   // e.g. templates/Leader.png
  frame.onload = () => drawCard();
  document.getElementById("cardStyle").addEventListener("change", drawCard);
  document.querySelectorAll("#controls input, #controls textarea")
    .forEach(el => el.addEventListener("input", drawCard));
}

// Draw Card
export function drawCard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cardScale = 0.6;
  canvas.width = frame.width * cardScale;
  canvas.height = frame.height * cardScale;;
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

  const style = document.getElementById("cardStyle").value;
  const L = layouts[style];

  const name = document.getElementById("cardName").value;
  const cardClass = document.getElementById("cardClass").value;
  const desc = document.getElementById("cardDesc").value;
  const lore = document.getElementById("cardLore").value;
  const atk = document.getElementById("cardAttack").value;
  const def = document.getElementById("cardDefence").value;
  const costs = [
    { value: document.getElementById("costRed").value, color: "#780422" },
    { value: document.getElementById("costBlue").value, color: "#6c92fa" },
    { value: document.getElementById("costWhite").value, color: "#bb984d" },
    { value: document.getElementById("costGreen").value, color: "#90be23" },
    { value: document.getElementById("costBlack").value, color: "black" }
  ].filter(c => c.value); // keep only non‑zero ones

  // COST

  if (costs.length > 0 && L.cost) {
    ctx.font = "18px Arial";
    let x = 0;
    const y = L.cost.y;
    const letterWidth = 25;
    const totalWidth = costs.length * letterWidth;
    if (style === "Leader") {
      x = L.cost.x - totalWidth / 2;
    } else {
      x = L.cost.x - totalWidth;
    }
    costs.forEach(c => {
      ctx.fillStyle = c.color;
      ctx.fillText(c.value, x, y);
      x += letterWidth;
    });
  }
  // Set colour
  ctx.fillStyle = "black";

  // NAME
  if (L.name && name) {
    ctx.font = "bold 28px Arial";
    ctx.textAlign = ["Leader", "Backline"].includes(style) ? "center" : "left";
    ctx.fillText(name, L.name.x, L.name.y);
  }

  // CLASS
  if (L.class && cardClass) {
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText(cardClass, L.class.x, L.class.y);
  }

  // DESCRIPTION
  if (L.desc && desc) {
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    wrapText(desc, L.desc.x, L.desc.y, L.desc.w, L.desc.lh);
  }

  // LORE
  if (L.lore && lore) {
    ctx.font = "italic 18px Arial";
    ctx.textAlign = "center";

    wrapText(lore, L.lore.x, L.lore.y, L.lore.w, L.lore.lh);
  }

  // ATK
  if (L.atk && atk) {
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(atk, L.atk.x, L.atk.y);
  }

  // DEF
  if (L.def && def) {
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(def, L.def.x, L.def.y);
  }
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  if (!text) return;

  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}