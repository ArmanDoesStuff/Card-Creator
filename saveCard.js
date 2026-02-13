import {resetAllInputs, updateVisibleInputs} from "./inputs.js";
import {drawCard, loadFrame} from "./drawCard.js";
import {exportDeckAsPNGs, exportDeckAsZip} from "./export.js";
import {drawDeckStats} from "./deckStats.js";

let currentCardId = null;
export let currentDeckId = null;
export let currentCardList = [];

export function setCurrentDeck(id) {
    currentDeckId = id;
}

export function setCurrentCardList(cardList) {
    currentCardList = cardList;
}

export function addToDeck() {
    if (!currentCardId || !currentDeckId) return;
    currentCardList.push(currentCardId);
    overwriteDeck();
    refreshCardListBox();
    setElementVisibility();
    setSelected(currentCardId, ".saved-card");
}

export function removeFromDeck() {
    if (!currentCardId || !currentDeckId) return;
    const index = currentCardList.indexOf(currentCardId);
    if (index !== -1) {
        currentCardList.splice(index, 1);
    }
    overwriteDeck();
    refreshCardListBox();
    setElementVisibility();
    setSelected(currentCardId, ".saved-card");
}

export function createDeck() {
    const deckName = document.getElementById("deckName").value.trim();
    if (!deckName) {
        return;
    }
    currentDeckId = `deck_${crypto.randomUUID()}`;
    currentCardList = [];
    saveDeck(deckName);
    refreshDecksBox();
    document.getElementById("deckName").value = "";
    setSelected(currentDeckId, "#deckBox .saved-deck");
}

function saveDeck(deckName) {
    if (!deckName) {
        console.error("No deck name set")
        return;
    }
    const data = {
        name: deckName,
        currentDeckList: currentCardList
    };
    localStorage.setItem(currentDeckId, JSON.stringify(data));
}

export function renameDeck() {
    const name = document.getElementById("deckName").value;
    saveDeck(name);
    refreshDecksBox();
    setSelected(currentDeckId, "#deckBox .saved-deck")
}

function overwriteDeck() {
    const deckName = getDeckData(currentDeckId).name;
    saveDeck(deckName);
}

export function deselectDeck() {
    currentDeckId = null;
    currentCardList = [];
    setElementVisibility();
    refreshDecksBox();
}

export function deleteDeck() {
    if (!currentDeckId) {
        return;
    }
    if (!localStorage.getItem(currentDeckId)) {
        return;
    }
    localStorage.removeItem(currentDeckId);
    currentDeckId = null;
    currentCardList = [];
    refreshDecksBox();
}

function getDeckData(deckID) {
    const raw = localStorage.getItem(deckID);
    if (!raw) {
        console.error(`failed to load ${deckID}`);
        return;
    }
    return JSON.parse(raw);
}

function loadDeck(deckID) {
    currentDeckId = deckID;
    const deck = getDeckData(deckID);
    currentCardList = deck.currentDeckList || [];  // array of strings
    pruneMissingCards();
    setElementVisibility();
    refreshCardListBox();
}

function getAllCardIds() {
    const names = [];
    for (let key in localStorage) {
        if (key.startsWith("card_")) {
            names.push(key);
        }
    }
    return names;
}

function pruneMissingCards() {
    const allCards = getAllCardIds();

    // keep only cards that still exist
    currentCardList = currentCardList.filter(id =>
        allCards.includes(id)
    );
}

export function refreshDecksBox() {
    setElementVisibility();
    const box = document.getElementById("deckBox");
    box.innerHTML = "";
    for (let id in localStorage) {
        if (id.startsWith("deck_")) {
            const deckData = getDeckData(id);
            const div = document.createElement("div");
            div.textContent = deckData.name;
            div.className = "saved-deck";
            console.log(deckData.name);
            div.addEventListener("click", () => {
                loadDeck(id);

                // remove selection from all decks
                document.querySelectorAll(".saved-deck").forEach(el =>
                    el.classList.remove("selected")
                );

                // add selection to this one
                div.classList.add("selected");
            });

            box.appendChild(div);
            div.dataset.id = id;
        }
    }
    refreshCardListBox();
}

export function selectLast(deck = true) {
    if (deck) {
        const decks = document.querySelectorAll(".saved-deck");
        if (decks.length > 0) {
            decks[decks.length - 1].click();
        }
        return;
    }
    const cards = document.querySelectorAll("#cardBox .saved-card");
    if (cards.length > 0) {
        cards[cards.length - 1].click();
    }
}

function setElementVisibility() {
    const deckElements = document.querySelectorAll(".visibleWithActiveDeck");
    const showDeckElements = currentDeckId !== null && currentCardList.length > 0;
    deckElements.forEach(el => {
        el.style.display = showDeckElements ? "" : "none";
    });

    const emptyDeckElements = document.querySelectorAll(".visibleWithEmptyDeck");
    const showEmptyDeckElements = currentDeckId !== null;
    emptyDeckElements.forEach(el => {
        el.style.display = showEmptyDeckElements ? "" : "none";
    });
}

export function refreshAllCardsBox() {
    const cardBox = document.getElementById("cardBox");
    cardBox.innerHTML = "";

    for (let key in localStorage) {
        if (key.startsWith("card_")) {
            const name = getCardData(key).name || "UNNAMED";
            const cardDiv = createSavedCardElement(key, name);
            cardBox.appendChild(cardDiv);
        }
    }
}

function refreshCardListBox() {
    const cardListBox = document.getElementById("cardListBox");
    cardListBox.innerHTML = "";
    for (let cardId of currentCardList) {
        const data = getCardData(cardId);
        if (!data) {
            return;
        }
        const name = data.name || "UNNAMED";
        const cardListDiv = createSavedCardElement(cardId, name);
        cardListBox.appendChild(cardListDiv);
    }
    drawDeckStats(currentCardList);
}

function createSavedCardElement(id, name) {
    const div = document.createElement("div");
    div.textContent = name;
    div.className = "saved-card";
    div.dataset.id = id;
    div.addEventListener("click", () => {
        loadCard(id);
        deselectCards();
        setSelected(id, ".saved-card");
    });

    return div;
}

function deselectCards() {
    document.querySelectorAll(".saved-card").forEach(el => {
        el.classList.remove("selected");
    });
}

function setSelected(id, selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.classList.toggle("selected", el.dataset.id === id);
    });
}

function formToCardData() {
    return {
        id: currentCardId,
        style: document.getElementById("cardStyle").value,
        name: document.getElementById("cardName").value,
        class: document.getElementById("cardClass").value,
        desc: document.getElementById("cardDesc").value,
        lore: document.getElementById("cardLore").value,
        attack: document.getElementById("cardAttack").value,
        defence: document.getElementById("cardDefence").value,
        cost: {
            red: document.getElementById("costRed").value,
            blue: document.getElementById("costBlue").value,
            white: document.getElementById("costWhite").value,
            green: document.getElementById("costGreen").value,
            black: document.getElementById("costBlack").value
        }
    };
}

export function newCard() {
    resetAllInputs();
    deselectCards();
    currentCardId = `card_${crypto.randomUUID()}`
}

export function copyCard() {
    if (!currentCardId) return;
    currentCardId = `card_${crypto.randomUUID()}`
    document.getElementById("cardName").value += " copy";
    saveCard();
}

export function saveCard() {
    const data = formToCardData();
    if (!data.id) return;
    const add = !localStorage.getItem(data.id);
    localStorage.setItem(data.id, JSON.stringify(data));
    refreshAllCardsBox();
    refreshCardListBox();
    setSelected(data.id, ".saved-card");
    if (add) {
        addToDeck();
    }
}

export function deleteCard() {
    if (!currentCardId) {
        return;
    }
    if (!localStorage.getItem(currentCardId)) {
        return;
    }
    localStorage.removeItem(currentCardId);
    pruneMissingCards();
    refreshAllCardsBox();
    refreshCardListBox();
}

function getCardData(id) {
    const json = localStorage.getItem(id);
    if (!json) return;
    return JSON.parse(json);
}

export function loadCard(id) {
    const data = getCardData(id);

    currentCardId = data.id;
    document.getElementById("cardStyle").value = data.style || "";
    document.getElementById("cardName").value = data.name || "";
    document.getElementById("cardClass").value = data.class || "";
    document.getElementById("cardDesc").value = data.desc || "";
    document.getElementById("cardLore").value = data.lore || "";
    document.getElementById("cardAttack").value = data.attack || "";
    document.getElementById("cardDefence").value = data.defence || "";

    document.getElementById("costRed").value = data.cost?.red || "";
    document.getElementById("costBlue").value = data.cost?.blue || "";
    document.getElementById("costWhite").value = data.cost?.white || "";
    document.getElementById("costGreen").value = data.cost?.green || "";
    document.getElementById("costBlack").value = data.cost?.black || "";

    loadFrame();
    updateVisibleInputs();
    drawCard();
    return data.name;
}

export function exportDeckPNG() {
    if (!currentDeckId || !currentCardList || currentCardList.length === 0) return;
    pruneMissingCards();
    exportDeckAsPNGs(currentCardList);
}

export function exportDeckZip() {
    if (!currentDeckId || !currentCardList || currentCardList.length === 0) return;
    pruneMissingCards();
    exportDeckAsZip(currentCardList, getDeckData(currentDeckId).name);
}