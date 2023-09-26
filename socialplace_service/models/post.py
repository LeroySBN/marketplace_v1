#!/usr/bin/python3
""" Post module """
from models.base_model import BaseModel, Base
from os import getenv


class Post(BaseModel, Base):
    """This class defines a user by various attributes"""
    userId = ""
    communityId = ""
    content = ""
    parentId = ""

    def __init__(self, *args, **kwargs):
        """initializes User"""
        super().__init__(*args, **kwargs)