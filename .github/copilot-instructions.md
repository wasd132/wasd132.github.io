# Copilot / AI Agent Instructions for this repository

Overview
- This is a single-page Jekyll portfolio site (no backend). Layout is in `_layouts/default.html` and page fragments are in `_includes/`.
- Static assets live under `assets/` (CSS in `assets/css/`, JS in `assets/js/`, images in `assets/images/`). Vendor libraries live in `vendor/`.

Quick local workflow
- Install dependencies: `bundle install` (Gemfile only contains `jekyll`).
- Run locally: `bundle exec jekyll serve --livereload --drafts` (or plain `bundle exec jekyll serve`).
- Deployment: hosted via GitHub Pages; pushing to the repo activates the site (no additional build scripts).

Key files & patterns (use these as anchors when editing)
- Site-wide vars: `_config.yml` (change `title`, `description`, `site.profile_picture`, `google_analytics`).
- Page structure: `_layouts/default.html` includes `_includes/*.html` fragments. To add a section create `_includes/<name>.html` and include it in the layout.
- Navigation anchors: nav links target IDs like `#about`, `#skills`, `#projects`, `#blog-posts` (see `_includes/nav.html`). Keep IDs consistent when adding sections.
- Projects: `assets/js/projects.js` contains an in-memory `projects_obj` array — edit this array to add/remove projects (each entry includes `image`, `link`, `title`, `demo`, `technologies`, `description`, `categories`).
- Blog list: `assets/js/main.js` contains a static `posts` array used to render the blog preview (edit here to change visible posts).

Frontend conventions
- Vanilla CSS + jQuery. JavaScript lives in `assets/js/` and expects vendor jQuery in `vendor/js/jquery-3.3.1.js` (see `_includes/scripts.html`).
- Skill bars: markup in `_includes/skills.html` uses `.skillbar` elements with `data-percent` attributes; `assets/js/main.js` animates `.skillbar-bar` width based on `data-percent`.
- Project rendering: `projects.js` uses template strings and expects `.projects-wrapper` in the DOM.

Editing guidance / examples
- To change the page title: update `_config.yml` → `title` and reload site.
- To add a project: add an object to `projects_obj` in `assets/js/projects.js` and place image under `assets/images/`.
- To add a whole new section: create `_includes/section-name.html`, add `<section id="section-name">...</section>`, then include it from `_layouts/default.html` and add a nav anchor in `_includes/nav.html`.

Build / debugging tips
- For CSS/JS issues use browser devtools; source files referenced are the files under `assets/` and `vendor/` (no bundling/minification step).
- If Jekyll fails: ensure `bundle install` ran and check Ruby/Gems versions. The Gemfile is minimal; GitHub Pages will build on push.

Important caveats
- Many lists (projects, blog posts) are hardcoded in JS — there is no CMS or collection-driven generation in this repo.
- Avoid editing `vendor/` unless updating third-party libs intentionally; `_includes/scripts.html` controls script order.

When unsure, check these files first
- `_config.yml`, `_layouts/default.html`, `_includes/scripts.html`, `_includes/nav.html`, `assets/js/main.js`, `assets/js/projects.js`.

If anything in this guidance is unclear or you want different examples (liquid templates, adding a Jekyll collection, or converting project data to YAML), tell me which area to expand.
