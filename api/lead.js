// No lead inbox: `fallback` makes the widget open the email sheet instead.
export default function handler(req, res) { res.status(501).json({ fallback: true }); }
