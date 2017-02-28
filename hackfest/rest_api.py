from flask import Flask, jsonify, make_response, abort, request

app = Flask(__name__)


@app.route('/')
def index():
    return "Hello, World!"


@app.route('/tomtom', methods=['POST'])
def post_tomtom_data():
    if not request.json:
        abort(404)
    print(request.json)
    return jsonify({'ok': 1})


@app.route('/pubkey', methods=['POST'])
def post_pubkey():
    device_id = request.form.get('device_id', None)
    pubkey = request.form.get('pubkey', None)
    message = request.form.get('message', None)
    if not pubkey or not device_id:
        return jsonify({'error': 'invalid request'}), 404

    print(device_id, pubkey, message)
    return make_response(jsonify({'ok': 1}))


@app.errorhandler(404)
def not_found(error):
    """jsonify 404"""
    return make_response(jsonify({'error': 'not found'}), 404)


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
