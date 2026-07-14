# import os

# from dotenv import load_dotenv
# from google import genai

# # Load .env file
# load_dotenv()

# # Read API key
# api_key = os.getenv("GEMINI_API_KEY")

# # Create client
# client = genai.Client(api_key=api_key)

# # Ask Gemini a simple question
# response = client.models.generate_content(
#     model="gemini-2.5-flash-lite",
#     contents="Explain ghost infrastructure in one sentence."
# )

# print(response.text)

# import os
# from dotenv import load_dotenv
# from google import genai

# load_dotenv()

# api_key = os.getenv("GEMINI_API_KEY")

# client = genai.Client(api_key=api_key)

# response = client.models.generate_content(
#     model="gemini-3.5-flash",
#     contents="Explain ghost infrastructure in one sentence."
# )

# print(response.text)


# import os

# from dotenv import load_dotenv
# from google import genai

# from ai.prompt_templates import SYSTEM_PROMPT

# load_dotenv()

# client = genai.Client(
#     api_key=os.getenv("GEMINI_API_KEY")
# )

# response = client.models.generate_content(

#     model="gemini-3.5-flash",

#     contents=[
#         SYSTEM_PROMPT,
#         "What is Ghost Infrastructure?"
#     ]
# )

# print(response.text)

import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise Exception("GEMINI_API_KEY not found.")

client = genai.Client(api_key=API_KEY)


import time

def ask_gemini(contents):

    for attempt in range(3):

        try:

            response = client.models.generate_content(

                model="gemini-3.1-flash-lite",

                contents=contents

            )

            return response.text

        except Exception as e:

            print(e)

            if attempt < 2:
                time.sleep(2 ** attempt)

    return None