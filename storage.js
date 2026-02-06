export function clearAppStorage() {
    console.log("clearing storage");
    for (let key in localStorage) {
        if (key.startsWith("card_") || key.startsWith("deck_")) {
            localStorage.removeItem(key);
        }
    }
}

