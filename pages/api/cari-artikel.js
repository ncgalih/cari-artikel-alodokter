import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const url = 'https://www.alodokter.com/search'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { disease } = req.query;

    if (!disease) {
      return res.status(400).json({ error: 'Disease parameter is required' });
    }

    try {
      const filePath = path.join(process.cwd(), 'public', 'diseases.csv');
      const fileContent = await fs.readFile(filePath, 'utf8');

      parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      }, (err, records) => {
        if (err) {
          return res.status(500).json({ error: 'Error parsing CSV' });
        }

        const translatedDisease = records.find(item => item.disease.toLowerCase() === disease.toLowerCase());

        if (translatedDisease) {
          return res.redirect(302, `${url}?s=${translatedDisease.translated}`);
        } else {
          return res.redirect(302, `${url}?s=${disease}`);
        }
      });

    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
