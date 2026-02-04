const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");

let frame = new Image();

// Load the correct frame based on dropdown
function loadFrame() {
  const style = document.getElementById("cardStyle").value;
  frame = new Image();
  frame.src = `templates/${style}.png`;   // e.g. templates/Leader.png
  frame.onload = () => drawFrame();
}

// Draw the frame only
function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
}

// Show/Hide the Inputs
function updateVisibleInputs() {
  const style = document.getElementById("cardStyle").value;

  document.querySelectorAll("#controls label").forEach(label => {
    const types = label.dataset.types;

    // If no data-types attribute → always show
    if (!types) {
      label.style.display = "block";
      return;
    }

    const allowed = types.split(",");
    label.style.display = allowed.includes(style) ? "block" : "none";
  });
}



// Add listeners
const styleSelect = document.getElementById("cardStyle");
styleSelect.addEventListener("change", loadFrame);
styleSelect.addEventListener("change", updateVisibleInputs);

// Initial Load
loadFrame();
updateVisibleInputs();
