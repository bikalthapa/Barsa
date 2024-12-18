let login_btn = document.getElementById("login_btn");
let sign_up_btn = document.getElementById("sign_up_btn");
let login_container = document.getElementById("login");
let sign_up_container = document.getElementById("signup");

login_btn.addEventListener("click", () => {
  sign_up_container.classList.add("d-none");
  login_container.classList.remove("d-none");
});

sign_up_btn.addEventListener("click", () => {
  login_container.classList.add("d-none");
  sign_up_container.classList.remove("d-none");
});
