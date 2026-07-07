def calculate_match_score(job_desc: str, job_title: str, user_skills: str, user_bio: str) -> int:
    """
    Simulates an AI Resume Matcher by calculating a score (0-100) 
    based on keyword intersections between the job and the user's profile.
    """
    if not user_skills and not user_bio:
        return 20 # Baseline for empty profile
        
    TECH_SKILLS = [
        "python", "react", "next.js", "fastapi", "node.js", "typescript", 
        "javascript", "html", "css", "sql", "postgresql", "docker", "aws", 
        "git", "java", "c++", "c#", "machine learning", "data science", 
        "angular", "vue", "django", "flask", "kubernetes", "frontend", "backend", "fullstack", "designer", "product", "manager", "software", "engineer", "developer"
    ]
    
    job_text = f"{job_desc} {job_title}".lower()
    user_text = f"{user_skills or ''} {user_bio or ''}".lower()
    
    job_extracted = [skill for skill in TECH_SKILLS if skill in job_text]
    user_extracted = [skill for skill in TECH_SKILLS if skill in user_text]
    
    # If the job has no specific skills we can parse, fallback to word overlap
    if not job_extracted:
        job_words = set(job_text.split())
        user_words = set(user_text.split())
        # Remove common stop words roughly
        stop_words = {"and", "the", "a", "an", "is", "for", "to", "in", "at", "with", "of"}
        job_words = job_words - stop_words
        user_words = user_words - stop_words
        
        intersection = job_words.intersection(user_words)
        match_score = len(intersection) * 15
        return min(max(25 + match_score, 25), 98)
        
    # Calculate percentage of job skills met by user
    matched_skills = set(job_extracted).intersection(set(user_extracted))
    
    # Base score for just applying
    base_score = 30
    
    # If they match skills, give them a high score
    skill_match_pct = len(matched_skills) / len(job_extracted)
    
    final_score = int(base_score + (skill_match_pct * 65))
    
    return min(max(final_score, 30), 98)
