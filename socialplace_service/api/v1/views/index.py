#!/usr/bin/python3
""" Index """
from models.user import User
from models.community import Community
from models.post import Post
from models import storage
from models.engine.redis_storage import storage as redis_storage
from api.v1.views import app_views
from flask import jsonify


@app_views.route('/status', methods=['GET'], strict_slashes=False)
def status():
    """ Status of API """
    return jsonify({'api_status': 'OK', 'mongodb': storage.status()})


@app_views.route('/stats', methods=['GET'], strict_slashes=False)
def number_objects():
    """ Retrieves the number of documents for each object type """
    classes = [User, Community, Post]  # Add all your model classes here
    names = ["users", "communities", "posts"]  # Add corresponding names

    num_objs = {}
    for i in range(len(classes)):
        count = storage.count(classes[i])
        num_objs[names[i]] = count

    return jsonify(num_objs)


@app_views.route('/connect', methods=['POST'], strict_slashes=False)
def connect_user():
    """
    Log in a user
    """
    data = request.get_json()
    if not data:
        return jsonify(error="Not a JSON"), 400
    if 'email' not in data or 'password' not in data:
        return jsonify(error="Missing email or password"), 400

    email = data['email']
    password = data['password']

    # Verify the email and password (e.g., from your MongoDB or any other database)
    user = storage.get(User, email=email)
    if user and checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        # User is authenticated
        token = redis_storage.set_user_session(email)
        return jsonify(success="User logged in", token=token), 200
    else:
        return jsonify(error="Invalid email or password"), 401

@app_views.route('/disconnect', methods=['DELETE'], strict_slashes=False)
def disconnect_user():
    """
    Log out a user
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return jsonify(error="Missing Authorization header"), 401

    token = auth_header.split()[-1]
    email = redis_storage.get_user_session(token)
    
    if email:
        # User is authenticated, log them out
        redis_storage.delete_user_session(token)
        return jsonify(success="User logged out"), 200
    else:
        return jsonify(error="Invalid or expired token"), 401
