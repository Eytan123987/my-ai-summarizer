const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// הגדרות חובה לווינדוס 8.1
process.env.NODE_SKIP_PLATFORM_CHECK = "1";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = 'AIzaSyBqQW0MassV2A1zgAuNPmGGgrTbujaw9PI';

app.post('/summarize', async (req, res) => {
    const userText = req.body.text;
    console.log("משתמש במודל המאושר: gemini-2.5-flash...");

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `אתה עוזר לימודי חכם. תסכם את הטקסט הבא בעברית בנקודות, ובסוף הוסף 3 שאלות אמריקאיות לבוחן עצמי: ${userText}`
                    }]
                }]
            }
        );

        if (response.data && response.data.candidates) {
            const aiResult = response.data.candidates[0].content.parts[0].text;
            console.log("הצלחנו! ה-AI שלח סיכום.");
            res.json({ summary: aiResult });
        } else {
            throw new Error("מבנה תשובה לא תקין");
        }

    } catch (error) {
        console.error("שגיאה סופית:", error.response ? error.response.data : error.message);
        res.status(500).json({ summary: "אופס! משהו השתבש בתקשורת עם ה-AI." });
    }
});

app.listen(3000, () => {
    console.log("-----------------------------------------");
    console.log("השרת רץ על מודל 2.5 Flash! נסה עכשיו.");
    console.log("-----------------------------------------");
});