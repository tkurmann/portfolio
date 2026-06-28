# Personal Research Portfolio

A minimal, academic-style personal portfolio website focused on Computer Vision, ML, and SWE research. Built with plain HTML, CSS, and vanilla JavaScript. Deployed on [Cloudflare Workers](https://workers.cloudflare.com/).

## Structure

```
├── index.html          # Home / About page
├── publications.html   # Publications list
├── projects.html       # Projects list
├── resume.html         # Resume / CV page
├── css/
│   └── style.css       # Global styles
├── js/
│   ├── navigation.js   # Navigation & filtering logic
│   └── content-loader.js  # Fetches & renders JSON data
├── data/
│   ├── about.json      # Bio, photo, social links
│   ├── publications.json  # Publications list
│   ├── projects.json       # Projects list
│   └── resume.json         # Education, experience, skills
├── assets/
│   └── images/         # Profile photo, project screenshots
├── worker.js           # Cloudflare Workers entry point
├── wrangler.toml       # Cloudflare Workers configuration
└── package.json        # Project metadata
```

## Customization

All content is stored in JSON files under the `data/` directory. Edit these files to update your portfolio:

| File | What to edit |
|------|-------------|
| [`data/about.json`](data/about.json) | Name, bio, research interests, social links |
| [`data/publications.json`](data/publications.json) | Publications (title, authors, venue, links) |
| [`data/projects.json`](data/projects.json) | Projects (name, description, tech stack, links) |
| [`data/resume.json`](data/resume.json) | Education, experience, skills |

Add your profile photo to `assets/images/profile.jpg` and project screenshots to `assets/images/`.

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/cli-wizard/)

### Setup

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start local dev server:**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:8787`.

## Deployment

### Step 1: Create a GitHub Repository

1. Create a new repository on [GitHub](https://github.com/new)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy with Wrangler

1. **Initialize Workers site (if not already configured):**
   ```bash
   wrangler init --site portfolio-worker
   ```
   This will create/update `wrangler.toml` with your site configuration.

2. **Deploy:**
   ```bash
   wrangler deploy
   ```
   Your site will be live at `https://YOUR_WORKER_NAME.your-account.workers.dev`.

### Step 3: (Optional) Add a Custom Domain

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers → Your Worker
2. Under **Triggers**, add your custom domain (e.g., `yourname.com` or `portfolio.yourname.com`)
3. Update DNS records in your Cloudflare DNS settings

### Step 4: (Optional) Enable Auto-Deploy from GitHub

1. In `wrangler.toml`, add GitHub integration:
   ```toml
   [triggers]
   crons = []

   [env.production]
   name = "portfolio"
   ```

2. Or use the [Cloudflare GitHub Action](https://github.com/cloudflare/wrangler2-github-action):
   - Create a GitHub Actions workflow in `.github/workflows/deploy.yml`
   - Store your Wrangler auth token as a GitHub secret

## Cloudflare Workers Deployment Explained

The deployment uses Cloudflare Workers Sites, which allows you to serve static assets (HTML, CSS, JS, JSON, images) from a Worker. The [`worker.js`](worker.js) file handles:

- Routing all requests to the correct static file
- Setting appropriate `Content-Type` headers
- Serving `index.html` for the root URL
- Caching assets for 1 hour

The [`wrangler.toml`](wrangler.toml) configuration tells Wrangler:
- `main = "worker.js"` — the Worker entry point
- `site.bucket = "."` — the directory containing static files (current directory)

## Tech Stack

- **Frontend:** Plain HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Deployment:** Cloudflare Workers + Workers Sites
- **Content:** JSON data files (easy to edit, no build step)
- **Design:** Minimal academic style, responsive, mobile-friendly

## License

MIT — Feel free to use this template for your own portfolio.
