import { updateVisibleInputs } from "./inputs.js";
import { drawCard, loadFrame } from "./drawCard.js";
import { exportDeckAsPNGs, exportDeckAsZip } from "./export.js";

let currentDeck = null;
let currentCardList = [];

export function addToDeck() {
    const cardName = document.getElementById("cardName").value;
    if (!cardName || !currentDeck) return;
    currentCardList.push(cardName);
    refreshCardList();
    saveDeck();
}

export function removeFromDeck() {
    const cardName = document.getElementById("cardName").value;
    if (!cardName || !currentDeck) return;
    currentCardList = currentCardList.filter(c => c !== cardName); //TODO: Only remove the one at the element
    refreshCardList();
    saveDeck();
}

export function createDeck() {
    const name = document.getElementById("deckName").value.trim();
    if (!name) return;
    currentDeck = name;
    currentCardList = [];
    saveDeck();
    refreshDecksBox();
    setSelected(name, true);
    document.getElementById("deckName").value = "";
}

function saveDeck() {
    const data = {
        currentDeckList: currentCardList
    };

    localStorage.setItem(`deck_${currentDeck}`, JSON.stringify(data));
}

export function deselectDeck() {
    currentDeck = null;
    currentCardList = [];
    setCardListDisplay();
    refreshDecksBox();
}

export function deleteDeck() {
    if (!currentDeck) {
        return;
    }
    const key = `deck_${currentDeck}`;
    if (!localStorage.getItem(key)) {
        return;
    }
    localStorage.removeItem(key);
    currentDeck = null;
    currentCardList = [];
    refreshDecksBox();
}

function loadDeck(name) {
    const raw = localStorage.getItem(`deck_${name}`);
    if (!raw) return;

    currentDeck = name;
    document.getElementById("deckName").value = "";
    const deck = JSON.parse(raw);
    currentCardList = deck.currentDeckList || [];  // array of strings
    pruneMissingCards();
    setCardListDisplay();
    refreshCardList();
}

function getAllCardNames() {
    const names = [];
    for (let key in localStorage) {
        if (key.startsWith("card_")) {
            names.push(key.replace("card_", ""));
        }
    }
    return names;
}

function pruneMissingCards() {
    const allCards = getAllCardNames();

    // keep only cards that still exist
    currentCardList = currentCardList.filter(name =>
        allCards.includes(name)
    );
}


export function refreshDecksBox() {
    setCardListDisplay();
    const box = document.getElementById("deckBox");
    box.innerHTML = "";
    for (let key in localStorage) {
        if (key.startsWith("deck_")) {
            const name = key.replace("deck_", "");

            const div = document.createElement("div");
            div.textContent = name;
            div.className = "saved-deck";

            div.addEventListener("click", () => {
                loadDeck(name);

                // remove selection from all decks
                document.querySelectorAll(".saved-deck").forEach(el =>
                    el.classList.remove("selected")
                );

                // add selection to this one
                div.classList.add("selected");
            });

            box.appendChild(div);
        }
    }
    refreshCardList();
}

function setCardListDisplay() {
    const elements = document.querySelectorAll(".visibleWithActiveDeck");

    const show = currentDeck !== null;

    elements.forEach(el => {
        el.style.display = show ? "" : "none";
    });
}

export function refreshSavedCardsBox() {
    const cardBox = document.getElementById("cardBox");
    cardBox.innerHTML = "";

    for (let key in localStorage) {
        if (key.startsWith("card_")) {
            const name = key.replace("card_", "");

            const cardDiv = createSavedCardElement(name);
            cardBox.appendChild(cardDiv);
        }
    }
}

function refreshCardList() {
    const cardListBox = document.getElementById("cardListBox");
    cardListBox.innerHTML = "";
    for (let cardName of currentCardList) {
        const cardListDiv = createSavedCardElement(cardName);
        cardListBox.appendChild(cardListDiv);
    }
}

function createSavedCardElement(name) {
    const div = document.createElement("div");
    div.textContent = name;
    div.className = "saved-card";

    div.addEventListener("click", () => {
        loadCard(name);

        // remove selection from all cards
        document.querySelectorAll(".saved-card").forEach(el =>
            el.classList.remove("selected")
        );

        // add selection to this one
        div.classList.add("selected");
        setSelected(name);
    });

    return div;
}
function deselectCardlistCards() {
    document.querySelectorAll("#cardListBox .saved-card").forEach(el => {
        el.classList.remove("selected");
    });
}

function setSelected(name, isDeck = false) {
    const selector = isDeck
        ? "#deckBox .saved-deck"
        : "#cardBox .saved-card";

    document.querySelectorAll(selector).forEach(card => {
        card.classList.toggle("selected", card.textContent === name);
    });
}


function getCardData() {
    return {
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

export function saveCard() {
    const data = getCardData();
    const name = (data.name || "unnamed").trim();

    localStorage.setItem(`card_${name}`, JSON.stringify(data));
    addToDeck();
    refreshSavedCardsBox();
    setSelected(name);
    deselectCardlistCards();
}

export function deleteCard() {
    const name = document.getElementById("cardName").value.trim();
    if (!name) {
        return;
    }
    const key = `card_${name}`;
    if (!localStorage.getItem(key)) {
        return;
    }
    localStorage.removeItem(key);
    pruneMissingCards();
    refreshSavedCardsBox();
    refreshCardList();
}

export function loadCard(name) {
    const json = localStorage.getItem(`card_${name}`);
    if (!json) return;

    const data = JSON.parse(json);
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
}

export function exportDeckPNG() {
    if (!currentDeck || !currentCardList || currentCardList.length === 0) return;
    pruneMissingCards();
    exportDeckAsPNGs(currentCardList);
}

export function exportDeckZip() {
    if (!currentDeck || !currentCardList || currentCardList.length === 0) return;
    pruneMissingCards();
    exportDeckAsZip(currentCardList);
}