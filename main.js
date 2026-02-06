import { drawCard, loadFrame } from "./drawCard.js";
import { exportCurrentCardAsPNG } from "./export.js";
import { updateVisibleInputs, resetAllInputs } from "./inputs.js";
import { saveCard, deleteCard, refreshSavedCardsBox, createDeck, deleteDeck, deselectDeck, addToDeck, removeFromDeck, refreshDecksBox, exportDeckPNG, exportDeckZip } from "./saveCard.js"
import {clearAppStorage} from "./storage.js"


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

document.getElementById("createDeckBtn").addEventListener("click", createDeck);
document.getElementById("deleteDeckBtn").addEventListener("click", deleteDeck);
document.getElementById("deselectDeckBtn").addEventListener("click", deselectDeck);

document.getElementById("clearStorageBtn").addEventListener("click", clearAppStorage);

document.getElementById("exportImageBtn").addEventListener("click", exportCurrentCardAsPNG);
document.getElementById("exportDeckPngBtn").addEventListener("click", exportDeckPNG);
document.getElementById("exportDeckZipBtn").addEventListener("click", exportDeckZip);

// Initial Load
loadFrame();
updateVisibleInputs();
costIds.forEach(id => { document.getElementById(id).addEventListener("change", drawCard); });
refreshSavedCardsBox();
refreshDecksBox();