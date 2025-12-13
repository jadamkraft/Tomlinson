# Tomlinson 10 (BibleWorks Clone)

**The Mission:** Inspired by the classic BibleWorks 10 software, built for the modern web. This project is named in honor of Professor Alan Tomlinson, retired from Midwestern Baptist Theological Seminary.

## 🛠 Tech Stack
* **Core:** React, TypeScript
* **Styling:** Tailwind CSS
* **Build Tool:** Vite
* **Deployment:** Cloudflare Pages (CI/CD via GitHub)

## 🚀 Methodology
This project demonstrates a modern, AI-assisted engineering workflow:
* **Rapid Prototyping:** leveraged Google AI Studio to accelerate UI boilerplate and component logic.
* **Architecture:** Manually architected the Service Layer (`DictionaryService`, `BibleEngine`) to ensure separation of concerns.
* **Infrastructure:** Implemented a continuous deployment pipeline using Cloudflare Pages.

## 📦 Data Sources
* **Text:** Hebrew/Greek XML data derived from OpenScriptures.
* **Lexicon:** Strong's Dictionary (Public Domain).

## 💻 How to Run Locally
1.  Clone the repo:
    ```bash
    git clone [https://github.com/jadamkraft/Tomlinson.git](https://github.com/jadamkraft/Tomlinson.git)
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```