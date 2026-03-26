# 📘 MiniAI‑Learn 

**MiniAI‑Learn** is a web-based educational game that introduces kids (ages 6–12) to fundamental AI concepts through fun, interactive challenges and bite‑sized lessons.

Live demo: **[miniai-learn.netlify.app](https://miniai-learn.netlify.app)**

---

## 🎯 Purpose

MiniAI‑Learn helps young learners explore artificial intelligence in an enjoyable, gamified environment. Through a journey of mini-games, projects, and prompts, kids build core AI intuition like prompt crafting, logic thinking, and basic ML principles.

---

## 🚀 Features

- **Adventure‑style gameplay**: Earn badges, unlock levels, and collect ‘AI Tokens’ by completing quests.
- **Interactive lessons**: Learn about pattern recognition, creative prompts, and problem-solving with hands-on activities.
- **Prompt challenges**: Kids enter various prompts and see how the AI responds—prompt iteration promotes experimentation.
- **Visual progress tracker**: Friendly characters and progress bars show milestones and learning achievements.
- **AI chatbot helper**: The app can now connect to the Gemini API for live chatbot responses, with a local fallback when no API key is configured.

## 🔑 Gemini Setup

1. Create a `.env` file in the project root.
2. Copy the values from `.env.example`.
3. Set `VITE_GEMINI_API_KEY` to your Gemini API key.
4. Start the app with `npm run dev`.

This implementation calls Gemini directly from the browser for quick setup. For production, move the API call to a backend so the key is not exposed to clients.

---

## 🧱 Tech Stack

- **Frontend**: HTML5, CSS3, React (Typescript)
- **AI engine**: Gemini Generate Content API with a local fallback helper
- **Hosting**: Deployed via **Netlify** for fast, scalable hosting
