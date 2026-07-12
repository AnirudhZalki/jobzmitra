# 🚀 JobzMitra

JobzMitra is an AI-powered career assistant that helps job seekers analyze resumes against job descriptions, identify skill gaps, generate ATS-friendly suggestions, and prepare for interviews using Large Language Models (LLMs).

---

## ✨ Features

- 📄 Resume Upload & Parsing
- 🎯 Resume vs Job Description Matching
- 📊 ATS Resume Analysis
- 🧠 AI-Powered Skill Gap Detection
- 💡 Resume Improvement Suggestions
- ❓ Interview Question Generation
- 📚 Personalized Learning Recommendations

---

## 🛠 Tech Stack

- Python
- Streamlit
- LangChain
- Groq LLM
- FAISS / ChromaDB (if applicable)
- Sentence Transformers
- PyPDF2
- SQLite (if used)

---

## 📂 Project Structure

```
JobzMitra/
│── app.py
│── utils.py
│── prompts.py
│── requirements.txt
│── data/
│── uploads/
│── README.md
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/AnirudhZalki/jobzmitra.git
cd jobzmitra
```

Create a virtual environment

```bash
python -m venv venv
```

Activate it

Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```env
GROQ_API_KEY=your_api_key
```

Run the application

```bash
streamlit run app.py
```

---

## Future Enhancements

- Job Recommendation System
- Resume Builder
- Company-wise Interview Preparation
- AI Career Mentor
- LinkedIn Profile Analyzer

---

## Author

**Anirudh A. Zalki**

GitHub: https://github.com/AnirudhZalki
