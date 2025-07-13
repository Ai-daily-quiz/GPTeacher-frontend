from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import json
from dotenv import load_dotenv
import os
from datetime import datetime
from supabase import create_client, Client
import jwt
from cachetools import TTLCache
import PyPDF2

load_dotenv()
app = Flask(__name__)
CORS(app)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(url, key)

model = genai.GenerativeModel("gemini-2.0-flash")
MAX_TEXT_LENGTH = 10000
JSON_MARKDOWN_PREFIX_LENGTH = 7
JSON_MARKDOWN_SUFFIX_LENGTH = 3

cache = TTLCache(maxsize=1, ttl=300)  # 5분간만 캐시


def cache_get_topics():
    if "topics" not in cache:
        topics = supabase.table("topics").select("*").execute()

        topics_ref = []
        category_ref = []
        for topic in topics.data:
            topic_id = topic["id"]
            topic_prefix = topic_id.split("-")[0]
            topics_ref.append(topic_prefix)
            category_ref.append(topic["topic"] + " : " + topic["description"])

        cache["topics"] = (topics_ref, category_ref)
    else:
        print("⚡️ 캐시에서 데이터 사용")

    return cache["topics"]


def generate_quiz(text, user_id, formatted_date):
    prompt = f"""
         **중요 다음 텍스트를 분석해서 적합한 카테고리를 2개 찾아줘.
        찾은 카테고리들은 겹치지 않게 서로 다른 카테고리들로만 골라줘 **

        카테고리 주제 수 : 서로 다른 4개
        주제당 퀴즈 문제 수 : 2개
            - 카테고리 주제 당 ox 문제 수 : 1개
            - 카테고리 주제 당 multiple a문제 수 : 1개
        => 전체 총 question 퀴즈 문제 수 8개

        카테고리 분류기준 : {category_ref}**

        텍스트: {text[:MAX_TEXT_LENGTH]}

        아래 주제 한개의 JSON형식 참고해서 topics 배열로 응답해줘
        id는 영어와 숫자의 조합으로 만들어주고. {formatted_date} 을 추가하고 second를 하나씩 더해서 만들어줘.

        - 객관식: "category(영어)-YYMMDD-HHMMSS-mc"
        - OX문제: "category(영어)-YYMMDD-HHMMSS-ox"
        **중요: topic_id 와 quiz_id 는 반드시
        topic_id : technology(영어)-YYMMDD-HHMMSS
        quiz_id : category(영어)-mc-YYMMDD-HHMMSS
        ** 형식을 지키고,
        category 영어는 리스트 : {topics_ref} 을 참고해서 만들어줘.

        type: multiple의 correct_answer 0~3 까지 index랑 동일하게 줘.
        type: ox의 correct_answer 0~1 까지 index랑 동일하게 줘. ('O' = index 0)
        {{
        "topics": [
        {{
            "topic_id": "technology(영어)-240702-193156",
            "category": "기술",
            "title": "기계식 키보드",
            "description": "...",
            "questions": [
            {{
                "quiz_id": "technology-mc-240702-193156",
                "type": "multiple",
                "question": "...",
                "options": [...],
                "correct_answer": 3,
                "explanation": "..."
            }},
            {{
                "quiz_id": "technology-240702-193156-ox-001",
                "type": "ox",
                "question": "...",
                "options": ["O", "X"],
                "correct_answer": 1,
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
        topic_id = topic["topic_id"]

        for q in topic["questions"]:
            quiz_data = {
                "quiz_id": q["quiz_id"],
                "topic_id": topic_id,
                "user_id": user_id,
                "category": category,
                "quiz_type": "multiple_choice" if q["type"] == "multiple" else "ox",
                "question": q["question"],
                "options": q["options"],
                "correct_answer": q["correct_answer"],
                "explanation": q["explanation"],
                "quiz_status": "pending",
                "topic_status": "pending",
            }
            quiz_list.append(quiz_data)

    return quiz_list, result


topics_ref, category_ref = cache_get_topics()


def verify_token_and_get_uuid(token):
    try:
        decoded = jwt.decode(token, options={"verify_signature": False})
        return decoded["sub"]
    except:
        return None


@app.route("/api/quiz/count-pending", methods=["GET"])
def count_pending_quiz():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        userInfo = supabase.auth.get_user(token)
        user_id = userInfo.user.id
        response = (
            supabase.table("quizzes")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .eq("quiz_status", "pending")
            .execute()
        )

        return jsonify(
            {
                "success": True,
                "pending_count": response.count,
            }
        )

    except Exception as e:
        print("에러 : ", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/quiz/count-incorrect", methods=["GET"])
def count_incorrect_quiz():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        userInfo = supabase.auth.get_user(token)
        user_id = userInfo.user.id
        response = (
            supabase.table("quizzes")
            .select("*", count="exact")
            .eq("user_id", user_id)
            .eq("result", "fail")
            .execute()
        )

        return jsonify(
            {
                "success": True,
                "incorrect_count": response.count,
            }
        )

    except Exception as e:
        print("에러 : ", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/quiz/pending", methods=["GET"])
def get_pending_quiz():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        userInfo = supabase.auth.get_user(token)
        user_id = userInfo.user.id

        response = (
            supabase.table("quizzes")
            .select("*")
            .eq("user_id", user_id)
            .eq("quiz_status", "pending")
            .execute()
        )

        category_group = {}
        for quiz in response.data:
            category = quiz["category"]
            topic_id = quiz["topic_id"]

            if category not in category_group:
                category_group[category] = {
                    "category": category,
                    "topic_id": topic_id,
                    "questions": [],
                }
            category_group[category]["questions"].append(quiz)
        category_list = list(category_group.values())

        return jsonify(
            {
                "success": True,
                "result": category_list,
                "pending_count": len(response.data),
            }
        )

    except Exception as e:
        print("에러 : ", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/quiz/incorrect", methods=["GET"])
def get_incorrect_quiz():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    try:
        userInfo = supabase.auth.get_user(token)
        user_id = userInfo.user.id

        response = (
            supabase.table("quizzes")
            .select("*")
            .eq("user_id", user_id)
            .eq("result", "fail")
            .execute()
        )

        category_group = {}
        for quiz in response.data:
            category = quiz["category"]
            topic_id = quiz["topic_id"]

            if category not in category_group:
                category_group[category] = {
                    "category": category,
                    "topic_id": topic_id,
                    "questions": [],
                }
            category_group[category]["questions"].append(quiz)
        category_list = list(category_group.values())

        return jsonify(
            {
                "success": True,
                "result": category_list,
                "incorrect_count": len(response.data),
            }
        )

    except Exception as e:
        print("에러 : ", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/quiz/submit", methods=["POST"])
def submit_quiz():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    userInfo = supabase.auth.get_user(token)

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provieded"}), 400
    quiz_id = data.get("quizId")
    if len(quiz_id) > 50:
        return jsonify({"error": "Invalid quiz_id"}), 400
    topic_id = data.get("topicId")
    if len(topic_id) > 50:
        return jsonify({"error": "Invalid topic_id"}), 400
    user_choice = data.get("userChoice")
    result = data.get("result")
    questionIndex = data.get("questionIndex")
    totalIndex = data.get("totalIndex")

    try:
        userInfo = supabase.auth.get_user(token)

        supabase.table("quizzes").update(
            {
                "exam_date": "now()",
                "your_choice": user_choice,
                "result": result,
                "quiz_status": "done",
            }
        ).eq("user_id", userInfo.user.id).eq("quiz_id", quiz_id).execute()
        print("🟢 questionIndex : ", questionIndex)
        print("🟢 topic_id : ", topic_id)

        supabase.table("quizzes").update(
            {
                "topic_status": "done" if questionIndex == totalIndex else "pending",
            }
        ).eq("user_id", userInfo.user.id).eq("topic_id", topic_id).execute()

        return jsonify({"success": True, "message": "퀴즈 결과가 저장되었습니다."})

    except Exception as e:
        print("에러 : ", e)
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyze-file", methods=["POST"])
def analyze_file():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    userInfo = supabase.auth.get_user(token)
    user_id = userInfo.user.id

    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")

        if "file" not in request.files:
            return (
                jsonify({"error": "No file"}),
                400,
            )

        file = request.files["file"]
        reader = PyPDF2.PdfReader(file)
        all_text = ""
        for page in reader.pages:
            all_text += page.extract_text()

        text = preprocessing_clipBoard_text(all_text)
        quiz_list, result = generate_quiz(text, user_id, formatted_date)

        # 배치 삽입
        if quiz_list:
            supabase.table("quizzes").insert(quiz_list).execute()

        return jsonify(
            {"success": True, "result": result, "total_question": len(quiz_list)}
        )

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_text():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    userInfo = supabase.auth.get_user(token)
    user_id = userInfo.user.id
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        request_data = request.get_json()
        now = datetime.now()
        formatted_date = now.strftime("%Y-%m-%d %H:%M:%S")

        if not request_data or "text" not in request_data:
            return jsonify({"error": "No text provided"}), 400

        input_text = request_data["text"]
        # 데이터 클렌징 위치
        text = preprocessing_clipBoard_text(input_text)
        quiz_list, result = generate_quiz(text, user_id, formatted_date)

        # 배치 삽입
        if quiz_list:
            supabase.table("quizzes").insert(quiz_list).execute()

        return jsonify(
            {"success": True, "result": result, "total_question": len(quiz_list)}
        )
        # return jsonify({"success": True, "result": result})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


def preprocessing_clipBoard_text(text):
    original_length = len(text)
    while "  " in text:  # 2공백 => 1공백
        text = text.replace("  ", " ")

    processed_length = len(text)
    print(f"original_length : {original_length}")
    print(f"processed_length : {processed_length}")

    while "\n\n\n\n" in text:  # 4줄바꿈 => 1줄바꿈
        text = text.replace("\n\n\n\n", "\n")
    while "\n\n\n" in text:  # 4줄바꿈 => 1줄바꿈
        text = text.replace("\n\n\n", "\n")
    while "\n\n" in text:  # 4줄바꿈 => 1줄바꿈
        text = text.replace("\n\n", "\n")

    text = text.strip()  # 좌우 공백
    text = text.replace("\t", " ")  # 탭 => 공백하나

    return text


def preprocessing_ai_response(prompt):
    response = model.generate_content(prompt)
    response_text = response.text.strip()

    if response_text.startswith("```json"):
        response_text = response_text[
            JSON_MARKDOWN_PREFIX_LENGTH:-JSON_MARKDOWN_SUFFIX_LENGTH
        ]
    elif response_text.startswith("```"):
        response_text = response_text[
            JSON_MARKDOWN_SUFFIX_LENGTH:-JSON_MARKDOWN_SUFFIX_LENGTH
        ]

    result = json.loads(response_text)
    return result


if __name__ == "__main__":
    print("Python 서버 시작중...")
    app.run(debug=True, port=5001)
