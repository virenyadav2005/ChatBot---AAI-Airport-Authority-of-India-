from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='frontend code')

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(
        host='localhost',
        port=8000,
        ssl_context=(
            'cert/cert.pem',  # certificate
            'cert/key.pem'    # private key
        ),
        debug=True
    ) 