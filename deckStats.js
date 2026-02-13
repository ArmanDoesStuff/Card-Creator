import {layouts} from "./layouts.js";
import {currentDeckId} from "./saveCard.js";

export function drawDeckStats(cardList) {
    // Card counts
    const detailStats = computeDeckDetailStats(cardList);
    renderDeckDetails(detailStats);

    // Cost curve
    const costStats = computeCostStats(cardList);
    renderCostGraph(costStats);

    // Style curve
    const styleStats = computeStyleStats(cardList);
    renderStyleGraph(styleStats);

    // Colour distribution bar
    const colourTotals = computeColourStats(cardList);
    const colourPercentages = computeColourPercentages(colourTotals);
    renderColourBar(colourPercentages);
}

function loadCard(id) {
    const raw = localStorage.getItem(id);
    return raw ? JSON.parse(raw) : null;
}

//Card Counts

function computeDeckDetailStats(cardList) {
    let leaderCount = 0;
    let backlineCount = 0;
    let otherCount = 0;

    for (const cardId of cardList) {
        const card = loadCard(cardId);
        if (!card || !card.style) continue;

        if (card.style === "Leader") leaderCount++;
        else if (card.style === "Backline") backlineCount++;
        else otherCount++;
    }

    return {leaderCount, backlineCount, otherCount};
}

function renderDeckDetails(stats) {
    const div = document.getElementById("cardCounts");

    div.innerHTML = `
        <div>Leader: ${stats.leaderCount}/1</div>
        <div>Regulars: ${stats.otherCount}/50</div>
        <div>Backlines: ${stats.backlineCount}/9</div>
    `;
}

//Cost Bar
let deckChart = null;

function computeCostStats(cardList) {
    const costCounts = {};
    let maxCost = 0;

    for (const cardId of cardList) {
        const card = loadCard(cardId);
        if (!card || !card.cost) continue;

        const totalCost =
            (parseInt(card.cost.red) || 0) +
            (parseInt(card.cost.blue) || 0) +
            (parseInt(card.cost.white) || 0) +
            (parseInt(card.cost.green) || 0) +
            (parseInt(card.cost.black) || 0);

        costCounts[totalCost] = (costCounts[totalCost] || 0) + 1;

        if (totalCost > maxCost) {
            maxCost = totalCost;
        }
    }

    // Fill missing buckets from 0 → maxCost
    for (let i = 0; i <= maxCost; i++) {
        if (!costCounts[i]) {
            costCounts[i] = 0;
        }
    }

    return costCounts;
}

function renderCostGraph(costCounts) {
    const ctx = document.getElementById("deckStatsCanvas").getContext("2d");

    const labels = Object.keys(costCounts);
    const values = Object.values(costCounts);

    if (deckChart) deckChart.destroy(); // clean redraw

    deckChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Card Costs",
                data: values,
                backgroundColor: layouts.Colours.relic
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                }
            }
        }
    });
}

//Style Bar
let styleChart = null;

function computeStyleStats(cardList) {
    const styles = ["Creature", "Structure", "Augment", "Stratagem"];
    const totals = Object.fromEntries(styles.map(s => [s, 0]));

    for (const cardId of cardList) {
        const card = loadCard(cardId);
        if (!card || !card.style) continue;

        if (totals.hasOwnProperty(card.style)) {
            totals[card.style]++;
        }
    }

    return totals;
}

function renderStyleGraph(styleStats) {
    const ctx = document.getElementById("styleStatsCanvas").getContext("2d");

    const labels = Object.keys(styleStats);
    const values = Object.values(styleStats);

    if (styleChart) {
        styleChart.destroy();
    }

    styleChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Card Styles",
                data: values,
                backgroundColor: [
                    layouts.Colours.rage, // Creature
                    layouts.Colours.stoic, // Structure
                    layouts.Colours.chem, // Augment
                    layouts.Colours.tech  // Stratagem
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {display: false}
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        stepSize: 1
                    }
                }
            }
        }
    });
}


//Colour Bar

function computeColourStats(cardList) {
    const totals = {red: 0, blue: 0, white: 0, green: 0, black: 0};

    for (const cardId of cardList) {
        const card = loadCard(cardId);
        if (!card || !card.cost) continue;

        for (const colour in totals) {
            totals[colour] += parseInt(card.cost[colour]) || 0;
        }
    }

    return totals;
}


function computeColourPercentages(totals) {
    const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;

    const percentages = {};
    for (const colour in totals) {
        percentages[colour] = (totals[colour] / sum) * 100;
    }
    return percentages;
}

function renderColourBar(percentages) {
    const bar = document.getElementById("colourBar");
    bar.innerHTML = "";

    const colours = {
        red: layouts.Colours.rage,
        blue: layouts.Colours.tech,
        white: layouts.Colours.stoic,
        green: layouts.Colours.chem,
        black: layouts.Colours.relic
    };

    for (const colour in percentages) {
        const width = percentages[colour];

        const segment = document.createElement("div");
        segment.className = "colour-segment";
        segment.style.width = width + "%";
        segment.style.background = colours[colour];

        bar.appendChild(segment);
    }
}
