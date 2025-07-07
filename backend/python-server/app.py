from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os
from datetime import datetime
from supabase import create_client, Client
import jwt
import uuid

load_dotenv()
app = Flask(__name__)
CORS(app)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

model = genai.GenerativeModel('gemini-2.0-flash') # 문제 출제 ?

topics_id = supabase.table('topics').select("id").execute()
topics_ref = []
for row in topics_id.data :
    topic_id = row["id"]
    topic_prefix = topic_id.split("-")[0]
    topics_ref.append(topic_prefix)

topics = supabase.table('topics').select("*").execute()
category_ref = []
for topic in topics.data:
    category_ref.append(topic['topic'] + " : " +topic['description'])

def verify_token_and_get_uuid(token):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded['sub']  # user UUID
    except:
        return None

@app.route('/api/quiz/pending', methods=['GET'])
def get_pending_quiz():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')
    try:
        userInfo = supabase.auth.get_user(token)
        user_id = userInfo.user.id

        response = supabase.table('quizzes').select("question").eq("user_id",user_id).eq("status","pending").execute()
        return jsonify({
            "success": True,
            "result": response.data
        })

    except Exception as e:
        print("에러 : ",e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')

    data = request.get_json()
    quiz_id = data.get('quizId')      # Python에서는 이렇게 추출
    user_choice = data.get('userChoice')
    result = data.get('result')

    try:
      userInfo = supabase.auth.get_user(token)

      supabase.table("quizzes").update({
          "exam_date": "now()",
          "your_choice": user_choice,
          "result": result,
          "status": "done"
      }).eq("user_id",userInfo.user.id).eq("quiz_id",quiz_id).execute()
      return jsonify({
              'success': True,
              'message': '퀴즈 결과가 저장되었습니다.'
          })


    except Exception as e:
        print("에러 : ",e)
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_text():
    auth_header = request.headers.get('Authorization', '')
    token = auth_header.replace('Bearer ', '')
    userInfo = supabase.auth.get_user(token)
    user_id = userInfo.user.id
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401

    try:
        request_data = request.get_json()
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")

        if not request_data or 'text' not in request_data:
            return jsonify({"error": "No text provided"}), 400

        input_text = request_data['text']
        # 데이터 클렌징 위치
        text = preprocessing_clipBoard_text(input_text)

        prompt = f"""
        다음 텍스트를 분석해서 아래 카테고리 중 가장 적합한 4개의 세부 주제 선택해서 제시해줘.
        각 카테고리 분류기준을 참고해서 구체적인 세부 주제를 생성해줘.
        카테고리 분류기준 : {category_ref}

        텍스트: {text[:10000]}

        아래 주제 한개의 JSON형식 참고해서 topics 배열로 응답해줘
        id는 영어와 숫자의 조합으로 만들어주고. {formatted_date} 을 추가하고 second를 하나씩 더해서 만들어줘.

        - 객관식: "category(영어)-YYMMDD-HHMMSS-mc-001"
        - OX문제: "category(영어)-YYMMDD-HHMMSS-ox-001"
        **중요: ID는 반드시 category(영어)-YYMMDD-HHMMSS-mc-001** 형식을 지키고,
        category 영어는 리스트 : {topics_ref} 을 참고해서 만들어줘.
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

        result = preprocessing_ai_response(prompt)
        quiz_list = []

        for topic in result["topics"]:
            category = topic["category"]

            for q in topic["questions"]:
                quiz_data = {
                    "quiz_id": q["id"],
                    "user_id": user_id,  # 프론트에서 받은 user_id
                    "topic": category,
                    "quiz_type": "multiple_choice" if q["type"] == "multiple" else "ox",
                    "question": q["question"],
                    "options": q["options"],  # JSON으로 변환 불필요
                    "correct_answer": str(q["correctAnswer"]),
                    "explanation": q["explanation"],
                    "status": "pending"
                    # exam_date, your_choice, result는 NULL로 (나중에 업데이트)
                }
                quiz_list.append(quiz_data)

        # 배치 삽입
        if quiz_list:
            supabase.table("quizzes").insert(quiz_list).execute()

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

def preprocessing_clipBoard_text(text):
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

def preprocessing_ai_response(prompt):
    response = model.generate_content(prompt)
    response_text = response.text.strip()

    if response_text.startswith('```json'):
        response_text = response_text[7:-3]
    elif response_text.startswith('```'):
        response_text = response_text[3:-3]

    result = json.loads(response_text)
    return result

if __name__ == '__main__':
    print("🟢 Python 서버 시작중...")
    app.run(debug=True, port=5001)
