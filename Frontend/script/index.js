let birthday_btn = document.getElementById("birthday_btn");
let event_btn = document.getElementById("event_btn");
let birthday_card = document.getElementById("birthday_card");
let event_card = document.getElementById("event_card");
event_btn.addEventListener("click", () => {
    birthday_btn.classList.remove("active");
    event_btn.classList.add("active");
    birthday_card.classList.add("d-none");
    event_card.classList.remove("d-none");
});
birthday_btn.addEventListener("click", () => {
    birthday_btn.classList.add("active");
    event_btn.classList.remove("active");
    birthday_card.classList.remove("d-none");
    event_card.classList.add("d-none");
});
// Array of birthday wishes
const birthdayWishes = [
    "Wishing you a day filled with love, joy, and all your favorite things. Happy Birthday! May this year bring you endless happiness and unforgettable memories.",
    "May your birthday be as wonderful and amazing as you are. Cheers to another fabulous year! Here's to celebrating you and all the incredible moments ahead.",
    "Happy Birthday! May your special day be filled with happiness and unforgettable moments. May your year be filled with success, good health, and all the love you deserve.",
    "Sending you smiles for every moment of your special day. Have a fantastic birthday! May your heart be filled with joy and your life with endless blessings.",
    "Happy Birthday! May your day be filled with sunshine, laughter, and love. May all your dreams come true and your journey be filled with beautiful adventures."
];

// Function to display a random birthday wish
function displayRandomWish() {
    const randomIndex = Math.floor(Math.random() * birthdayWishes.length);
    const randomWish = birthdayWishes[randomIndex];
    document.getElementById('birthdayWish').innerText = randomWish;
}

// Call the function when the page loads
window.onload = displayRandomWish;
