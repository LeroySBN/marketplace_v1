#!/usr/bin/python3
""" Social place Flask Application """
from api.v1.views import app_views
from flask import Flask, make_response, jsonify
from flask_cors import CORS
from os import environ
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.register_blueprint(app_views)
cors = CORS(app, resources={r"/api/v1/*": {"origins": "*"}})


@app.errorhandler(404)
def not_found(error):
    """ 404 Error
    ---
    responses:
      404:
        description: a resource was not found
    """
    return make_response(jsonify({'error': "Not found"}), 404)


if __name__ == "__main__":
    """ Main Function """
    host = environ.get('SOCIALPLACE_API_HOST')
    port = environ.get('SOCIALPLACE_API_PORT')
    if not host:
        host = '0.0.0.0'
    if not port:
        port = '8080'
    app.run(host=host, port=port, threaded=True)
