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
    indicateNotEmpty(email, getDescriptor(email));
    indicateNotEmpty(password, getDescriptor(password));
    indicateNotEmpty(user_name, getDescriptor(user_name));
    toggleTabs();
  }
});

signup_tab.addEventListener("click", () => {
  if (currentMode == "login") {
    indicateNotEmpty(email, getDescriptor(email));
    indicateNotEmpty(password, getDescriptor(password));
    indicateNotEmpty(user_name, getDescriptor(user_name));
    toggleTabs();
  }
});


// Handle form submission
form.addEventListener("submit", (e) => {
  e.preventDefault();

  let is_email_valid = validateField(email, "email");
  let is_password_valid = validateField(password, "password");
  let is_username_valid = validateField(user_name, "text");

  const email_val = encodeURIComponent(email.value);
  const password_val = encodeURIComponent(password.value);

  // If all fields are valid, you can proceed with form submission
  if (is_email_valid && is_password_valid && currentMode=="login") {

    // Example usage:
    fetchBackend(
      "auth",
      "check",
      { c_email: email_val, c_password: password_val },
      (data) => {
        // Success callback
        alert("Login successful");
        console.log("Success:", data);
      },
      (error) => {
        // Error callback
        alert("Invalid credentials");
        console.error("Error:", error);
      }
    );

  }else if(currentMode=="signup" && is_email_valid && is_password_valid && is_username_valid){
    const username_val = encodeURIComponent(user_name.value);
    // Example usage:
    fetchBackend(
      "auth",
      "create",
      { c_email: email_val, c_password: password_val ,c_name: username_val},
      (data) => {
        // Success callback
        alert("signup successful");
        console.log("Success:", data);
      },
      (error) => {
        // Error callback
        alert("signup credentials");
        console.error("Error:", error);
      }
    );
  } else {
    console.log("Form contains errors.");
  }
});


// Add input event listeners to dynamically validate fields and remove error styles
email.addEventListener("input", () => {
  validateField(email, "email"); // Validate email on input and dynamically update the styles
});

password.addEventListener("input", () => {
  validateField(password, "password"); // Validate password on input and dynamically update the styles
});
user_name.addEventListener("input", () => {
  validateField(user_name, "username")
})
