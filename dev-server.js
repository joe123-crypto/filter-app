import express from 'express';
import bodyParser from 'body-parser';

import applyFilter from './api/apply-filter.js';
import generatePreview from './api/generate-preview.js';
import improvePrompt from './api/improve-prompt.js';
import generateFullFilter from './api/generate-full-filter.js';
import categorizeFilters from './api/categorize-filters.js';
import generateTrendingFilters from './api/generate-trending-filters.js';

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Helper to adapt serverless handlers (req,res) to Express
const adapt = (handler) => async (req, res) => handler(req, res);

app.post('/api/apply-filter', adapt(applyFilter));
app.post('/api/generate-preview', adapt(generatePreview));
app.post('/api/improve-prompt', adapt(improvePrompt));
app.post('/api/generate-full-filter', adapt(generateFullFilter));
app.post('/api/categorize-filters', adapt(categorizeFilters));
app.post('/api/generate-trending-filters', adapt(generateTrendingFilters));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Dev API server listening on http://localhost:${port}`);
}); 