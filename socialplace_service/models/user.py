#!/usr/bin/python3
""" User module """
from models.base_model import BaseModel, Base
from os import getenv


class User(BaseModel, Base):
    """This class defines a user by various attributes"""
    email = ""
    password = ""
    username = ""
    firstName = ""
    lastName = ""
    communities = list

    def __init__(self, *args, **kwargs):
        """initializes User"""
        super().__init__(*args, **kwargs)