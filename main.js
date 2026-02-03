console.log("JS loaded");


const canvas = document.getElementById("card");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "templates/frame.png"; // or any PNG you have

img.onload = () => {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};
