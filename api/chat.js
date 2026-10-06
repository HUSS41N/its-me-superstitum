// Vercel function for the "Ask my AI" widget: POST /api/chat → streamed reply.
import { cleanMessages, streamChat } from '../lib/chat.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') { res.status(405).end(); return; }
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = null; } }
    const messages = cleanMessages(body && body.messages);
    if (!messages) { res.status(400).json({ error: 'Bad request.' }); return; }
    await streamChat(messages, req, res);
}
