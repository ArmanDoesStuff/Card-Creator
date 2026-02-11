export function drawDeckStats(cardList) {
    const costStats = computeCostStats(cardList);
    renderCostGraph(costStats);

    const colourTotals = computeColourStats(cardList);
    const colourPercentages = computeColourPercentages(colourTotals);
    renderColourBar(colourPercentages);
}

function loadCard(name) {
    const raw = localStorage.getItem(`card_${name}`);
    return raw ? JSON.parse(raw) : null;
}

//Cost Bar
let deckChart = null;

function computeCostStats(cardList) {
    const costCounts = {};
    let maxCost = 0;

    for (const cardName of cardList) {
        const card = loadCard(cardName);
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
                backgroundColor: "#4a90e2"
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

//Colour Bar

function computeColourStats(cardList) {
    const totals = { red: 0, blue: 0, white: 0, green: 0, black: 0 };

    for (const cardName of cardList) {
        const card = loadCard(cardName);
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
        red: "#e74c3c",
        blue: "#3498db",
        white: "#ecf0f1",
        green: "#2ecc71",
        black: "#2c3e50"
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
