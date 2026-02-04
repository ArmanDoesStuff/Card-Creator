import { drawCard, loadFrame } from "./drawCard.js";
import { updateVisibleInputs } from "./inputs.js";


// Add listeners
const styleSelect = document.getElementById("cardStyle");
styleSelect.addEventListener("change", () => {
  loadFrame();
  updateVisibleInputs();
});
const costIds = ["costRed", "costBlue", "costWhite", "costGreen", "costBlack"];
costIds.forEach(id => {
  const select = document.getElementById(id);
  for (let i = 0; i <= 9; i++) {
    const opt = document.createElement("option");
    opt.value = i === 0 ? "" : String(i); opt.textContent = i;
    select.appendChild(opt);
  }
});

// Initial Load
loadFrame();
updateVisibleInputs();
costIds.forEach(id => { document.getElementById(id).addEventListener("change", drawCard); });
