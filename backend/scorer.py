import json
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import OPENAI_API_KEY, MODEL_NAME, TEMPERATURE


llm = ChatGroq(
    api_key=OPENAI_API_KEY,
    model=MODEL_NAME,
    temperature=TEMPERATURE
)


scoring_prompt = PromptTemplate(
    input_variables=["resume", "job_description"],
    template="""
You are a professional resume reviewer and career coach with 10+ years of experience.

A job seeker has uploaded their resume and wants to know how well it matches a job.

JOB DESCRIPTION:
{job_description}

CANDIDATE RESUME:
{resume}

IMPORTANT RULES:
- Return ONLY a valid JSON object
- No extra text before or after the JSON
- No markdown formatting
- No code blocks
- Just the raw JSON object

Return this exact JSON structure:
{{
    "overall_score": <integer 0 to 100>,

    "section_scores": {{
        "skills": <integer 0 to 100>,
        "experience": <integer 0 to 100>,
        "education": <integer 0 to 100>,
        "formatting": <integer 0 to 100>
    }},

    "ats_check": {{
        "passes": <true or false>,
        "reason": "<one clear sentence why it passes or fails ATS>"
    }},

    "strengths": [
        "<specific strength 1>",
        "<specific strength 2>",
        "<specific strength 3>"
    ],

    "improvement_tips": [
        "<actionable tip 1>",
        "<actionable tip 2>",
        "<actionable tip 3>"
    ],

    "missing_keywords": [
        "<keyword 1 missing from resume>",
        "<keyword 2 missing from resume>",
        "<keyword 3 missing from resume>"
    ],

    "rewritten_summary": "<rewrite the candidate summary to be stronger and aligned with this job>"
}}
"""
)


scoring_chain = scoring_prompt | llm | StrOutputParser()


def clean_json_response(raw_response):
    cleaned = raw_response.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]

    start_index = cleaned.find("{")
    end_index = cleaned.rfind("}")

    if start_index != -1 and end_index != -1:
        cleaned = cleaned[start_index: end_index + 1]

    return cleaned.strip()


def analyse_resume(resume_text, job_description):
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text empty hai")

    if not job_description or not job_description.strip():
        raise ValueError("Job description empty hai")

    raw_response = scoring_chain.invoke({
        "resume": resume_text,
        "job_description": job_description
    })

    cleaned_response = clean_json_response(raw_response)

    try:
        result = json.loads(cleaned_response)
    except json.JSONDecodeError as e:
        raise ValueError(
            f"AI ne valid JSON nahi diya. "
            f"Error: {str(e)}. "
            f"Raw response: {raw_response[:200]}"
        )

    required_fields = [
        "overall_score",
        "section_scores",
        "ats_check",
        "strengths",
        "improvement_tips",
        "missing_keywords",
        "rewritten_summary"
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(f"Field missing: {field}")

    return result