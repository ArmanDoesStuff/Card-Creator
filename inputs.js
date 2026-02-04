// Show/Hide the Inputs
export function updateVisibleInputs() {
  const style = document.getElementById("cardStyle").value;

  // Select ANY element with data-types (labels, wrappers, etc.)
  document.querySelectorAll("#controls [data-types]").forEach(el => {
    const types = el.dataset.types.split(",");
    el.style.display = types.includes(style) ? "" : "none";
  });
}

export function resetAllInputs() {
  document.querySelectorAll("#controls input, #controls textarea, #controls select")
    .forEach(el => el.value = "");
}