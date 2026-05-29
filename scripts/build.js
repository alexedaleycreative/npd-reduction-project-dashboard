#!/usr/bin/env node
/**
 * build.js — Fetches Asana project data and generates a static dashboard HTML.
 *
 * Required env vars:
 *   ASANA_TOKEN  — Service Account or Personal Access Token
 *
 * Optional env vars:
 *   PROJECT_GID  — Asana project GID (defaults to TSR84801 NPD Reduction)
 */

const fs = require('fs');
const path = require('path');

const ASANA_TOKEN = process.env.ASANA_TOKEN;
if (!ASANA_TOKEN) {
  console.error('ERROR: ASANA_TOKEN environment variable is required.');
  process.exit(1);
}

const PROJECT_GID = process.env.PROJECT_GID || '1214711975354621';
const BASE_URL = 'https://app.asana.com/api/1.0';

// ── Asana API helpers ──────────────────────────────────────────────

async function asanaFetch(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'Authorization': `Bearer ${ASANA_TOKEN}` }
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Asana API ${res.status}: ${body}`);
  }

  return res.json();
}

async function asanaGet(endpoint, params = {}) {
  const json = await asanaFetch(endpoint, params);
  return json.data;
}

/** Paginate through all results for a list endpoint. */
async function asanaGetAll(endpoint, params = {}) {
  let results = [];
  let offset = null;

  do {
    const p = { ...params, limit: '100' };
    if (offset) p.offset = offset;

    const json = await asanaFetch(endpoint, p);
    results = results.concat(json.data || []);
    offset = json.next_page ? json.next_page.offset : null;
  } while (offset);

  return results;
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching project data...');

  // 1. Project metadata
  const project = await asanaGet(`/projects/${PROJECT_GID}`, {
    opt_fields: 'name,current_status,current_status.text,current_status.color'
  });
  console.log(`  Project: ${project.name}`);

  // 2. All tasks with custom fields
  const tasks = await asanaGetAll('/tasks', {
    project: PROJECT_GID,
    opt_fields: [
      'name', 'due_on', 'start_on', 'completed',
      'assignee', 'assignee.name',
      'custom_fields', 'custom_fields.name', 'custom_fields.display_value', 'custom_fields.type',
      'memberships.section.name', 'memberships.section.gid',
      'num_subtasks'
    ].join(',')
  });
  console.log(`  Tasks: ${tasks.length}`);

  // 3. Pre-fetch subtask details for every parent task
  const subtaskMap = {};
  const parents = tasks.filter(t => t.num_subtasks > 0);
  console.log(`  Fetching subtasks for ${parents.length} parent tasks...`);

  for (const parent of parents) {
    // Get subtask GIDs
    const subs = await asanaGetAll(`/tasks/${parent.gid}/subtasks`, {
      opt_fields: 'gid'
    });

    // Fetch full details for each subtask
    const details = [];
    for (const sub of subs) {
      const detail = await asanaGet(`/tasks/${sub.gid}`, {
        opt_fields: [
          'name', 'completed',
          'custom_fields', 'custom_fields.name', 'custom_fields.display_value',
          'memberships.section.name', 'memberships.section.gid',
          'num_subtasks'
        ].join(',')
      });
      details.push(detail);
    }

    subtaskMap[parent.gid] = details;
  }

  console.log(`  Subtask groups fetched: ${Object.keys(subtaskMap).length}`);

  // 4. Bundle data
  const dashboardData = {
    project,
    tasks,
    subtaskMap,
    fetchedAt: new Date().toISOString()
  };

  // 5. Inject into template
  const templatePath = path.join(__dirname, '..', 'template.html');
  const template = fs.readFileSync(templatePath, 'utf8');
  const html = template.replace(
    '/*__DASHBOARD_DATA__*/',
    JSON.stringify(dashboardData)
  );

  // 6. Write output
  const distDir = path.join(__dirname, '..', 'dist');
  fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf8');

  console.log('Dashboard built → dist/index.html');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
