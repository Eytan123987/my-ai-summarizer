<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartStudy Ultimate PRO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;700;800&display=swap');
        body { font-family: 'Assistant', sans-serif; background: #020617; color: white; scroll-behavior: smooth; }
        .glass { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; }
        .premium-btn { background: linear-gradient(90deg, #f59e0b, #ef4444); transition: 0.3s; }
        .premium-btn:hover { transform: scale(1.02); box-shadow: 0 0 15px rgba(245, 158, 11, 0.3); }
        #paymentPage { display: none; }
    </style>
</head>
<body class="min-h-screen">

    <div id="paymentPage" class="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-6">
        <div class="glass max-w-md w-full p-8 text-center border-2 border-amber-500">
            <h2 class="text-3xl font-bold text-amber-500 mb-4">SmartStudy GOLD 👑</h2>
            <p class="text-slate-300 mb-8">שחרר את כל החסמים. סיכומים ללא הגבלה, מהירות פי 5 ותמיכה אישית.</p>
            <div class="bg-white/5 p-4 rounded-xl mb-6">
                <span class="text-4xl font-black">₪29.90</span> / חודש
            </div>
            <button onclick="alert('מעביר לתשלום...')" class="w-full premium-btn py-4 rounded-xl font-bold text-xl mb-4">רכוש מנוי עכשיו</button>
            <button onclick="closePayment()" class="text-slate-500 underline text-sm">חזור לאתר</button>
        </div>
    </div>

    <nav class="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-slate-950/90 z-50 backdrop-blur-md">
        <h1 class="text-2xl font-black italic bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">SMARTSTUDY PRO</h1>
        <div id="authArea">
            <button onclick="login()" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition shadow-lg">התחבר עם Google</button>
        </div>
    </nav>

    <main class="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="lg:col-span-3 space-y-4">
            <div class="glass p-6">
                <h4 class="font-bold text-blue-400 mb-4 italic">פיצ'רים פעילים</h4>
                <div class="space-y-3">
                    <button onclick="speakText()" class="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-right flex items-center gap-3 transition">🔊 הקראה קולית</button>
                    <button onclick="runAI('translate')" class="w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-right flex items-center gap-3 transition">🌍 תרגום לאנגלית</button>
                    <button onclick="runAI('quiz')" class="w-full p-4 bg-blue-600/20 border border-blue-500/50 hover:bg-blue-600/40 rounded-xl text-right flex items-center gap-3 transition font-bold">🎯 בוחן פתע</button>
                    <button onclick="openPayment()" class="w-full p-4 premium-btn rounded-xl text-right flex items-center gap-3 font-bold">👑 גרסת זהב</button>
                </div>
            </div>
        </aside>

        <section class="lg:col-span-9 space-y-6">
            <div class="glass p-8 shadow-2xl">
                <textarea id="userInput" class="w-full h-64 bg-transparent border-none text-xl outline-none placeholder-slate-700 resize-none" placeholder="הדבק כאן את החומר לסיכום..."></textarea>
                <div class="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
                    <div id="status" class="text-slate-500 text-sm italic">מערכת מוכנה לעבודה</div>
                    <button id="mainBtn" onclick="runAI('summarize')" class="bg-gradient-to-r from-blue-600 to-emerald-500 px-12 py-5 rounded-2xl font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition">
                        סכם עכשיו ✨
                    </button>
                </div>
            </div>

            <div id="resultBox" class="hidden glass p-8 border-r-8 border-emerald-500 shadow-2xl">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-emerald-400 italic">התוצאה:</h3>
                    <button onclick="copyText()" class="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition">העתק 📋</button>
                </div>
                <div id="output" class="text-slate-200 text-lg leading-relaxed whitespace-pre-wrap"></div>
            </div>
        </section>
    </main>

    <script>
        // Firebase Config (בדיוק המזהים שלך)
        const firebaseConfig = {
            apiKey: "AIzaSyBqQW0MassV2A1zgAuNPmGGgrTbujaw9PI",
            authDomain: "smartstudy-445f5.firebaseapp.com",
            projectId: "smartstudy-445f5",
            storageBucket: "smartstudy-445f5.firebasestorage.app",
            messagingSenderId: "970794059408",
            appId: "1:970794059408:web:896c21a0f82312d8a70597"
        };
        firebase.initializeApp(firebaseConfig);

        let user = null;

        function login() {
            const provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(res => {
                user = res.user;
                document.getElementById('authArea').innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-sm font-bold text-emerald-400">${user.displayName}</span>
                        <img src="${user.photoURL}" class="w-10 h-10 rounded-full border-2 border-blue-500">
                    </div>`;
            }).catch(e => alert("שגיאה בהתחברות. וודא שאישרת את הדומיין ב-Firebase."));
        }

        async function runAI(type) {
            if (!user) return alert("חובה להתחבר עם המייל קודם!");
            const text = document.getElementById('userInput').value;
            if (!text) return alert("הכנס טקסט!");

            const status = document.getElementById('status');
            const output = document.getElementById('output');
            const resultBox = document.getElementById('resultBox');

            status.innerText = "ה-AI בעבודה...";
            resultBox.classList.remove('hidden');
            output.innerText = "מעבד את המידע...";
            output.scrollIntoView({ behavior: 'smooth' });

            try {
                const res = await fetch('https://my-smart-study.onrender.com/summarize', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ text, type })
                });
                const data = await res.json();
                
                // עיצוב כוכביות
                let formatted = data.summary.replace(/\*\*(.*?)\*\*/g, '<b class="text-blue-400 font-bold">$1</b>');
                output.innerHTML = formatted;
                status.innerText = "הושלם בהצלחה!";
            } catch (e) {
                output.innerText = "שגיאה בתקשורת עם השרת.";
            }
        }

        // --- פיצ'רים נוספים ---
        function speakText() {
            const text = document.getElementById('output').innerText;
            if(!text) return;
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'he-IL';
            window.speechSynthesis.speak(msg);
        }

        function openPayment() { document.getElementById('paymentPage').style.display = 'flex'; }
        function closePayment() { document.getElementById('paymentPage').style.display = 'none'; }
        function copyText() { navigator.clipboard.writeText(document.getElementById('output').innerText); alert("הועתק!"); }
    </script>
</body>
</html>
