// This all contains in the navigation bar 
let notifiction_btn = document.getElementById("notification_btn");
let notification_container = document.getElementById("notification_container");
notification_btn.addEventListener("click", () => {
    alert(notification_container.innerHTML);
});

let logout_btn = document.getElementById("logout_btn");
logout_btn.addEventListener("click", () => {
    backend.logout("./login.html");
})