const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// הגדרות לווינדוס 8.1 ולמניעת שגיאות אבטחה בשרת
process.env.NODE_SKIP_PLATFORM_CHECK = "1";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 

app.use(cors());
app.use(express.json());

// המפתח שלך (בדיוק כפי ששלחת)
const GEMINI_API_KEY = 'AIzaSyBqQW0MassV2A1zgAuNPmGGgrTbujaw9PI';

app.post('/summarize', async (req, res) => {
    const { text, type } = req.body;
    
    console.log(`קיבלתי בקשה מסוג: ${type || 'summarize'}`);

    // קביעת ההוראה ל-AI
    let prompt = `תסכם את הטקסט הבא בעברית בצורה ברורה עם נקודות (bullets): ${text}`;

    if (type === 'quiz') {
        prompt = `צור בוחן אמריקאי על הטקסט הבא. שלח 4 שאלות, לכל שאלה 4 אפשרויות וסמן את התשובה הנכונה בסוף. הנה הטקסט: ${text}`;
    } else if (type === 'translate') {
        prompt = `Translate the following text to perfect academic English: ${text}`;
    } else if (type === 'focus') {
        prompt = `תמצת את הטקסט הבא למשפט אחד קריטי וחשוב בלבד: ${text}`;
    }

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
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
        res.status(500).json({ summary: "משהו השתבש בשרת. נסה שוב בעוד רגע." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الשרת רץ על פורט ${PORT}`);
});
