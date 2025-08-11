// api/leaderboard.js
// node-fetch wird importiert, um API-Anfragen zu senden.
const fetch = require('node-fetch');

// Dies ist die Serverless-Funktion, die Vercel ausführt.
// Sie exportiert eine Standardfunktion, die req (Anfrage) und res (Antwort) entgegennimmt.
module.exports = async (req, res) => {
    // SICHERHEIT: Der API-Schlüssel ist hier auf dem Server.
    // Bessere Methode: Speichern Sie diesen als "Environment Variable" in Vercel.
    const API_KEY = '+IzAuLgXATRBlTxnFWdEHrZisLf0DWKc3E/OVXzYpXZSplDDtgFEDcKmlc9912xqsCAnJECuR7Wf7RwqCDE4Lt6XgvXIN6amuobI';
    const HYPE_API_URL = 'https://wallet-api.hype.bet/api/v1/affiliate/creator/get-stats';

    // Stellt sicher, dass nur POST-Anfragen erlaubt sind.
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    // KORREKTER Body für die Hype.bet API.
    const requestBody = {
        apiKey: API_KEY,
        from: startOfMonth,
        to: endOfMonth
    };

    try {
        const apiResponse = await fetch(HYPE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error(`Hype.bet API Error: ${apiResponse.status} - ${errorText}`);
            return res.status(apiResponse.status).json({ error: `API Error: ${errorText}` });
        }

        const data = await apiResponse.json();
        
        // Setzt einen Cache-Header, damit Vercel die Antwort für 5 Minuten zwischenspeichert.
        // Das reduziert die API-Aufrufe und beschleunigt die Seite.
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
        return res.status(200).json(data);

    } catch (error) {
        console.error('Serverless function error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
