const layouts = {
  Leader: {
    name: { x: 30, y: 50 },
    cost: { x: 350, y: 50 },
    class: { x: 30, y: 90 },
    desc: { x: 30, y: 140, w: 340, lh: 22 },
    lore: { x: 30, y: 300, w: 340, lh: 22 },
    atk: { x: 30, y: 500 },
    def: { x: 200, y: 500 }
  },

  Backline: {
    name: { x: 30, y: 50 },
    cost: { x: 350, y: 50 },
    class: { x: 30, y: 90 },
    desc: { x: 30, y: 140, w: 340, lh: 22 },
    lore: { x: 30, y: 300, w: 340, lh: 22 }
  },

  Creature: {
    name: { x: 30, y: 50 },
    cost: { x: 350, y: 50 },
    class: { x: 30, y: 90 },
    desc: { x: 30, y: 140, w: 340, lh: 22 },
    atk: { x: 30, y: 500 },
    def: { x: 200, y: 500 },
    lore: { x: 30, y: 540, w: 340, lh: 22 }
  },

  Structure: {
    name: { x: 30, y: 50 },
    cost: { x: 350, y: 50 },
    class: { x: 30, y: 90 },
    desc: { x: 30, y: 140, w: 340, lh: 22 },
    def: { x: 30, y: 500 },
    lore: { x: 30, y: 540, w: 340, lh: 22 }
  },

  Stratagem: {
    name: { x: 30, y: 50 },
    cost: { x: 350, y: 50 },
    class: { x: 30, y: 90 },
    desc: { x: 30, y: 140, w: 340, lh: 22 }
  }
};

const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");

let frame = new Image();

// Load the correct frame based on dropdown
function loadFrame() {
  const style = document.getElementById("cardStyle").value;
  frame = new Image();
  frame.src = `templates/${style}.png`;   // e.g. templates/Leader.png
  frame.onload = () => drawCard();
  document.getElementById("cardStyle").addEventListener("change", drawCard);
  document.querySelectorAll("#controls input, #controls textarea")
    .forEach(el => el.addEventListener("input", drawCard));
}

// Draw Card
function drawCard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);

  const style = document.getElementById("cardStyle").value;
  const L = layouts[style];

  const name = document.getElementById("cardName").value;
  const cost = document.getElementById("cardCost").value;
  const cardClass = document.getElementById("cardClass").value;
  const desc = document.getElementById("cardDesc").value;
  const lore = document.getElementById("cardLore").value;
  const atk = document.getElementById("cardAttack").value;
  const def = document.getElementById("cardDefence").value;

  ctx.fillStyle = "black";

  // NAME
  if (L.name) {
    ctx.font = "28px Arial";
    ctx.fillText(name, L.name.x, L.name.y);
  }

  // COST
  if (L.cost && cost) {
    ctx.font = "22px Arial";
    ctx.fillText(cost, L.cost.x, L.cost.y);
  }

  // CLASS
  if (L.class && cardClass) {
    ctx.font = "20px Arial";
    ctx.fillText(cardClass, L.class.x, L.class.y);
  }

  // DESCRIPTION
  if (L.desc && desc) {
    ctx.font = "20px Arial";
    wrapText(desc, L.desc.x, L.desc.y, L.desc.w, L.desc.lh);
  }

  // LORE
  if (L.lore && lore) {
    ctx.font = "18px Arial";
    wrapText(lore, L.lore.x, L.lore.y, L.lore.w, L.lore.lh);
  }

  // ATK
  if (L.atk && atk) {
    ctx.font = "24px Arial";
    ctx.fillText("ATK: " + atk, L.atk.x, L.atk.y);
  }

  // DEF
  if (L.def && def) {
    ctx.font = "24px Arial";
    ctx.fillText("DEF: " + def, L.def.x, L.def.y);
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


// Show/Hide the Inputs
function updateVisibleInputs() {
  const style = document.getElementById("cardStyle").value;

  document.querySelectorAll("#controls label").forEach(label => {
    const types = label.dataset.types;

    // If no data-types attribute → always show
    if (!types) {
      label.style.display = "block";
      return;
    }

    const allowed = types.split(",");
    label.style.display = allowed.includes(style) ? "block" : "none";
  });
}



// Add listeners
const styleSelect = document.getElementById("cardStyle");
styleSelect.addEventListener("change", loadFrame);
styleSelect.addEventListener("change", updateVisibleInputs);

// Initial Load
loadFrame();
updateVisibleInputs();
