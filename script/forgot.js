document.getElementById('forgotPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const errorMessage = document.getElementById('errorMessage');

    // Clear previous error message
    errorMessage.textContent = '';

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        errorMessage.textContent = 'Please enter your email address.';
    } else if (!emailRegex.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
    } else {
        // Success message (in a real application, you would send a reset link to the email)
        errorMessage.style.color = 'green';
        errorMessage.textContent = 'Password reset link has been sent to your email !';
    }
});
