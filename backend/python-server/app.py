from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv()
app = Flask(__name__)
CORS(app)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-2.0-flash') # 문제 출제 ?
# categories = ["역사", "과학", "문학", "경제", "사회", "문화", "기술", "예술"]
categories = ["문화/예술", "경제/경영", "엔터테인먼트", "음식/요리", "게임", "일반상식", "지리", "역사", "IT/기술", "언어/문학", "의학/건강", "자연/환경", "정치/사회", "과학", "스포츠"]



@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    try:
        clipboard = request.get_json()
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")

        if not clipboard or 'text' not in clipboard:
            return jsonify({"error": "No text provided"}), 400

        text = clipboard['text']
        # 데이터 클렌징 위치
        text = cleanse_text(text)

        prompt = f"""
        다음 텍스트를 분석해서 아래 카테고리 중 가장 적합한 4개의 세부 주제 선택해서 제시해줘.
        각 카테고리에 대한 구체적인 세부 주제를 생성해줘.
        카테고리: {', '.join(categories)}

        텍스트: {text[:10000]}

        아래 주제 한개의 JSON형식 참고해서 topics 배열로 응답해줘
        id는 {formatted_date} 을 추가하고 second를 하나씩 더해서 만들어줘.

        - 객관식: "category-YYMMDD-HHMMSS-mc-001"
        - OX문제: "category-YYMMDD-HHMMSS-ox-001"
        주제당 객관식 하나 OX 하나 만들어줘.
        type: multiple의 correctAnswer는 0~3 까지 index랑 동일하게 줘.
        type: ox의 correctAnswer는 0~1 까지 index랑 동일하게 줘. ('O' = index 0)
        {{
          "topics": [
            {{
              "id": "technology-240702-193156",
              "category": "기술",
              "title": "기계식 키보드",
              "description": "...",
              "questions": [
                {{
                  "id": "technology-240702-193156-mc-001",
                  "type": "multiple",
                  "question": "...",
                  "options": [...],
                  "correctAnswer": 3,
                  "explanation": "..."
                }},
                {{
                  "id": "technology-240702-193156-ox-001",
                  "type": "ox",
                  "question": "...",
                  "options": ["O", "X"]
                  "correctAnswer": 1,
                  "explanation": "..."
                }}
              ]
            }}
          ]
        }}
        """

        response = model.generate_content(prompt)
        response_text = response.text.strip()

        # JSON 블록 처리
        if response_text.startswith('```json'):
            response_text = response_text[7:-3]
        elif response_text.startswith('```'):
            response_text = response_text[3:-3]

        result = json.loads(response_text)

        return jsonify({
            "success": True,
            "result": result
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

def cleanse_text(text):
    original_length = len(text)
    while '  ' in text : # 2공백 => 1공백
        text = text.replace('  ', ' ')

    processed_length = len(text)
    print(f"original_length : {original_length}")
    print(f"processed_length : {processed_length}")

    while '\n\n\n\n' in text: # 4줄바꿈 => 1줄바꿈
        text = text.replace('\n\n\n\n', '\n')
    while '\n\n\n' in text: # 4줄바꿈 => 1줄바꿈
        text = text.replace('\n\n\n', '\n')
    while '\n\n' in text: # 4줄바꿈 => 1줄바꿈
        text = text.replace('\n\n', '\n')

    text = text.strip() # 좌우 공백
    text = text.replace('\t', ' ') #탭 => 공백하나

    return text


if __name__ == '__main__':
    print("🟢 Python 서버 시작중...")
    app.run(debug=True, port=5001)
