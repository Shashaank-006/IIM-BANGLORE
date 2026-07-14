# """
# Image Analyzer

# Receives:

# Expected Asset

# +

# Satellite Image

# Returns

# Gemini JSON
# """

# import json

# from PIL import Image

# from ai.gemini_client import ask_gemini
# from ai.prompt_templates import SYSTEM_PROMPT


# def analyze_image(image_path, expected_asset):

#     image = Image.open(image_path)

#     prompt = f"""

# Expected Infrastructure:

# {expected_asset}

# Analyse this satellite image.

# Compare the expected infrastructure
# with what you observe.

# Return ONLY JSON.

# """

#     response = ask_gemini(

#         [

#             SYSTEM_PROMPT,

#             image,

#             prompt

#         ]

#     )

#     try:

#         response = response.strip()

#         if response.startswith("```"):
#             response = response.replace("```json", "")
#             response = response.replace("```", "")
#             response = response.strip()

#         data = json.loads(response)

#         return data

#     except:

#         print(response)

#         return None


# if __name__ == "__main__":

#     result = analyze_image(

#         "ai/sample_images/verified_road.png",

#         "Road"

#     )

#     print(result)

"""
Image Analyzer

Receives:
- Project Metadata
- Satellite Image

Returns:
Structured Gemini JSON
"""

import json
from PIL import Image

from ai.gemini_client import ask_gemini
from ai.prompt_templates import SYSTEM_PROMPT


def analyze_image(image_path, project):
    """
    Analyze a satellite image against a project's expected infrastructure.

    Args:
        image_path (str): Path to the satellite image.
        project (dict): Project metadata.

    Returns:
        dict | None
    """

    image = Image.open(image_path).convert("RGB")

    prompt = f"""
You are an AI Infrastructure Auditor.

Project Details

Project ID: {project["project_id"]}
Project Name: {project["project_name"]}
Expected Infrastructure: {project["expected_asset"]}
Budget: {project["budget"]}
Expected Length: {project["length"]}
Expected Width: {project["width"]}
District: {project["district"]}
Village: {project["village"]}
GPS Coordinates: {project["gps"]}

Analyse the provided satellite image carefully.

Determine:

1. Whether the expected infrastructure exists.
2. Estimated construction stage.
3. Confidence score (0-100).
4. Trust score (0-100).
5. Visible evidence.
6. Fraud indicators.
7. Recommendation.

Return ONLY valid JSON.

Expected JSON format:

{{
    "project_id": "{project["project_id"]}",

    "expected_asset": "{project["expected_asset"]}",

    "asset_detected": true,

    "construction_stage": "Completed",

    "confidence": 96,

    "trust_score": 92,

    "fraud_indicators": {{
        "missing_construction": false,
        "wrong_location": false,
        "vegetation_unchanged": false,
        "possible_fake_claim": false
    }},

    "observations": [
        "Road surface detected",
        "Lane markings visible",
        "Vegetation cleared"
    ],

    "recommendation": "Manual inspection not required."
}}

Do not explain anything.

Return JSON only.
"""

    response = ask_gemini(
        [
            SYSTEM_PROMPT,
            image,
            prompt
        ]
    )

    if response is None:
        return None

    try:

        response = response.strip()

        if response.startswith("```"):
            response = response.replace("```json", "")
            response = response.replace("```", "")
            response = response.strip()

        data = json.loads(response)

        return data

    except json.JSONDecodeError:

        print("\nGemini returned invalid JSON:\n")
        print(response)

        return None


if __name__ == "__main__":

    project = {

        "project_id": "TN-RD-001",

        "project_name": "Village Road Construction",

        "expected_asset": "Road",

        "budget": "₹12 Crore",

        "length": "2 km",

        "width": "6 m",

        "district": "Chennai",

        "village": "Village X",

        "gps": "13.0827,80.2707"

    }

    result = analyze_image(

        "ai/sample_images/verified_road.png",

        project

    )

    print(json.dumps(result, indent=4))