# RemoraAI  

> 🧠 **Your private, context-saving AI sidekick that actually remembers things.**

---

## 🌐 Live Project Links  

- 🔴 **Live Website:** [https://codencytech.github.io/remoraai/](https://codencytech.github.io/remoraai/)  
  *(If the hosted link doesn’t load immediately, don’t worry — you can easily run it locally by following the setup steps below.)*  
- 🎥 **Demo Video:** [https://youtu.be/iKzkxDFLc6Q](https://youtu.be/iKzkxDFLc6Q)  
- 💻 **Source Code:** [https://github.com/codencytech/remoraai](https://github.com/codencytech/remoraai)

---

## 🧾 Overview  

**RemoraAI** is a next-generation AI chat platform built for people who hate repeating themselves.  
It uses **Google Gemini 2.5 Flash** to provide intelligent, human-like conversations — but with a twist: **it remembers what you tell it.**

Whether you’re working on a coding project, brainstorming ideas, or managing daily tasks, RemoraAI keeps track of everything you ask it to “save” or “remember.”  
All data is stored safely in your browser (not on any server), so your privacy stays fully in your control.

This project was proudly created for **Halothon 2025** — a global AI hackathon focused on creativity, usability, and real-world impact.  

---

## ✨ Key Features  

- 🧠 **Context Memory System:** Just say *“save”* or *“remember”*, and RemoraAI stores that information for later use.  
- 🔒 **Local-First Privacy:** Your saved data stays inside your browser using localStorage — nothing leaves your device.  
- ⚡ **Instant Recall:** When you ask something related, the AI automatically recalls your saved context to give relevant answers.  
- 💬 **Memory Vault:** A sleek sidebar where you can view, delete, or clear all saved memories.  
- 🎨 **Interactive UI:** Built with **Framer Motion** and **tsparticles** for a modern, animated experience.  
- 🚀 **Fast & Responsive:** Designed to look and feel great across all screen sizes.  
- 🤝 **Hackathon-ready polish:** Focused on clear UX, technical depth, and creative presentation.

---

## 🧩 Tech Stack  

| Layer | Technology |
|-------|-------------|
| Frontend | React (Create React App) |
| Routing | React Router DOM |
| Animations | Framer Motion |
| Background | tsparticles |
| AI Model | Google Gemini 2.5 Flash (`@google/genai`) |
| Data Storage | LocalStorage (client-side) |
| Hosting | GitHub Pages |

---

## 🤖 How AI Works Behind the Scenes  

RemoraAI connects directly to **Google’s Gemini 2.5 Flash model** using the official `@google/genai` SDK.  
Here’s what happens every time you chat:

1. 🗂️ If you type something like “save my project goal is an AI chat app,” the system automatically detects and stores it in memory.  
2. 🔍 Later, when you ask related questions, it searches your saved data to find relevant context.  
3. 🧩 The system sends both your question *and* the matched context to Gemini for a more intelligent reply.  
4. 💬 Gemini responds context-aware — remembering your details and giving answers that actually make sense in conversation.

> 🏷️ **Acknowledgment:**  
> RemoraAI uses **Google Gemini 2.5 Flash** for content generation and conversation intelligence.  
> Special thanks to **Google AI** for enabling this technology.

---

## 🚀 Installation & Local Setup  

If the live site doesn’t open, you can run RemoraAI locally on your own computer in just a few steps:

```bash
# 1. Clone this repository
git clone https://github.com/codencytech/remoraai.git

# 2. Move into the project folder
cd remoraai

# 3. Install all dependencies
npm install

# 4. Start the development server
npm start
