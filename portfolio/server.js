import express from 'express';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.json());

// Launch API
app.post('/api/launch/:project', (req, res) => {
  const project = req.params.project;
  const validProjects = ['heritage', 'tailmate', 'farmer', 'rfid', 'solar', 'curabot'];

  if (!validProjects.includes(project)) {
    return res.status(400).json({ success: false, message: 'Unknown project' });
  }

  const batPath = path.join(__dirname, 'launchers', `${project}.bat`);
  console.log(`🚀 Launching ${project}...`);

  exec(`"${batPath}"`, { windowsHide: false, detached: true }, (error) => {
    if (error) {
      console.error(`Error launching ${project}:`, error.message);
    }
  });

  res.json({ success: true, message: `Launching ${project}...` });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  🌊 Portfolio server running at http://localhost:${PORT}\n`);
});
