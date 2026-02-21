// ------------------ Carousel ------------------
let slideIndex = 0;
const slides = document.querySelectorAll(".carousel-slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

function showSlide(n) {
    const container = document.querySelector(".carousel-container");
    slides.forEach(slide => slide.style.display = "none");
    slideIndex = (n + slides.length) % slides.length;
    slides[slideIndex].style.display = "block";

    // Adjust container height to current image
    const img = slides[slideIndex].querySelector("img");
    container.style.height = img.offsetHeight + "px";
}

// Initialize carousel
if (slides.length > 0) showSlide(slideIndex);

// Arrow click events
if (prevBtn) prevBtn.addEventListener("click", () => showSlide(slideIndex - 1));
if (nextBtn) nextBtn.addEventListener("click", () => showSlide(slideIndex + 1));

// ------------------ Logout ------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/logout");
            if (res.redirected) window.location.href = res.url;
        } catch (err) {
            console.error("Logout failed:", err);
        }
    });
}

// ------------------ Display username ------------------
const welcomeUser = document.getElementById("welcomeUser");
async function displayUsername() {
    if (!welcomeUser) return;

    try {
        const res = await fetch("/username"); // your server route should return { username: "..." }
        const data = await res.json();

        if (data.username) {
            welcomeUser.textContent = `Welcome, ${data.username}!`;
            // Hide login/signup links if logged in
            const loginLink = document.querySelector(".login-link");
            const signupLink = document.querySelector(".signup-link");
            if (loginLink) loginLink.style.display = "none";
            if (signupLink) signupLink.style.display = "none";
        } else {
            welcomeUser.innerHTML = '<i class="fas fa-snowflake"></i>';
        }
    } catch (err) {
        console.error("Failed to fetch username:", err);
    }
}

// Call it on page load
window.addEventListener("DOMContentLoaded", displayUsername);