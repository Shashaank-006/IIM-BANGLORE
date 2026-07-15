import os
import shutil
import json
import tempfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from databases.database import SessionLocal
from models.models import Project, Verification
from ai.image_analyzer import analyze_image

router = APIRouter()

# Helper function to get db session per request
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


@router.post("/analyze")
async def analyze_satellite_image(
    file: UploadFile = File(...),
    project_id: str = Form(...)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, and PNG images are supported.")

    db = get_db()
    # 1. Lookup project metadata
    p = db.query(Project).filter((Project.project_id == project_id) | (Project.id == project_id)).first()
    
    project_metadata = {
        "project_id": project_id,
        "project_name": "General Infrastructure Project",
        "expected_asset": "Road",
        "budget": "Unknown",
        "length": "N/A",
        "width": "N/A",
        "district": "Unknown",
        "village": "Unknown",
        "gps": "20.5937,78.9629"
    }

    if p:
        project_metadata["project_name"] = p.project_name
        project_metadata["budget"] = f"₹{p.budget / 100000:.1f} Lakhs" if p.budget < 10000000 else f"₹{p.budget / 10000000:.2f} Crores"
        project_metadata["district"] = p.district
        
        if p.extended_data:
            try:
                data = json.loads(p.extended_data)
                project_metadata["expected_asset"] = data.get("projectType") or data.get("scheme") or "Road"
                project_metadata["village"] = data.get("village") or data.get("taluk") or "N/A"
                
                coords = data.get("coordinates")
                if coords and len(coords) >= 2:
                    project_metadata["gps"] = f"{coords[0]},{coords[1]}"
                    
                meta = data.get("metadata", {})
                if meta:
                    project_metadata["length"] = f"{meta.get('roadLength')} km" if meta.get('roadLength') else "N/A"
                    project_metadata["width"] = f"{meta.get('roadWidth')} m" if meta.get('roadWidth') else "N/A"
            except Exception:
                pass
    
    # 2. Save uploaded file to temporary directory
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"upload_{project_id}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Call AI image analyzer
        analysis_result = analyze_image(temp_file_path, project_metadata)
        
        if not analysis_result:
            raise HTTPException(
                status_code=500, 
                detail="Gemini AI analysis failed. Please verify that your GEMINI_API_KEY is configured correctly."
            )
            
        # Save verification log to DB
        verification_log = Verification(
            project_id=project_id,
            status="Completed" if analysis_result.get("asset_detected") else "Flagged",
            confidence=analysis_result.get("confidence", 0),
            recommendation=analysis_result.get("recommendation", ""),
            details=json.dumps(analysis_result)
        )
        db.add(verification_log)
        db.commit()
        
        return analysis_result

    except Exception as e:
        print(f"Error during AI analysis: {e}")
        # If it's already an HTTP exception, re-raise it
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Image analysis pipeline error: {str(e)}")
        
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
