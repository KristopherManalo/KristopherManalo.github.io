/* ============================================================
   Kristopher Manalo Portfolio — Header + Contact Component
   ------------------------------------------------------------
   Isolated from index.html. Renders two light-DOM pieces that
   used to live inline:

     1. <header class="header-section"> (name, portfolio links,
        section nav, email, "Contact" button)
     2. The Alternative Contact modal dialog

   Styles live in components/header-section.css.

   Consumed as: <rmd-header></rmd-header>
   The <button id="alternativeContactBtn"> and every modal input
   keep the same DOM ids that scripts/alternative-contact.js
   resolves via document.getElementById(...).
   ============================================================ */

class HeaderSection extends HTMLElement {
  async connectedCallback() {
    this.setAttribute("role", "banner");

    const links = JSON.parse(this.getAttribute("links") || "[]");
    const navLinks = links.map(([name, url]) => `
      <a href="${url}" class="nav-link">${name}</a>
    `).join("");

    this.innerHTML = `
      <header class="header-section">
        <div class="name-container">

          <!-- Row 1: name on the left, portfolio links aligned right -->
          <div class="header-row">
            <h1 class="header-name">
            <a href="/"
              style="text-decoration:none; color:inherit;"
            >Kristopher Manalo</a>
            </h1>
            <div class="contact-links">
              <a href="https://github.com/KristopherManalo"
                class="portfolio-link">GitHub</a>
              <a href="https://www.linkedin.com/in/kristopher-manalo/"
                class="portfolio-link">LinkedIn</a>
              <!--<a href="#" class="portfolio-link">Twitter / X</a> -->
              <a href="resumes/2026-11-16.pdf"
                class="portfolio-link">Resume/CV</a>
              <a href="/misc/"
                class="portfolio-link">Archive</a>
            </div>
          </div>

          <!-- Row 2: section navigation on the left, email controls aligned right -->
          <div class="header-row">
            <nav class="header-nav" aria-label="Section navigation">
              ${navLinks}
            </nav>
            <div class="contact-list">
              <a href="mailto:kristophermmanalo@gmail.com"
                class="contact-email">
                kristophermmanalo@gmail.com
              </a>
              <button id="alternativeContactBtn"
                class="contact-button alternative">
                Contact
              </button>
            </div>
          </div>

        </div>
      </header>

      <!-- Alternative Contact Modal -->
      <div class="contact-modal-overlay" id="alternativeContactModal" hidden>
        <div class="contact-modal" role="dialog"
          aria-modal="true" aria-labelledby="alternativeContactTitle">
          <div class="contact-modal-header">
            <span id="alternativeContactTitle"
              class="contact-modal-title">Send Message</span>
            <button type="button" id="contactModalClose"
              class="contact-modal-close" aria-label="Close dialog">✕</button>
          </div>
          <form class="contact-modal-form" id="alternativeContactForm">
            <label class="contact-field">
              <span class="contact-field-label">Name</span>
              <input type="text" id="contactName" name="name"
                required autocomplete="name" />
            </label>
            <label class="contact-field">
              <span class="contact-field-label">Email</span>
              <input
                type="email"
                id="contactEmail"
                name="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
              />
            </label>
            <label class="contact-field">
              <span class="contact-field-label">Subject</span>
              <input type="text" id="contactSubject" name="subject" />
            </label>
            <label class="contact-field">
              <span class="contact-field-label">Message</span>
              <textarea id="contactMessage" name="message" rows="5"
                required></textarea>
            </label>
            <div class="contact-honeypot" aria-hidden="true">
              <label for="contactWebsite">Website</label>
              <input
                type="text"
                id="contactWebsite"
                name="website"
                tabIndex="-1"
                autocomplete="off"
              />
            </div>
            <div class="contact-modal-actions">
              <button type="button" id="contactModalCancel"
                class="contact-modal-cancel">Cancel</button>
              <button type="submit" class="contact-modal-submit">Send</button>
            </div>
            <div
              id="contactFormStatus"
              role="status"
              aria-live="polite"
            ></div>
          </form>
        </div>
      </div>
    `;

    const { initializeContact } = await import("/scripts/alternative-contact.js");

    initializeContact(this);
  }
}

customElements.define("rmd-header", HeaderSection);
