document.addEventListener("DOMContentLoaded", function () {
    let credintial_form = document.getElementById("userCredintialForm");
    let userField = document.getElementById("username");
    let emailField = document.getElementById("email");
    let oPasswordField = document.getElementById("old_password");
    let nPasswordField = document.getElementById("new_password");
    let cPasswordField = document.getElementById("confirm_password");

    let userInput = document.getElementById("userCredintial");
    let emailInput = document.getElementById("emailCredintial");

    if (userField && emailField) {
        // Assuming backend.get_user_name() and backend.get_email() are synchronous functions
        userInput.value = backend.get_user_name();
        emailInput.value = backend.get_email();
        userField.innerHTML = backend.get_user_name();
        emailField.innerHTML = backend.get_email();
    } else {
        console.error("User or email field not found");
    }

    const onSuccess = (data)=>{
        console.log(data);
    }

    const onError = (data)=>{
        console.log(data);
    }
    
    let userValidator = new InputValidator(userInput);
    let oPassValidator = new InputValidator(oPasswordField);
    let nPassValidator = new InputValidator(nPasswordField);
    let cPassValidator = new InputValidator(cPasswordField);

    credintial_form.addEventListener("submit", (event) => {
        event.preventDefault();
        let isValidUser = userValidator.validateField();
        let data = { c_name: "", n_password: "", o_password: "" };
        if (isValidUser == true && userValidator.field.value != backend.get_user_name()) {
            data.c_name = userValidator.field.value;
        }

        if (oPasswordField.value != "" || nPasswordField.value != "" || cPasswordField.value != "") {
            let isValidOPass = oPassValidator.validateField();
            let isValidNPass = nPassValidator.validateField();
            let isValidCPass = cPassValidator.validateField();
            if (isValidOPass || isValidNPass || isValidCPass) {
                if (nPassValidator.field.value == cPassValidator.field.value) {
                    if (nPassValidator.field.value != oPassValidator.field.value) {
                        data.n_password = nPassValidator.field.value;
                    } else {
                        alert("Your password is same as old password");
                    }
                } else {
                    alert("New password must match confirmation password");
                }
            }
        }

        if (data.c_name != "" || data.n_password != "") {
            backend.updateCredintial(data, onSuccess, onError);
        }

    });

    userInput.addEventListener("input", () => {
        userValidator.validateField();
    });

});