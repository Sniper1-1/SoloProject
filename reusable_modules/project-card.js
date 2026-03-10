/**
 * project-card.js
 * A reusable Web Component for displaying a project.
 *
 * ── ADDING / EDITING PROJECTS ────────────────────────────────────────────────
 * All project data lives in the PROJECTS registry below. Each entry has an id
 * you use to reference it in HTML. Update data here and every card that uses
 * that id updates automatically — no hunting through the HTML.
 *
 * Usage in HTML:
 *   <!-- Regular card -->
 *   <project-card id="assignments-manager"></project-card>
 *
 *   <!-- Featured / hero card (just add the "featured" attribute) -->
 *   <project-card id="assignments-manager" featured></project-card>
 *
 * The "featured" attribute only changes the visual style — the data still
 * comes from the registry, so both cards always stay in sync.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Project registry ─────────────────────────────────────────────────────────
// Add an entry here for each project. The id must be unique — it's what you
// put on the <project-card> element in HTML.
const PROJECTS = {
  'assignments-manager': {
    name:  'AssignmentsManager',
    label: 'Solo App',
    desc:  'A project for keeping track of class assignments and their due dates, built with HTML/CSS, JavaScript, and PHP with a MySQL database storing the data.',
    live:  './AssignmentsManager/',
    repo:  'https://github.com/Sniper1-1/SoloProject',
  },
  'team-project': {
    name:  'Battleship Game',
    label: 'Team Project',
    desc:  'A web-based multiplayer battleship game. Contributed the PHP backend API endpoints.',
    live:  'https://projectwarship.netlify.app/',
    repo:  'https://github.com/SStamper-Dev/warship',
    repo2: 'https://github.com/SStamper-Dev/capstone3750',
  },
  // ── Add more projects here as you build them ──────────────────────────────
  // 'my-next-project': {
  //   name:  'Example',
  //   label: 'Solo App',
  //   desc:  '...',
  //   live:  'https://...',
  //   repo:  'https://github.com/...',
  // },
};
// ─────────────────────────────────────────────────────────────────────────────


class ProjectCard extends HTMLElement {
  connectedCallback() {
    // Look up this card's data from the registry using the element's id attribute
    const project = PROJECTS[this.id];

    if (!project) {
      // Warn in the console if someone uses an id that doesn't exist in the registry
      console.warn(`<project-card>: no project found with id "${this.id}"`);
      return;
    }

    const { name, label, desc, live, repo, repo2 } = project;

    // "featured" is a boolean attribute — its presence (not value) determines the style
    const featured = this.hasAttribute('featured');

    if (featured) {
      // ── Featured / hero card ──────────────────────────────
      this.classList.add('featured-project');
      this.innerHTML = `
        ${label ? `<p class="label">${label}</p>` : ''}
        <h2 class="project-name">${name}</h2>
        <p class="project-desc">${desc}</p>
        <div class="project-links">
          <a href="${live}" class="btn-primary" target="_blank" rel="noopener">Live App ↗</a>
          <a href="${repo}" class="btn-ghost"   target="_blank" rel="noopener">View Code</a>
          ${repo2 ? `<a href="${repo2}" class="btn-ghost" target="_blank" rel="noopener">Backend Code</a>` : ''}
        </div>
      `;
    } else {
      // ── Regular project card ──────────────────────────────
      this.classList.add('project-card');
      this.innerHTML = `
        ${label ? `<p class="label">${label}</p>` : ''}
        <h3 class="card-name">${name}</h3>
        <p class="card-desc">${desc}</p>
        <div class="card-links">
          <a href="${live}" target="_blank" rel="noopener">Live App ↗</a>
          <a href="${repo}" target="_blank" rel="noopener">GitHub</a>
          ${repo2 ? `<a href="${repo2}" target="_blank" rel="noopener">Backend</a>` : ''}
        </div>
      `;
    }
  }
}

// Register the custom element so <project-card> is valid HTML
customElements.define('project-card', ProjectCard);
