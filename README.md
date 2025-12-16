# Tomlin\son

**A "Text-First" Offline Exegetical Reader for the Original Biblical Languages.**

_Built with React 19, TypeScript, Vite, and Cloudflare Pages._

---

## 📖 The Story Behind the Name

This project is a digital homage to two giants of biblical scholarship who shaped my understanding of the text at Midwestern Baptist Theological Seminary (MBTS):

- **Dr. Alan Tomlinson** (New Testament / Greek)
- **Dr. Blake Hearson** (Old Testament / Hebrew)

The name **Tomlin\son** is a playful portmanteau. The backslash represents the "cutting" of the text (exegesis) or perhaps a file path, but it serves a dual purpose: it pays tribute to Dr. Tomlinson while jokingly "subsuming" Dr. Hearson into the suffix.

It is a fitting metaphor for how the Old Testament is often (unjustly!) tucked behind the New in modern study—sorry, Dr. Hearson!

### In Memoriam & Tribute

Dr. Tomlinson was a humble, genuine man who taught that you must determine meaning from within the document and its intended purpose. His students will remember the mantra:

> _"Trunk of a tree, trunk of an elephant, trunk of a car. Context determines meaning."_

I kept attendance for him every semester I could—ostensibly for a free book from his library, but mostly just to get extra time to talk to him. This tool is built in that spirit of digging into the context.

---

## 🚀 Mission & Vision

**Goal:** To build a modern, web-based successor to the "BibleWorks 10" experience—focused on speed, text-centricity, and original languages.

**Key Features:**

- **Offline-First:** Built as a PWA (Progressive Web App). Once loaded, it works entirely without internet—perfect for deep work or poor connections.
- **Instant Morphology:** Click any Greek or Hebrew word for instant parsing (MorphGNT & OSHB data).
- **Contextual Navigation:** "Canon-aware" navigation that flows seamlessly across book boundaries.

**Future Roadmap:**

- **Search & Concordance:** Implementing the granular search features that made BibleWorks legendary.
- **"Legendary Notes" Integration:** Digitizing Dr. Tomlinson's breakdown notes directly into the reader.
- **Student Collaboration:** Adapting the tool to serve the specific needs of current MBTS students.

## 🛠️ Tech Stack

- **Core:** React 19, TypeScript, Tailwind CSS
- **Data:** Local XML (OSIS) with MorphGNT & OSHB parsing
- **Infrastructure:** Cloudflare Pages (CI/CD)
