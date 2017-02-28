from flask import Flask, jsonify, make_response, abort, request

app = Flask(__name__)


@app.route('/')
def index():
    return "Hello, World!"


@app.route('/tomtom', methods=['POST'])
def tomtom_data():
    if not request.json:
        abort(404)
    print(request.json)
    return jsonify({'ok': 1})


@app.errorhandler(404)
def not_found(error):
    """jsonify 404"""
    return make_response(jsonify({'error': 'not found'}), 404)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
