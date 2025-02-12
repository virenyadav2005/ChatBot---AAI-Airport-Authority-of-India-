import http.server
import ssl
import os

# Server configuration
server_address = ('localhost', 8000)
directory = 'frontend code'  # Your static files directory

# Change to the directory containing your HTML/CSS/JS files
os.chdir(directory)

# Create handler
handler = http.server.SimpleHTTPRequestHandler

# Create HTTPS server
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('cert/cert.pem', 'cert/key.pem')  # Your certificate files

# Start server
with http.server.HTTPServer(server_address, handler) as httpd:
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    print(f'Server running on https://{server_address[0]}:{server_address[1]}')
    httpd.serve_forever() 