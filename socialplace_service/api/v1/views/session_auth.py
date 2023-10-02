#!/usr/bin/env python3
""" Module of Session authentication views
"""
from api.v1.views import app_views
from flask import abort, jsonify, request
from models.user import User
from os import getenv


@app_views.route('auth_session/login', methods=['POST'],
                 strict_slashes=False)
def login() -> str:
    """ POST /api/v1/auth_session/login
    Return:
      - User object JSON represented
    """
    user_email = request.form.get('email')
    user_pwd = request.form.get('password')
    #
    if user_email is None or user_email == "":
        return jsonify({"error": "email missing"}), 400
    #
    if user_pwd is None or user_pwd == "":
        return jsonify({"error": "password missing"}), 400
    #
    try:
        users = User.search({'email': user_email})
    except Exception:
        return jsonify({"error": "no user found for this email"}), 404
    #
    if len(users) == 0:
        return jsonify({"error": "no user found for this email"}), 404
    #
    if users[0].is_valid_password(user_pwd):
        from api.v1.app import auth
        session_id = auth.create_session(users[0].id)
        response = make_response(jsonify(user[0].to_json()), 200)
        response.set_cookie(getenv('SESSION_NAME'), session_id)
        return response
    return jsonify({"error": "wrong password"}), 401


@app_views.route('auth_session/logout', methods=['DELETE'],
                 strict_slashes=False)
def logout() -> str:
    """ DELETE /api/v1/auth_session/logout
    Return:
      - empty JSON
    """
    from api.v1.app import auth
    if auth.destroy_session(request) is False:
        abort(404)
    return jsonify({}), 200
