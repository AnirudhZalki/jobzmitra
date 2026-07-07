from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List
from app.models.user import User
from app.api.feed import get_current_user

router = APIRouter()

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

@router.post("/chat", response_model=ChatResponse)
def chat_with_mentor(request: ChatRequest, current_user: User = Depends(get_current_user)):
    # MVP simulated AI Mentor
    if not request.messages:
        return {"reply": "Hi! I'm your AI Career Mentor. How can I help you today?"}
        
    last_message = request.messages[-1].content.lower()
    
    # Simple keyword-based routing
    if "resume" in last_message or "cv" in last_message:
        reply = "I recommend uploading your latest resume to the Resume Center. Our system will automatically extract your skills to give you personalized job matches. Make sure your resume uses clear headings and bullet points!"
    elif "interview" in last_message:
        reply = "For interviews, I recommend the STAR method (Situation, Task, Action, Result). Always prepare a good answer for 'Tell me about yourself' focusing on your relevant career journey. Would you like a mock question?"
    elif "skills" in last_message or "learn" in last_message:
        reply = "Based on current trends, learning React and Next.js for frontend, or Python and FastAPI for backend will significantly boost your profile. I see you have some skills already, let's build on those!"
    elif "job" in last_message or "apply" in last_message:
        reply = "Don't just apply blindly! Focus on jobs where you meet at least 70% of the criteria. Try checking your 'Top Recommendations' in the Resume Center for the best matches."
    else:
        reply = "That's an interesting career question! As your AI Mentor, I suggest focusing on continuous learning and networking. How else can I assist with your career goals today?"
        
    return {"reply": reply}

class MockEvaluateRequest(BaseModel):
    question: str
    answer: str

class MockEvaluateResponse(BaseModel):
    score: int
    feedback: str

import random
MOCK_QUESTIONS = [
    "Tell me about a time you failed and what you learned from it.",
    "Describe a challenging technical problem you solved recently.",
    "Where do you see your career heading in the next 3 years?",
    "How do you handle disagreements with team members or managers?",
    "What is your biggest weakness and how do you actively manage it?"
]

@router.get("/mock-interview/start")
def start_mock_interview(current_user: User = Depends(get_current_user)):
    question = random.choice(MOCK_QUESTIONS)
    return {"question": question}

@router.post("/mock-interview/evaluate", response_model=MockEvaluateResponse)
def evaluate_mock_interview(request: MockEvaluateRequest, current_user: User = Depends(get_current_user)):
    import re
    answer = request.answer.strip()
    words = answer.split()
    answer_len = len(words)
    
    if answer_len < 5:
        score = 0
        feedback = "No proper answer provided. Please try speaking or typing a complete response."
    else:
        # Base score from length (up to 40)
        score = min(40, int((answer_len / 40.0) * 40))
        
        # Keyword bonus (up to 30)
        lower_ans = answer.lower()
        star_keywords = ['situation', 'task', 'action', 'result', 'because', 'led', 'achieved', 'managed', 'however', 'learned', 'improved', 'team', 'goal', 'success', 'challenge']
        matches = sum(1 for kw in star_keywords if kw in lower_ans)
        score += min(30, matches * 5)
        
        # Structure bonus (up to 30)
        sentences = len([s for s in re.split(r'[.!?]+', answer) if s.strip()])
        score += min(30, sentences * 6)
        
        score = min(100, score)
        
        if score < 40:
            feedback = "Your answer lacks detail and structure. Try using the STAR method (Situation, Task, Action, Result) to give a complete response."
        elif score < 70:
            feedback = "Good start, but try to use more action-oriented words (e.g., 'achieved', 'led') and clearly state the final measurable results of your actions."
        elif score < 90:
            feedback = "Strong answer with good structure. To improve, ensure you explicitly tie your results back to the core of the question with specific metrics."
        else:
            feedback = "Excellent answer! You provided great detail, strong action verbs, and addressed the question perfectly."
        
    # Attempt to award gamification points
    try:
        from app.api.gamification import award_points_for_action
        from app.db.database import SessionLocal
        db = SessionLocal()
        award_points_for_action(current_user, "mock_interview_completed", db)
        db.close()
    except Exception:
        pass
        
    return {"score": score, "feedback": feedback}
