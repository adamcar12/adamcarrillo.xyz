// Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    // Check if already authenticated, redirect to journal
    if (isAuthenticated()) {
        window.location.href = '/journal.html';
        return;
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    // Toggle between login and register forms
    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.style.display = 'none';
        registerSection.style.display = 'block';
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.style.display = 'none';
        loginSection.style.display = 'block';
    });

    // Handle login
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        errorEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            await AuthAPI.login(username, password);
            window.location.href = '/journal.html';
        } catch (error) {
            errorEl.textContent = error.message || 'Login failed';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });

    // Handle registration
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorEl = document.getElementById('register-error');
        const submitBtn = e.target.querySelector('button[type="submit"]');

        errorEl.textContent = '';

        // Validate passwords match
        if (password !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            await AuthAPI.register(username, password);
            showSuccess('Account created! Please login.');
            // Switch to login form
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
            registerForm.reset();
        } catch (error) {
            errorEl.textContent = error.message || 'Registration failed';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
        }
    });
});
