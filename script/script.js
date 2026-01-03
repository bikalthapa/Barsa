let spinner = document.getElementById("loadingSpinner");
let loadTextFld = document.getElementById("loadingText");
// Function to show the spinners
const showSpinner = (msg = "Loading...") => {
    spinner.classList.remove("d-none");
    loadTextFld.innerHTML = msg;
};

// Function to hide the spinners
const hideSpinner = () => {
    spinner.classList.add("d-none");
};