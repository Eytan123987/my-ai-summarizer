const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// הגדרות לווינדוס 8.1 ולמניעת שגיאות אבטחה בשרת
process.env.NODE_SKIP_PLATFORM_CHECK = "1";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

app.use(cors());
app.use(express.json());

// המפתח שלך (אל תשנה אותו אם הוא עובד)
const GEMINI_API_KEY = 'AIzaSyBqQW0MassV2A1zgAuNPmGGgrTbujaw9PI';

app.post('/summarize', async (req, res) => {
    const { text, type } = req.body;
    
    console.log(`קיבלתי בקשה מסוג: ${type || 'summarize'}`);

    // קביעת ההוראה ל-AI לפי סוג הלחיצה באתר
    let prompt = `תסכם את הטקסט הבא בעברית בצורה ברורה עם נקודות (bullets): ${text}`;

    if (type === 'quiz') {
        prompt = `צור בוחן אמריקאי על הטקסט הבא. שלח 4 שאלות, לכל שאלה 4 אפשרויות וסמן את התשובה הנכונה בסוף. הנה הטקסט: ${text}`;
    } else if (type === 'translate') {
        prompt = `Translate the following text to perfect academic English: ${text}`;
    }

    try {
        // שימוש במודל 2.5 פלאש שגילינו שעובד לך
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            }
        );

        if (response.data && response.data.candidates) {
            const aiResult = response.data.candidates[0].content.parts[0].text;
            console.log("ה-AI ענה בהצלחה!");
            res.json({ summary: aiResult });
        } else {
            throw new Error("תשובה ריקה מגוגל");
        }

    } catch (error) {
        console.error("שגיאה בשרת:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
        res.status(500).json({ summary: "משהו השתבש בשרת. נסה שוב בעוד רגע." });
    }
});

// הגדרת פורט ל-Render (הוא בוחר את הפורט לבד)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الשרת רץ על פורט ${PORT}`);
});
