import {resetAllInputs, updateVisibleInputs} from "./inputs.js";
import {drawCard, loadFrame} from "./drawCard.js";
import {exportDeckAsPNGs, exportDeckAsZip} from "./export.js";
import {drawDeckStats} from "./deckStats.js";
import {layouts} from "./layouts.js";

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
    refreshCardListsBox();
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
    refreshCardListsBox();
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
    refreshCardListsBox();
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
    refreshCardListsBox();
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

function refreshCardListsBox() {
    const cardDataGroups = getCardsData(currentCardList);
    refreshCardBox(cardDataGroups, "cardListBox")
    drawDeckStats(currentCardList);
}

export function refreshAllCardsBox() {
    const cardDataGroups = getCardsData(Object.keys(localStorage));
    refreshCardBox(cardDataGroups, "cardBox");
}

function refreshCardBox(cardDataGroups, boxName) {
    const cardBox = document.getElementById(boxName);
    cardBox.innerHTML = "";


    // Loop through each style group
    for (const [style, cards] of Object.entries(cardDataGroups)) {

        // --- Style header ---
        const header = document.createElement("div");
        header.className = "saved-title";
        header.textContent = style;
        cardBox.appendChild(header);

        // --- Cards under this style ---
        for (const data of cards) {
            const totalCost = Object.values(data.cost).reduce((sum, v) => sum + Number(v), 0);
            const name = data.name || "UNNAMED";
            const cardDiv = createSavedCardElement(data, name, totalCost);
            cardBox.appendChild(cardDiv);
        }
    }
}


function createSavedCardElement(data, name, totalCost) {
    const div = document.createElement("div");
    div.className = "saved-card";
    div.dataset.id = data.id;

    // Name on the left
    const label = document.createElement("span");
    label.textContent = name;
    div.appendChild(label);

    if (data.style !== "Backline") {

        // Left-side single-number strip
        const leftStrip = document.createElement("div");
        leftStrip.className = "left-strip";
        leftStrip.textContent = totalCost;   // or whatever number you want
        div.appendChild(leftStrip);

        // Right-side strip container
        const container = document.createElement("div");
        container.className = "strip-container";
        div.appendChild(container);

        // Determine active colours from cost
        let activeColours = Object.entries(data.cost)
            .filter(([key, value]) => Number(value) > 0);

        // If more than one colour, remove relic
        if (activeColours.length > 1) {
            activeColours = activeColours.filter(([key]) => key !== "relic");
        }

        // Sort strips by cost
        activeColours = activeColours
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .map(([key]) => layouts.Colours[key]);

        // Add one strip per active colour
        activeColours.forEach(col => {
            const strip = document.createElement("div");
            strip.className = "colour-strip";
            strip.style.background = col;
            container.appendChild(strip);
        });
    }

    div.addEventListener("click", () => {
        loadCard(data.id);
        deselectCards();
        setSelected(data.id, ".saved-card");
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
    refreshCardListsBox();
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
    refreshCardListsBox();
}

function getCardData(id) {
    const json = localStorage.getItem(id);
    if (!json) return;
    return JSON.parse(json);
}

const STYLE_ORDER = [
    "Leader",
    "Creature",
    "Structure",
    "Augment",
    "Stratagem",
    "Backline"
];

function getCardsData(ids) {
    // Filter only card IDs
    const filtered = ids.filter(id => id.startsWith("card_"));

    // Load + parse card data
    const data = filtered
        .map(id => localStorage.getItem(id))
        .filter(json => json)
        .map(json => JSON.parse(json));

    // Sort by total cost
    data.sort((b, a) => {
        const sumA = Object.values(a.cost).reduce((n, v) => n + Number(v), 0);
        const sumB = Object.values(b.cost).reduce((n, v) => n + Number(v), 0);

        // Primary: total cost (descending)
        const diff = sumB - sumA;
        if (diff !== 0) return diff;

        // Secondary: name (ascending)
        return a.name.localeCompare(b.name);
    });

    // Group by style
    const grouped = {};
    for (const card of data) {
        if (!grouped[card.style]) grouped[card.style] = [];
        grouped[card.style].push(card);
    }

    // Return groups in the same order as STYLE_ORDER
    const ordered = {};
    for (const style of STYLE_ORDER) {
        if (grouped[style]) {
            ordered[style] = grouped[style];
        }
    }

    return ordered;
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
    document.getElementById("levelCost").value = data.levelCost || "";

    document.getElementById("costAsh").value = data.cost?.ash || "";
    document.getElementById("costTech").value = data.cost?.tech || "";
    document.getElementById("costStoic").value = data.cost?.stoic || "";
    document.getElementById("costChem").value = data.cost?.chem || "";
    document.getElementById("costRelic").value = data.cost?.relic || "";

    loadFrame();
    updateVisibleInputs();
    drawCard();
    return data.name;
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
        levelCost: document.getElementById("levelCost").value,
        cost: {
            ash: document.getElementById("costAsh").value,
            tech: document.getElementById("costTech").value,
            stoic: document.getElementById("costStoic").value,
            chem: document.getElementById("costChem").value,
            relic: document.getElementById("costRelic").value
        }
    };
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