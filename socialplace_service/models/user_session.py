#!/usr/bin/env python3
""" Sessions in database
"""
from models.base import Base


class UserSession(Base):
    """ UserSession class
    """
    def __init__(self, *args: list, **kwargs: dict):
        """ Constructor
        """
        super().__init__(*args, **kwargs)
        user_id: str = kwargs.get('user_id')
        self.user_id = user_id
        self.session_id = SessionExpAuth.create_session(user_id)
