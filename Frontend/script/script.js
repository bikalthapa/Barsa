let spinner = document.getElementById("loadingSpinner");
const showSpinner = () => {
    spinner.classList.remove("d-none");
};
const hideSpinner = () => {
    spinner.classList.add("d-none");
};