#!/usr/bin/python3
""" Index """
from models.user import User
from models.community import Community
from models.post import Post
from models import storage
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
