import os
import uuid
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import UPLOAD_DIR
from resume_parser import parse_resume
from scorer import analyse_resume


# ═══════════════════════════════════════════════════
# APP SETUP
# ═══════════════════════════════════════════════════

app = FastAPI(
    title="AI Resume Screener",
    description="Upload resume + job description — get AI powered analysis",
    version="1.0.0"
)


# ═══════════════════════════════════════════════════
# CORS — Frontend ko allow karo
# ═══════════════════════════════════════════════════

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ═══════════════════════════════════════════════════
# STATIC FILES — Frontend serve karo
# ═══════════════════════════════════════════════════

app.mount(
    "/static",
    StaticFiles(directory="../frontend"),
    name="static"
)


# ═══════════════════════════════════════════════════
# ROUTES
# ═══════════════════════════════════════════════════

@app.get("/")
async def home():
    return FileResponse("../frontend/index.html")


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "AI Resume Screener is running!"
    }


@app.post("/analyse")
async def analyse(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    # ── Validation 1: File type ──
    file_extension = resume.filename.split(".")[-1].lower()

    if file_extension not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400,
            detail="Sirf PDF aur DOCX files allowed hain!"
        )

    # ── Validation 2: JD empty check ──
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description empty hai!"
        )

    # ── Step 1: File save karo ──
    unique_id = str(uuid.uuid4())[:8]
    safe_filename = f"{unique_id}_{resume.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        file_content = await resume.read()
        with open(file_path, "wb") as f:
            f.write(file_content)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File save karne mein error: {str(e)}"
        )

    # ── Step 2: Resume text extract karo ──
    try:
        resume_text = parse_resume(file_path)

    except ValueError as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"Resume parse karne mein error: {str(e)}"
        )

    # ── Step 3: AI se analyse karo ──
    try:
        report = analyse_resume(resume_text, job_description)

    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis mein error: {str(e)}"
        )

    # ── Step 4: File delete karo (privacy) ──
    try:
        os.remove(file_path)
    except Exception:
        pass

    # ── Step 5: Result return karo ──
    return {
        "success": True,
        "report": report
    }