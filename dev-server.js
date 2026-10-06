// Local dev server: serves the site and the "Ask my AI" chat. On Vercel the static files
// come from the CDN and the chat runs as api/chat.js instead.
//   ANTHROPIC_API_KEY=... npm start      (or put the key in .env)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanMessages, streamChat } from './lib/chat.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
try { process.loadEnvFile(path.join(ROOT, '.env')); } catch {}




const MIME = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
    '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.mp4': 'video/mp4',
    '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain', '.xml': 'application/xml'
};
const PRIVATE = new Set(['dev-server.js', 'lib', 'api', 'vercel.json', 'package.json', 'package-lock.json', '.env']);

function readBody(req, limit = 64 * 1024) {
    return new Promise((resolve, reject) => {
        let size = 0; const chunks = [];
        req.on('data', (c) => { size += c.length; if (size > limit) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
        req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        req.on('error', reject);
    });
}

function json(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

async function chat(req, res) {
    let messages;
    try { messages = cleanMessages(JSON.parse(await readBody(req)).messages); } catch { messages = null; }
    if (!messages) return json(res, 400, { error: 'Bad request.' });
    return streamChat(messages, req, res);
}

function serveStatic(req, res) {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.join(ROOT, rel);
    const top = path.relative(ROOT, file).split(path.sep)[0];
    if (!file.startsWith(ROOT + path.sep) || PRIVATE.has(top) || top === 'node_modules' || top.startsWith('.')) {
        res.writeHead(404); return res.end('Not found');
    }
    fs.stat(file, (err, st) => {
        if (err || !st.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return fs.createReadStream(path.join(ROOT, '404.html')).on('error', () => res.end('Not found')).pipe(res);
        }
        const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
        // Byte ranges: Safari won't play a <video> without them.
        const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (m && (m[1] || m[2])) {
            const start = m[1] ? Number(m[1]) : Math.max(0, st.size - Number(m[2]));
            const end = m[1] && m[2] ? Math.min(Number(m[2]), st.size - 1) : st.size - 1;
            if (start > end || start >= st.size) {
                res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); return res.end();
            }
            res.writeHead(206, { 'Content-Type': type, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes' });
            return fs.createReadStream(file, { start, end }).pipe(res);
        }
        res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
        fs.createReadStream(file).pipe(res);
    });
}

http.createServer((req, res) => {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname === '/api/chat' && req.method === 'POST') return chat(req, res);
    // No server voice: a non-audio reply makes the widget fall back to the browser's own speech.
    if (pathname === '/api/tts') { res.writeHead(204); return res.end(); }
    // No lead inbox: `fallback` makes the widget open the email sheet instead.
    if (pathname === '/api/lead') return json(res, 501, { fallback: true });
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res);
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}`));
