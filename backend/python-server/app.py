from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({
        "message": "Python server is running!",
        "server": "Flask",
        "port": 5001
    })

@app.route('/api/relay', methods=['POST'])
def relay_from_node():

    data = request.get_json()
    print(f"🟢 Node.js => Python : {data}")
    result = {
        'pythonReceived': True,
        'processedAt': datetime.now().isoformat(),
        'originalData': data,
        'pythonMessage': f"Python이 처리했습니다: {data.get('message')}"
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)