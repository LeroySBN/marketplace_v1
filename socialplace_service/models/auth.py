#!/usr/bin/env python3
""" auth module """
import bcrypt
from db import DB
from user import User
import uuid
from typing import Union


def _hash_password(password: str) -> bytes:
    """ hash password """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


def _generate_uuid() -> str:
    """ generate uuid """
    return str(uuid.uuid4())


class Auth:
    """Auth class to interact with the authentication database.
    """

    def __init__(self):
        """ initialize
        """
        self._db = DB()

    def register_user(self, email: str, password: str) -> User:
        """ Registers a user instance
        """
        try:
            self._db.find_user_by(email=email)
        except Exception:
            self._db.add_user(email, _hash_password(password))
            return self._db.find_user_by(email=email)
        raise ValueError(f'User {email} already exists')

    def valid_login(self, email: str, password: str) -> bool:
        """ valid login
        """
        try:
            user = self._db.find_user_by(email=email)
            return bcrypt.checkpw(password.encode('utf-8'),
                                  user.hashed_password)
        except Exception:
            return False

    def create_session(self, email: str) -> str:
        """ create session
        """
        user = self._db.find_user_by(email=email)
        if user:
            session_id = _generate_uuid()
            self._db.update_user(user.id, session_id=session_id)
            return session_id
        else:
            return None

    def get_user_from_session_id(self, session_id: str) -> Union[User, None]:
        """ get user from session id
        """
        if session_id is None:
            return None
        #
        try:
            user = self._db.find_user_by(session_id=session_id)
        except Exception:
            return None
        return user

    def destroy_session(self, user_id: int) -> None:
        """ destroy session
        """
        self._db.update_user(user_id, session_id=None)

    def get_reset_password_token(self, email: str) -> str:
        """ reset password
        """
        try:
            user = self._db.find_user_by(email=email)
        except Exception:
            raise ValueError
        reset_token = _generate_uuid()
        self._db.update_user(user.id, reset_token=reset_token)
        return reset_token

    def update_password(self, reset_token: str, password: str) -> None:
        """ update password
        """
        try:
            user = self._db.find_user_by(reset_token=reset_token)
        except Exception:
            raise ValueError
        self._db.update_user(user.id,
                             hashed_password=_hash_password(password),
                             reset_token=None)
