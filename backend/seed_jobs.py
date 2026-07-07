from app.db.database import SessionLocal
from app.models.job import Job
from app.models.user import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    db = SessionLocal()
    # Create a dummy recruiter if not exists
    recruiter = db.query(User).filter(User.email == "recruiter@apple.com").first()
    if not recruiter:
        recruiter = User(
            email="recruiter@apple.com",
            hashed_password=pwd_context.hash("password"),
            full_name="Apple Recruiting",
            role="recruiter"
        )
        db.add(recruiter)
        db.commit()
        db.refresh(recruiter)

    # Add jobs
    if db.query(Job).count() == 0:
        jobs = [
            Job(
                recruiter_id=recruiter.id,
                title="Senior Frontend Engineer",
                company_name="Apple",
                location="Cupertino, CA",
                salary_range="$150k - $200k",
                job_type="On-site",
                description="We are looking for an experienced frontend engineer to build the next generation of Apple Web services using React and Next.js."
            ),
            Job(
                recruiter_id=recruiter.id,
                title="Product Designer",
                company_name="Spotify",
                location="New York, NY",
                salary_range="$130k - $170k",
                job_type="Hybrid",
                description="Join the Spotify design team to craft beautiful, intuitive music experiences for millions of users worldwide."
            ),
            Job(
                recruiter_id=recruiter.id,
                title="Backend Developer",
                company_name="Stripe",
                location="Remote",
                salary_range="$160k - $220k",
                job_type="Remote",
                description="Help us build the economic infrastructure of the internet. We need strong Python and Go developers."
            )
        ]
        db.add_all(jobs)
        db.commit()
        print("Jobs seeded successfully!")
    else:
        print("Jobs already exist.")
        
    db.close()

if __name__ == "__main__":
    seed()
