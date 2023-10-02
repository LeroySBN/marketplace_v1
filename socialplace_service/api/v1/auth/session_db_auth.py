#!/usr/bin/env python3
""" Sessions in database
"""
from api.v1.auth.session_exp_auth import SessionExpAuth
from datetime import datetime, timedelta
from models.user_session import UserSession


class SessionDBAuth(SessionExpAuth):
    """SessionDBAuth class
    """

    def create_session(self, user_id=None):
        """creates a Session ID for a user_id
        """
        if user_id is None:
            return None
        session_id = super().create_session(user_id)
        if session_id is None:
            return None
        user_session = UserSession(user_id=user_id, session_id=session_id)
        user_session.save()
        return session_id

    def user_id_for_session_id(self, session_id=None):
        """returns a User ID based on a Session ID
        """
        if session_id is None:
            return None
        user_session = UserSession.search({'session_id': session_id})
        if user_session is None:
            return None
        if self.session_duration <= 0:
            return user_session.user_id
        if 'created_at' not in user_session:
            return None
        created_at = user_session['created_at']
        if created_at + timedelta(seconds=self.session_duration) \
                < datetime.now():
            return None
        return user_session.user_id

    def destroy_session(self, request=None):
        """deletes the user session / logout
        """
        if request is None:
            return False
        session_id = self.session_cookie(request)
        if session_id is None:
            return False
        user_session = UserSession.search({'session_id': session_id})
        if user_session is None:
            return False
        user_session.remove()
        return True
