#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Users """
from models.user import User
from models import storage
from flask import jsonify, request, abort, make_response
from api.v1.views import app_views
from bcrypt import hashpw, gensalt, checkpw
from datetime import datetime

@app_views.route('/users', methods=['GET'], strict_slashes=False)
def get_users():
    """ Retrieves all users """
    users = storage.all(User)
    
    # Convert bytes objects to strings
    user_list = []
    for user in users.values():
        # user_data = user.to_dict()
        for key, value in user.items():
            if isinstance(value, bytes):
                user[key] = value.decode('utf-8')
        user_list.append(user)
    
    return jsonify(user_list)

@app_views.route('/users/<user_id>', methods=['GET'], strict_slashes=False)
def get_user(user_id):
    """ Retrieves a specific user by ID """
    user = storage.get(User, id=user_id)
    if user is None:
        return jsonify(error="Not found"), 404
    return jsonify(user.to_dict())

@app_views.route('/users', methods=['POST'], strict_slashes=False)
def create_user():
    """ Creates a new user """
    data = request.get_json()
    if not data:
        return jsonify(error="Not a JSON"), 400
    if 'email' not in data or data['email'] == "":
        return jsonify(error="Missing email"), 400
    if 'password' not in data or data['password'] == "":
        return jsonify(error="Missing password"), 400

    # Check if email already exists
    existing_user = storage.get(User, email=data['email'])
    if existing_user:
        return jsonify(error="Email already exists"), 400

    # Hash the password and decode it to a string
    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')
    data['password'] = hashed_password

    # Create a new User instance and save it
    new_user = User(**data)
    new_user.save()
    return make_response(jsonify(new_user.to_dict()), 201)

@app_views.route('/users/<user_id>', methods=['PUT'], strict_slashes=False)
def update_user(user_id):
    """ Updates a user by ID """
    user = storage.get(User, id=user_id)
    if user is None:
        return jsonify(error="Not found"), 404
    
    data = request.get_json()
    if not data:
        return jsonify(error="Not a JSON"), 400

    # Define the fields that should not be updated
    fields_not_allowed = ['id', 'dateCreated', 'dateUpdated']

    # Check if any of the fields_not_allowed are in the data
    for field in fields_not_allowed:
        if field in data:
            return jsonify(error=f"Updating '{field}' is not allowed"), 400

    # Check if email is being updated and it already exists
    if 'email' in data:
        if data['email'] == "":
            return jsonify(error="Missing email"), 400
        if data['email'] == user.email:
            return jsonify(error="Email already in use"), 400
        existing_user = storage.get(User, email=data['email'])
        if existing_user and existing_user._id != user._id:
            return jsonify(error="Email already in use"), 400

    # Check if password is being updated and hash it before saving
    if 'password' in data:
        hashed_password = hashpw(data['password'].encode('utf-8'), gensalt()).decode('utf-8')
        data['password'] = hashed_password

    # Update user attributes based on the data
    for key, value in data.items():
        if key != '_id':  # Make sure not to update the _id field
            setattr(user, key, value)

    # Update dateUpdated to the current time
    ftime = '%Y-%m-%dT%H:%M:%S.%f'
    user.dateUpdated = datetime.utcnow()

    # Use the update method in mongostorage to update the user
    storage.update(User, {'_id': user._id}, {'$set': data})

    return jsonify(user.to_dict())

@app_views.route('/users/<user_id>', methods=['DELETE'], strict_slashes=False)
def delete_user(user_id):
    """ Deletes a user by ID """
    user = storage.get(User, user_id)
    if user is None:
        return jsonify(error="Not found"), 404
    storage.delete(user)
    storage.save()
    return jsonify(success="User successfully deleted"), 200
