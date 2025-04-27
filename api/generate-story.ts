import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri destekleniyor.' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt eksik.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Sen yaratıcı bir çocuk hikayeleri yazarı gibisin. Hikayeleri kısa, sevimli ve öğretici yap.' },
          { role: 'user', content: `Şu tanıma göre bir çocuk masalı yaz: ${prompt}` },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ story: response.data.choices[0].message.content.trim() });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: 'Hikaye oluşturulamadı.' });
  }
}
