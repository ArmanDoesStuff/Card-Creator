import { refreshSavedCardsBox } from "./saveCard.js";

export function clearAppStorage() {
    console.log("clearing storage");
    for (let key in localStorage) {
        if (key.startsWith("card_") || key.startsWith("deck_")) {
            localStorage.removeItem(key);
        }
    }
}

export function exportCardsJson() {
    const cards = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key.startsWith("card_")) {
            const data = JSON.parse(localStorage.getItem(key));
            cards.push(data);
        }
    }

    document.getElementById("exportOutput").value = JSON.stringify(cards, null, 2); 
}

export function importCardsJson() {
    const input = document.getElementById("exportOutput").value.trim();
    if (!input) return;

    let cards;
    try {
        cards = JSON.parse(input);
    } catch (e) {
        alert("Invalid JSON");
        return;
    }

    // Expecting an array of card objects
    if (!Array.isArray(cards)) {
        alert("JSON must be an array of cards");
        return;
    }

    // Save each card using your existing naming scheme
    for (const card of cards) {
        if (!card.name) continue; // skip invalid entries
        const key = `card_${card.name.trim()}`;
        localStorage.setItem(key, JSON.stringify(card));
    }

    // Refresh UI
    refreshSavedCardsBox();
}
