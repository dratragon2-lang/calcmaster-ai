import os
from flask_cors import CORS
from flask import Flask, jsonify, request
from differentiator import derive_expression

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "CalcMaster AI Math Service"
    })


@app.route("/derive", methods=["POST"])
def derive():

    try:
        data = request.get_json()

        expression = data.get("expression")

        if not expression:
            return jsonify({
                "error": "Expression is required"
            }), 400

        result = derive_expression(expression)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=False)