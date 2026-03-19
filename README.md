# UnlockResume — AI-Powered Resume Analyzer

UnlockResume is a premium, high-performance web application designed to help job seekers optimize their resumes using state-of-the-art AI. It provides instant matching scores, ATS compatibility checks, and actionable insights to give you a competitive edge.

![UnlockResume UI]

## ✨ Features

- **3D Interactive Background**: Stunning particle effects powered by Three.js.
- **Glassmorphism UI**: Modern, premium design with smooth animations.
- **AI Semantic Matching**: Deep analysis of resume content vs. job requirements using Llama 3.3.
- **ATS Compatibility Scoring**: Predictive insights into how your resume will perform in tracking systems.
- **Actionable Tips**: Specific suggestions for improvement and missing keyword detection.
- **Smart Summary Rewriter**: AI-generated professional summaries tailored to the job.

## 🚀 Tech Stack

- **Backend**: FastAPI, LangChain, Groq (Llama 3.3), PyMuPDF, python-docx.
- **Frontend**: Vanilla JavaScript, Three.js, Modern CSS (Glassmorphism).
- **Environment**: Python 3.x, Virtual Environment (venv).

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-resume-screener
```

### 2. Set up the Environment
Create a virtual environment and install the dependencies:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure API Keys
Create a `.env` file in the `backend` folder:
```env
OPENAI_API_KEY=your_groq_api_key_here
```
*(Note: Use your Groq API key here, the variable name is kept as OPENAI_API_KEY for legacy support in the code.)*

## 🚦 How to Run

1. **Navigate to the backend folder**:
    ```bash
    cd backend
    ```

2. **Start the server**:
    ```bash
    uvicorn main:app --reload
    ```

3. **Access the app**:
    Open [http://localhost:8000](http://localhost:8000) in your browser.

## 🐳 Running with Docker

You can also run the application using Docker for a more consistent environment:

### 1. Build the Docker Image
```bash
docker build -t unlock-resume .
```

### 2. Run the Container
```bash
docker run -p 8000:8000 --env-file backend/.env unlock-resume
```

### 3. Access the app
Open [http://localhost:8000](http://localhost:8000) in your browser.

---


Built by ❤️ and AI b UnlockResume Team.
