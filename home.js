// --- home.js (Landing / About) ---
export function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section class="hero" id="home">
            <h1>Joselito Villarta, CPA</h1>
            <h2>Accounting Professional, College Instructor, and Web Developer</h2>
            <div>
                <a href="#websites" class="btn btn-primary">My Websites</a>
                <a href="#work-history" class="btn btn-primary">My Work</a>
                <a href="#contact" class="btn btn-outline">Get in Touch</a>
            </div>
        </section>

        <section id="about">
            <h2 class="section-title">About Me</h2>
            <div class="about-grid">
                <div class="about-text">
                    <p>Hello! I am Joselito Villarta, a Certified Public Accountant (CPA) and college instructor with a deep passion for web development. I bridge the gap between complex financial systems and modern digital solutions.</p>
                    <p>As the founder of VnVCPAs, I understand the intricate needs of businesses. Whether it is teaching the next generation of accountants or developing comprehensive cloud accounting systems, I bring analytical rigor and creative problem-solving to every project.</p>
                </div>
                <div class="skills-container">
                    <h3 style="margin-bottom: 1rem; color: var(--primary-color);">Core Expertise</h3>
                    <span class="skill-tag">Financial Accounting</span>
                    <span class="skill-tag">Web Development</span>
                    <span class="skill-tag">HTML5 / CSS3</span>
                    <span class="skill-tag">JavaScript</span>
                    <span class="skill-tag">Cloud Accounting Software</span>
                    <span class="skill-tag">UI/UX Design</span>
                    <span class="skill-tag">LMS Courseware</span>
                    <span class="skill-tag">Process Automation</span>
                </div>
            </div>
        </section>
    `;
}
