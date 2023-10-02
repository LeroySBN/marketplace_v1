#!/usr/bin/python3
""" Community module """
from models.base_model import BaseModel, Base
from os import getenv
from typing import List


class Community(BaseModel, Base):
    """This class defines a user by various attributes"""
    name = ""
    members = []

    def __init__(self, *args, **kwargs):
        """initializes User"""
        super().__init__(*args, **kwargs)
