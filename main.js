import { drawCard, loadFrame } from "./drawCard.js";
import { updateVisibleInputs, resetAllInputs } from "./inputs.js";
import { saveCard, deleteCard, refreshSavedCardsBox, saveDeck, deleteDeck, addToDeck, removeFromDeck } from "./saveCard.js"


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
document.getElementById("saveCardBtn").addEventListener("click", saveCard);
document.getElementById("deleteCardBtn").addEventListener("click", deleteCard);
document.getElementById("clearCardBtn").addEventListener("click", resetAllInputs);

document.getElementById("addToDeckBtn").addEventListener("click", addToDeck);
document.getElementById("removeFromDeckBtn").addEventListener("click", removeFromDeck);

document.getElementById("saveDeckBtn").addEventListener("click", saveDeck);
document.getElementById("deleteDeckBtn").addEventListener("click", deleteDeck);

// Initial Load
loadFrame();
updateVisibleInputs();
costIds.forEach(id => { document.getElementById(id).addEventListener("change", drawCard); });
refreshSavedCardsBox();