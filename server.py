#!/usr/bin/env python3
"""
Servidor HTTP simples para rodar o jogo de Halloween
Execute: python server.py
Acesse: http://localhost:8000
"""

import http.server
import socketserver
import os

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🎃 Servidor rodando em http://localhost:{PORT}")
        print(f"📁 Servindo arquivos de: {os.getcwd()}")
        print("⚠️  Pressione Ctrl+C para parar o servidor")
        print("\n🚀 Abra seu navegador e acesse: http://localhost:8000\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Servidor encerrado!")

if __name__ == "__main__":
    main()