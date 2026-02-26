# 🧠 SOULSYNC — Your AI Friend

> A warm, voice-enabled AI mental health companion that listens, understands, and supports — right in your browser.

---

## ✨ Features

- **Empathetic AI Chat** — Powered by an LLM, SOULSYNC responds like a caring friend, not a cold chatbot. It validates your feelings, asks thoughtful follow-up questions, and keeps the conversation natural.
- **Voice Input (Speech-to-Text)** — Speak your thoughts aloud using the microphone button. Uses the browser's built-in Web Speech API.
- **Voice Output (Text-to-Speech)** — SOULSYNC can read its responses aloud in either a male or female voice.
- **Natural Speech Cleanup** — Emojis, bracket cues like `[smiles]`, and formatting symbols are stripped before text-to-speech so the audio sounds natural, while the full expressive text remains on screen.
- **Settings Panel** — Choose between male/female companion voice, and toggle read-aloud on or off.
- **Crisis / SOS Modal** — A dedicated emergency button surfaces verified Indian mental health helpline numbers instantly:
  - Vandrevala Foundation: `9999666555`
  - iCall: `9152987821`
  - Aasra: `9820466726`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 + [Tailwind CSS](https://tailwindcss.com/) (CDN) |
| Logic | Vanilla JavaScript (ES6+) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| Speech | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| AI | LLM API (configured in `script.js`) |

---

## 🚀 Getting Started

No build step or installation required. This is a pure front-end project.

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omkar18U/soulsync-ai.git
   cd soulsync-ai
   ```

2. **Add your API key**
   Open `script.js` and replace the placeholder with your actual LLM API key:
   ```js
   const API_KEY = "YOUR_API_KEY_HERE";
   ```

3. **Open in browser**
   Simply open `index.html` in any modern browser (Chrome recommended for best Web Speech API support).

---

## 📁 Project Structure

```
soulsync-ai/
├── index.html   # App layout, chat UI, modals
├── style.css    # Custom styles (typing indicator, animations, toggles)
└── script.js    # All app logic — chat, AI calls, speech I/O, settings
```

---

## ⚠️ Disclaimer

SOULSYNC is a supportive AI companion and **not a substitute for professional medical or psychological help**. If you are in crisis, please reach out to a qualified professional or use the in-app SOS button to access helpline numbers.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

---

Made with 💜 by [Omkar18U](https://github.com/Omkar18U)
