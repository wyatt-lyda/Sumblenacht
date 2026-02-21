const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch("/login", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if(data.success) window.location.href = "/";
        else errorMsg.textContent = data.message || "Login failed";
    } catch(err){
        errorMsg.textContent = "Server error";
        console.error(err);
    }
});