
// Helper functions to indicate input errors and successes
function getDescriptor(field) {
    return document.getElementById(field.getAttribute("descriptor"));
}

function indicateEmpty(field, field_descriptor) {
    field.classList.add("border-danger");
    field_descriptor.classList.add("text-danger");

    // Save the original description if it's not already saved
    if (!field_descriptor.hasAttribute("desc_title")) {
        field_descriptor.setAttribute("desc_title", field_descriptor.innerHTML);
    }

    // Set the error message
    field_descriptor.innerHTML = field_descriptor.getAttribute("desc_title") + " is necessary.";
}

function indicateNotEmpty(field, field_descriptor) {
    field.classList.remove("border-danger");
    field_descriptor.classList.remove("text-danger");

    // Restore the original description if valid
    if (field_descriptor.hasAttribute("desc_title")) {
        field_descriptor.innerHTML = field_descriptor.getAttribute("desc_title");
    }
}

// Check if the field is empty
function isEmpty(field, field_descriptor) {
    if (field.value.trim() === "") {
        indicateEmpty(field, field_descriptor);
        return true;
    } else {
        indicateNotEmpty(field, field_descriptor);
        return false;
    }
}

// Validate email format
function isValidEmail(field, field_descriptor) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zAZ0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(field.value.trim())) {
        indicateEmpty(field, field_descriptor);
        field_descriptor.innerHTML = "Please enter a valid email address.";
        return false;
    } else {
        indicateNotEmpty(field, field_descriptor);
        return true;
    }
}

// Validate password (you can add more specific rules like length, special characters, etc.)
function isValidPassword(field, field_descriptor) {
    if (field.value.trim().length < 6) {
        indicateEmpty(field, field_descriptor);
        field_descriptor.innerHTML = "Password must be at least 6 characters.";
        return false;
    } else {
        indicateNotEmpty(field, field_descriptor);
        return true;
    }
}
// Validate text (e.g., name, description, etc.)
// You can add more specific rules like minimum length, character restrictions, etc.
function isValidText(field, field_descriptor) {
    // Check if the text is empty or has less than a minimum length (e.g., 3 characters)
    if (field.value.trim().length < 3) {
        indicateEmpty(field, field_descriptor);
        field_descriptor.innerHTML = "Text must be at least 3 characters.";
        return false;
    } else {
        indicateNotEmpty(field, field_descriptor);
        return true;
    }
}

// Main validation logic
function validateField(field, typ) {
    let field_descriptor = getDescriptor(field);
    let is_field_empty = isEmpty(field, field_descriptor);

    // Email-specific validation
    if (typ == "email") {
        return isValidEmail(field, field_descriptor);
    }

    // Password-specific validation
    if (typ == "password") {
        return isValidPassword(field, field_descriptor);
    }

    if (typ == "username") {
        return isValidText(field, field_descriptor);
    }

    return !is_field_empty; // For other fields, just check if they are empty
}

// This function will fetch the data
// This function will fetch the data
function fetchBackend(typ, act, data, onSuccess, onError) {
    let url;
    let domain = "http://localhost/";
    if (typ == "auth") {
        if (act == "check") {
            url = `${domain}?typ=auth&act=check&c_email=${data.c_email}&c_password=${data.c_password}`;
        } else if (act == "create") {
            url = `${domain}?typ=auth&act=create&c_email=${data.c_email}&c_password=${data.c_password}&c_name=${data.c_name}`;
        }
    }
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status == "success") {
                onSuccess(data);
            } else {
                onError(data);
            }
        })
        .catch(error => {
            onError(error);
        });
}



  
