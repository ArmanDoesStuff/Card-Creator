import { loadCard } from "./saveCard.js";
import JSZip from "https://esm.run/jszip";

export function exportCurrentCardAsPNG() {
    const input = document.getElementById("cardName");
    let name = input?.value?.trim();
    if (!name) name = "card";
    exportCardAsPNG(name);
}

export async function exportDeckAsPNGs(cardList) {
    for (const cardName of cardList) {
        loadCard(cardName)      // update preview
        await waitForDOM();      // wait for DOM to render
        await exportCardAsPNG(cardName);  // export PNG
    }
}

export async function exportCardAsPNG(name) {
    const card = document.getElementById("card");
    await waitForDOM(); // ensure the frame is visible
    const canvas = await html2canvas(card, { scale: 2 });
    const link = document.createElement("a");
    link.download = name + ".png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

async function renderCardToPNG(name) {
    const card = document.getElementById("card");
    await waitForDOM();
    const canvas = await html2canvas(card, { scale: 2 });
    // Return the raw PNG data (base64)
    return canvas.toDataURL("image/png").split(",")[1];
}

export async function exportDeckAsZip(cardList) {
    const zip = new JSZip();

    for (const cardName of cardList) {
        loadCard(cardName);
        await waitForDOM();

        const pngData = await renderCardToPNG(cardName);

        // Add to ZIP
        zip.file(`${cardName}.png`, pngData, { base64: true });
    }

    // Generate ZIP and download
    const blob = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "deck_export.zip";
    link.click();
}

function waitForDOM() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}
