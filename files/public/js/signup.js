const signupForm = document.getElementById("signupForm");
const errorMsg = document.getElementById("errorMsg");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("/signup", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({username, email, password})
        });
        const data = await res.json();
        if(data.success) window.location.href = "/";
        else errorMsg.textContent = data.message || "Signup failed";
    } catch(err){
        errorMsg.textContent = "Server error";
        console.error(err);
    }
});