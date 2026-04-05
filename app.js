import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const routes = {
    'home': './home.js',
    'websites': './websites.js',
    'experience': './work-history.js',
    'contact': './contact.js',
    'login': './login.js',
    'admin': './admin.js'
};

async function router() {
    let hash = window.location.hash.substring(1);
    if (!hash) hash = 'home';
    
    const container = document.getElementById('app-container');
    container.innerHTML = '<div style="text-align:center; padding: 5rem;">Loading...</div>';

    // Update Nav Active State
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === `#${hash}`) link.classList.add('active');
    });

    const modulePath = routes[hash] || routes['home'];

    try {
        const module = await import(modulePath);
        module.init('app-container');
    } catch (error) {
        console.error("Error loading module:", error);
        container.innerHTML = `<section><h2 class="section-title">Error</h2><p style="text-align:center;">Could not load module.</p></section>`;
    }
}

// Mobile Menu Toggle
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// Auth State Monitor (Redirects login to admin if logged in)
onAuthStateChanged(auth, (user) => {
    const loginLink = document.querySelector('a[href="#login"]');
    if (user) {
        loginLink.href = "#admin";
        loginLink.innerHTML = '<i class="fas fa-user-cog"></i> Admin';
        if(window.location.hash === '#login') window.location.hash = '#admin';
    } else {
        loginLink.href = "#login";
        loginLink.innerHTML = '<i class="fas fa-lock"></i>';
        if(window.location.hash === '#admin') window.location.hash = '#login';
    }
});

// Listeners
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
