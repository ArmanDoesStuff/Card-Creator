import { refreshSavedCardsBox, refreshDecksBox, currentDeck, setCurrentDeck, setCurrentCardList } from "./saveCard.js";

export function clearAppStorage() {
    for (let key in localStorage) {
        if (key.startsWith("card_") || key.startsWith("deck_")) {
            localStorage.removeItem(key);
        }
    }
    location.reload();
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

    document.getElementById("storageTextBox").value = JSON.stringify(cards, null, 2); 
}

export function importCardsJson() {
    const input = document.getElementById("storageTextBox").value.trim();
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

export function exportDeckJson() {
    if (!currentDeck) return;

    const key = `deck_${currentDeck}`;
    const data = JSON.parse(localStorage.getItem(key));

    document.getElementById("storageTextBox").value =
        JSON.stringify(data, null, 2);
}

export function importDeckJson() {
    const input = document.getElementById("storageTextBox").value.trim();
    if (!input) return;

    let data;
    try {
        data = JSON.parse(input);
    } catch {
        alert("Invalid JSON");
        return;
    }

    if (!data.name || !Array.isArray(data.currentDeckList)) {
        alert("Deck JSON must contain { name, currentDeckList }");
        return;
    }

    // Update memory
    setCurrentDeck(data.name);
    setCurrentCardList(data.currentDeckList);

    // Save to storage
    localStorage.setItem(`deck_${data.name}`, JSON.stringify(data));

    refreshDecksBox();
}
