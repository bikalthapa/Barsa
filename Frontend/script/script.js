// This all contains in the navigation bar 
let notifiction_btn = document.getElementById("notification_btn");
let notification_container = document.getElementById("notification_container");
notification_btn.addEventListener("click", () => {
    alert(notification_container.innerHTML);
});

let logout_btn = document.getElementById("logout_btn");
logout_btn.addEventListener("click", () => {
    alert("Logout was clicked");
})

// Function to get a cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/;secure;SameSite=Strict";
}



// Check if the user is logged in
function checkLogin(login_path) {
    const apiKey = getCookie('api_key');
    if (!apiKey) {
        // Redirect to login page if not logged in
        window.location.href = login_path; // Adjust the path as needed
    } else {
        return true;
    }
}

