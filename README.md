# TSR84801 NPD Reduction — Stakeholder Dashboard

A read-only project dashboard that automatically pulls data from your Asana project every 30 minutes and publishes it as a web page. You share the URL with stakeholders — they don't need an Asana account or login.

---

## How it works

1. Every 30 minutes, GitHub runs a script that calls the Asana API
2. The script fetches your project's tasks, statuses, dates, and subtasks
3. It builds a single HTML page with all that data baked in
4. GitHub publishes that page to a URL anyone with the link can visit

The dashboard itself is static — no passwords, no logins, no API keys in the browser. All the Asana communication happens behind the scenes in GitHub's servers.

---

## Prerequisites

Before you start, you'll need:

- **A GitHub account** — free at [github.com](https://github.com/signup)
- **GitHub Desktop** (recommended for beginners) — download at [desktop.github.com](https://desktop.github.com)
- **An Asana Service Account token** — you'll generate this in Step 2 below

---

## Step 1: Create a GitHub repository

A "repository" (repo) is just a project folder that GitHub tracks and hosts for you.

1. Go to [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `npd-dashboard` (or whatever you'd like)
   - **Description** (optional): `TSR84801 NPD Reduction stakeholder dashboard`
   - **Visibility**: Choose **Public** (required for free GitHub Pages — see the note at the bottom about private repos)
   - Leave everything else as-is (no README, no .gitignore, no license)
3. Click **Create repository**
4. You'll land on a page with setup instructions — leave this tab open, you'll need the repo URL in a moment

---

## Step 2: Generate your Asana token

This token lets the script read your Asana project data. It's stored securely in GitHub and never exposed to anyone visiting the dashboard.

1. Go to [app.asana.com/0/my-apps](https://app.asana.com/0/my-apps)
2. Click **Create new token** (under "Personal access tokens")
3. Give it a name like `NPD Dashboard`
4. Click **Create token**
5. **Copy the token immediately** — Asana only shows it once. Save it somewhere safe temporarily (you'll paste it into GitHub in Step 4)

> **Note:** If your organization uses Asana Business or Enterprise, ask your Asana admin about creating a Service Account instead. Service Accounts work the same way but are managed by your org rather than tied to your personal account. Either type of token works with this dashboard.

---

## Step 3: Upload the dashboard files to GitHub

### Option A: Using GitHub Desktop (recommended if you're new)

1. Open **GitHub Desktop**
2. Go to **File → Clone Repository**
3. Click the **URL** tab
4. Paste your repo URL (looks like `https://github.com/YOUR-USERNAME/npd-dashboard.git`) — you can copy this from the repo page you left open in Step 1
5. Choose where to save it on your computer (e.g., your Documents folder), then click **Clone**
6. Open the folder it created on your computer (GitHub Desktop has an **Open in Explorer** button)
7. Copy **all the files from the `npd-dashboard-app` folder** I gave you into this folder. Your folder should now look like:
   ```
   npd-dashboard/
   ├── .github/
   │   └── workflows/
   │       └── deploy.yml
   ├── scripts/
   │   └── build.js
   ├── template.html
   ├── package.json
   └── README.md        ← this file
   ```
   > **Important:** Make sure the `.github` folder is included. It starts with a dot, so it may be hidden on your computer. In Windows Explorer, click **View → Show → Hidden items** to reveal it.
8. Go back to **GitHub Desktop**. It will show all the new files as changes.
9. In the bottom-left, type a summary like `Initial dashboard setup` and click **Commit to main**
10. Click **Push origin** (top bar) to upload the files to GitHub

### Option B: Using the command line

If you're comfortable with a terminal:

```bash
git clone https://github.com/YOUR-USERNAME/npd-dashboard.git
cd npd-dashboard
```

Copy all the files from the `npd-dashboard-app` folder into this directory, then:

```bash
git add .
git commit -m "Initial dashboard setup"
git push origin main
```

---

## Step 4: Add your Asana token to GitHub

This stores your token securely. GitHub encrypts it and only exposes it to the build script — it's never visible in your code or on the dashboard.

1. Go to your repo on GitHub (e.g., `github.com/YOUR-USERNAME/npd-dashboard`)
2. Click **Settings** (the gear icon tab along the top — not your account settings)
3. In the left sidebar, click **Secrets and variables**, then click **Actions**
4. Click the green **New repository secret** button
5. Fill in:
   - **Name**: `ASANA_TOKEN` (must be exactly this, all caps)
   - **Secret**: Paste the token you copied in Step 2
6. Click **Add secret**

---

## Step 5: Enable GitHub Pages

This tells GitHub to publish your dashboard as a website.

1. In your repo on GitHub, click **Settings** (same gear icon tab)
2. In the left sidebar, click **Pages**
3. Under **Source**, select **GitHub Actions** from the dropdown
4. Click **Save** (if prompted)

---

## Step 6: Run the first build

The dashboard will build automatically every 30 minutes going forward, but let's trigger the first one manually.

1. In your repo on GitHub, click the **Actions** tab (along the top)
2. You'll see **Build & Deploy Dashboard** in the left sidebar — click it
3. Click the **Run workflow** dropdown button (on the right side)
4. Click the green **Run workflow** button
5. Wait about 30–60 seconds, then refresh the page. You should see a green checkmark when it's done.

If you see a red X instead, click on the failed run to read the error message. The most common issues are:
- `ASANA_TOKEN` secret is missing or mistyped
- The Asana token doesn't have access to the project

---

## Step 7: View your dashboard

Once the build succeeds, your dashboard is live at:

```
https://YOUR-USERNAME.github.io/npd-dashboard/
```

Replace `YOUR-USERNAME` with your actual GitHub username and `npd-dashboard` with your repo name.

This is the URL you share with stakeholders. They can bookmark it and check it anytime — it refreshes with new Asana data every 30 minutes.

---

## Ongoing maintenance

**You don't need to do anything.** The dashboard rebuilds itself every 30 minutes automatically. When you update tasks in Asana, the changes appear on the dashboard within 30 minutes.

### If you want to change the refresh frequency

1. Open `.github/workflows/deploy.yml` in your repo
2. Find the line that says `cron: '*/30 * * * *'`
3. Change the number:
   - Every 15 minutes: `'*/15 * * * *'`
   - Every hour: `'0 * * * *'`
   - Every 6 hours: `'0 */6 * * *'`
4. Commit and push the change

### If you want to update the dashboard design

Edit `template.html` in your repo. The next build will pick up the changes automatically.

---

## Note on public vs. private repos

**Public repos (free):** Anyone with the GitHub Pages URL can see your dashboard. The URL is not easily guessable, but it is technically public. The dashboard only shows task names, dates, and statuses — no confidential content unless your task names contain sensitive information.

**Private repos:** GitHub Pages for private repos requires **GitHub Pro** ($4/month), **GitHub Team** ($4/user/month), or **GitHub Enterprise**. With these plans, you can keep the repo private while still publishing the Pages site. On Enterprise plans, you can also restrict Pages access to organization members only.
