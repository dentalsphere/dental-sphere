import http.server
import socketserver
import os

PORT = 8080

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If the path doesn't have an extension and doesn't end with a slash
        # and there is a corresponding .html file, route it there.
        if '.' not in self.path and not self.path.endswith('/'):
            # Strip query parameters if any
            clean_path = self.path.split('?')[0]
            if os.path.exists(os.path.join(self.directory if hasattr(self, 'directory') else os.getcwd(), clean_path.lstrip('/') + '.html')):
                self.path = self.path + '.html'
        
        return super().do_GET()

Handler = CustomHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
