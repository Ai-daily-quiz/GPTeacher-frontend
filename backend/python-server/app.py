from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)
CORS(app)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

model = genai.GenerativeModel('gemini-2.0-flash') # 문제 출제 ?
categories = ["역사", "과학", "문학", "경제", "사회", "문화", "기술", "예술"]

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    try:
        clipboard = request.get_json()

        if not clipboard or 'text' not in clipboard:
            return jsonify({"error": "No text provided"}), 400

        text = clipboard['text']
        # 데이터 클렌징 위치
        text = cleanse_text(text)

        prompt = f"""
        다음 텍스트를 분석해서 아래 카테고리 중 가장 적합한 6개를 선택하고,
        각 카테고리에 대한 구체적인 세부 주제를 생성해줘
        세부 주제당 O/X퀴즈하나 사지선답 객관식 문제하나 총 두개씩 만들어 줘

        카테고리: {', '.join(categories)}

        텍스트: {text[:5000]}

        다음 JSON 형식으로만 응답해주세요:
        {{
            "topics": [
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
                {{"category": "카테고리", "title": "제목", "description": "주제 설명", "quizOX": "OX 문제", quizMultipleChoice: "객관식 문제" }},
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