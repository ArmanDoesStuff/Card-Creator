let deckChart = null;

export function drawDeckStats(cardList) {
    const costStats = computeCostStats(cardList);
    renderCostGraph(costStats);
}

function loadCard(name) {
    const raw = localStorage.getItem(`card_${name}`);
    return raw ? JSON.parse(raw) : null;
}

function computeCostStats(cardList) {
    const costCounts = {};
    let maxCost = 0;

    for (const cardName of cardList) {
        const card = loadCard(cardName);
        if (!card || !card.cost) continue;

        const totalCost =
            (parseInt(card.cost.red)   || 0) +
            (parseInt(card.cost.blue)  || 0) +
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
