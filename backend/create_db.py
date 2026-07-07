import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    # Connect to the default 'postgres' database to create a new one
    try:
        conn = psycopg2.connect(
            user="postgres",
            password="Ani#@123",
            host="localhost",
            port="5432",
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'jobzmitradb'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute("CREATE DATABASE jobzmitradb")
            print("Database 'jobzmitradb' created successfully!")
        else:
            print("Database 'jobzmitradb' already exists.")
            
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_db()
