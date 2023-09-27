from flask import jsonify, request
from models.engine.redis_storage import storage as redis_storage
from bcrypt import hashpw, gensalt
from hashlib import sha1
import mongoClient  # Import your MongoDB client module
import uuid


class Auth:
    """
    This class manages the API authentication
    """
    @staticmethod
    def get_connect():
        """
        Authenticates a user and creates a session
        """
        try:
            auth = request.headers.get('Authorization')

            if not auth:
                return jsonify(error='Unauthorized'), 401

            credentials = auth.split(' ')[1].encode('utf-8')
            credentials = credentials.decode('base64')

            if len(credentials.split(':')) != 2:
                return jsonify(error='Unauthorized'), 401

            email, password = credentials.split(':')
            password = sha1(password.encode()).hexdigest()

            vendors = mongoClient.db.collection('vendors')
            users = mongoClient.db.collection('users')

            vendor = vendors.find_one({'email': email, 'password': password})
            user = users.find_one({'email': email, 'password': password})

            if vendor:
                token = str(uuid.uuid4())
                redis_storage.set(f'auth_{token}', str(vendor['_id']), 86400)
                return jsonify(token=token), 200
            elif user:
                token = str(uuid.uuid4())
                redis_storage.set(f'auth_{token}', str(user['_id']), 86400)
                return jsonify(token=token), 200
            else:
                return jsonify(error='Unauthorized'), 401
        except Exception as e:
            print(e)
            return jsonify(error='Internal server error'), 500

    @staticmethod
    def get_disconnect():
        """
        Deletes a user session / logs out a user
        """
        token = request.headers.get('X-Token')
        user_id = redis_storage.get(f'auth_{token}')

        if not user_id:
            return jsonify(error='Unauthorized'), 401

        redis_storage.delete(f'auth_{token}')
        return jsonify(), 204
