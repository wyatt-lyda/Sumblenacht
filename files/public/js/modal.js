// public/js/modal.js
const img = document.querySelector(".intro img");
const modal = document.createElement("div");
modal.classList.add("modal");
modal.innerHTML = `<span class="modal-close">&times;</span><img class="modal-content" src="${img.src}">`;
document.body.appendChild(modal);

img.addEventListener("click", () => {
    modal.style.display = "block";
});

modal.querySelector(".modal-close").addEventListener("click", () => {
    modal.style.display = "none";
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});