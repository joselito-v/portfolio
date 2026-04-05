// --- contact.js (Contact Module)
export function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section id="contact">
            <div style="text-align: center; background: var(--bg-white); padding: 5rem 2rem; border-radius: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
                <h2 class="section-title" style="margin-bottom: 1rem;">Let's Work Together</h2>
                <p style="color: var(--text-light); font-size: 1.1rem;">Currently available for freelance opportunities and consulting.</p>
                
                <a href="mailto:jlvillarta@live.com.ph" style="font-size: 1.5rem; color: var(--primary-color); font-weight: 600; margin: 2rem 0; display: block; text-decoration: none;">
                    jlvillarta@live.com.ph
                </a>
            </div>
        </section>
    `;
}
