// No server voice: a non-audio reply makes the widget fall back to the browser's own speech.
export default function handler(req, res) { res.status(204).end(); }
