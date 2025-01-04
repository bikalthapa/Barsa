let form = document.getElementById("form");

let login_tab = document.getElementById("login_tab");
let signup_tab = document.getElementById("signup_tab");

let username_container = document.getElementById("user_name_container");
let auth_title = document.getElementById("authentication_title");
let forgot_link = document.getElementById("forgot_password");
let submit_btn = document.getElementById("submit_btn");

let email = document.getElementById("email");
let password = document.getElementById("password");
let user_name = document.getElementById("user_name");

let currentMode = "login";

function toggleTabs() {
  if (currentMode == "login") {
    auth_title.innerHTML = "Create an Account !";
    submit_btn.innerHTML = "Sign Up";
    forgot_link.classList.add("d-none");
    username_container.classList.remove("d-none");
    currentMode = "signup";
  } else {
    forgot_link.classList.remove("d-none");
    username_container.classList.add("d-none");
    auth_title.innerHTML = "Welcome Back !";
    submit_btn.innerHTML = "Login";
    currentMode = "login";
  }
}

// Switch between login and signup views
login_tab.addEventListener("click", () => {
  if (currentMode == "signup") {
    emailValidator.indicateNotEmpty();
    passwordValidator.indicateNotEmpty();
    usernameValidator.indicateNotEmpty();
    toggleTabs();
  }
});

signup_tab.addEventListener("click", () => {
  if (currentMode == "login") {
    emailValidator.indicateNotEmpty();
    passwordValidator.indicateNotEmpty();
    usernameValidator.indicateNotEmpty();
    toggleTabs();
  }
});



// Add input event listeners to dynamically validate fields and remove error styles
email.addEventListener("input", () => {
  emailValidator.validateField("email"); // Validate email on input and dynamically update the styles
});

password.addEventListener("input", () => {
  passwordValidator.validateField("password"); // Validate password on input and dynamically update the styles
});

user_name.addEventListener("input", () => {
  usernameValidator.validateField("username"); // Validate username on input and dynamically update the styles
});



// Create InputValidator instances
const emailValidator = new InputValidator(email);
const passwordValidator = new InputValidator(password);
const usernameValidator = new InputValidator(user_name);

// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let is_email_valid = emailValidator.validateField("email");
  let is_password_valid = passwordValidator.validateField("password");
  let is_username_valid = usernameValidator.validateField("username");

  let email_val = encodeURIComponent(email.value);
  let password_val = encodeURIComponent(password.value);
  
  // If all fields are valid, you can proceed with form submission
  if (is_email_valid && is_password_valid && currentMode == "login") {
    backend.login(email_val, password_val, onSuccess, onError);
  } else if (currentMode == "signup" && is_email_valid && is_password_valid && is_username_valid) {
    const username_val = encodeURIComponent(user_name.value);
    backend.signup(username_val, email_val, password_val, onSuccess, onError);
  } else {
    console.log("Form contains errors.");
  }
});

const onSuccess = (data)=>{
  if(data.status == "success"){
    if(data.data.c_apikey!=null){
      backend.store_login_credintial(data.data);
      window.location.href = "../index.html";
    }
  }
}
const onError = (data)=>{
  // console.log(data);
  if(data.status == "error"){
   if(data.message=="Record Not Found"){
    alert("Invalid Credintials");
   };
  }
}