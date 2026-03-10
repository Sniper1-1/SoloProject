/**
 * site-config.js
 * Single source of truth for personal info displayed across the site.
 * Update values here and they'll update everywhere automatically.
 *
 * Load this BEFORE project-card.js and before the closing </body> tag:
 *   <script src="site-config.js" defer></script>
 *   <script src="project-card.js" defer></script>
 */

const SITE = {
	name:     'Justin Hooker',
	role:     'Full-Stack Developer | HTML/CSS, JavaScript, PHP, Next.js',
	year:     '2026',           // copyright year in footer
	github:   'https://github.com/Sniper1-1',
	linkedin: 'https://www.linkedin.com/in/justin-hooker-422141274',
	email:    '',               // optional — leave empty to hide the link
};

// ── Fills in any element with a data-site attribute ──────────────────────────
// Supported values:
//   data-site="name"      → inner text set to SITE.name
//   data-site="role"      → inner text set to SITE.role
//   data-site="year"      → inner text set to SITE.year
//   data-site="github"    → href set to SITE.github
//   data-site="linkedin"  → href set to SITE.linkedin
//   data-site="email"     → href set to mailto:SITE.email (hidden if empty)
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('[data-site]').forEach(el => {
		const key = el.dataset.site;
		const value = SITE[key];

		if (el.tagName === 'A') {
			// Link elements — set href (and hide if value is empty)
			if (!value) {
				el.closest('li')?.remove(); // remove the parent <li> if there is one
				el.remove();
				return;
			}
			el.href = key === 'email' ? `mailto:${value}` : value;
		} else {
			// Any other element — set text content
			el.textContent = value ?? '';
		}
	});
});
