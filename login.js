// --- login.js (Authentication Module) ---
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

export function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section>
            <div class="form-container">
                <h2 class="section-title">Admin Login</h2>
                <form id="loginForm">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="password" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    <p id="loginError" style="color: red; margin-top: 1rem; text-align: center; display: none;"></p>
                </form>
            </div>
        </section>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errLabel = document.getElementById('loginError');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.hash = '#admin';
        } catch (error) {
            errLabel.style.display = 'block';
            errLabel.textContent = error.message;
        }
    });
}
