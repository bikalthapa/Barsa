class InputValidator {
    constructor(field) {
        this.field = field;
        this.fieldDescriptor = document.getElementById(field.getAttribute("descriptor"));
    }

    // Get the descriptor element
    getDescriptor() {
        return this.fieldDescriptor;
    }

    // Indicate that the field is empty
    indicateEmpty() {
        this.field.classList.add("border-danger");
        this.fieldDescriptor.classList.add("text-danger");

        // Save the original description if it's not already saved
        if (!this.fieldDescriptor.hasAttribute("desc_title")) {
            this.fieldDescriptor.setAttribute("desc_title", this.fieldDescriptor.innerHTML);
        }

        // Set the error message
        this.fieldDescriptor.innerHTML = this.fieldDescriptor.getAttribute("desc_title") + " is necessary.";
    }

    // Indicate that the field is not empty
    indicateNotEmpty() {
        this.field.classList.remove("border-danger");
        this.fieldDescriptor.classList.remove("text-danger");

        // Restore the original description if valid
        if (this.fieldDescriptor.hasAttribute("desc_title")) {
            this.fieldDescriptor.innerHTML = this.fieldDescriptor.getAttribute("desc_title");
        }
    }

    // Check if the field is empty
    isEmpty() {
        if (this.field.value.trim() === "") {
            this.indicateEmpty();
            return true;
        } else {
            this.indicateNotEmpty();
            return false;
        }
    }

    // Validate if the field contains a valid email
    isValidEmail() {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(this.field.value.trim())) {
            this.indicateEmpty();
            this.fieldDescriptor.innerHTML = "Please enter a valid email address.";
            return false;
        } else {
            this.indicateNotEmpty();
            return true;
        }
    }

    // Validate if the field contains a valid password
    isValidPassword() {
        if (this.field.value.trim().length < 6) {
            this.indicateEmpty();
            this.fieldDescriptor.innerHTML = "Password must be at least 6 characters.";
            return false;
        } else {
            this.indicateNotEmpty();
            return true;
        }
    }

    // Validate if the field contains valid text
    isValidText() {
        if (this.field.value.trim().length < 3) {
            this.indicateEmpty();
            this.fieldDescriptor.innerHTML = "Text must be at least 3 characters.";
            return false;
        } else {
            this.indicateNotEmpty();
            return true;
        }
    }

    // Validate the field based on the type
    validateField(type) {
        let isFieldEmpty = this.isEmpty();

        if (type === "email") {
            return this.isValidEmail();
        }

        if (type === "password") {
            return this.isValidPassword();
        }

        if (type === "username") {
            return this.isValidText();
        }

        return !isFieldEmpty; // For other fields, just check if they are empty
    }
}






  
