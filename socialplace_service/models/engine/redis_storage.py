import redis
from redis.exceptions import RedisError
from typing import Optional
from os import getenv


class RedisClient:
    def __init__(self, host: str, port: int, password: Optional[str], db: int):
        self.client = redis.StrictRedis(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=True
        )

    def status(self):
        try:
            return self.client.ping()
        except RedisError:
            return False

    def get(self, key: str):
        return self.client.get(key)

    def set(self, key: str, value: str, duration: int):
        self.client.setex(key, duration, value)

    def delete(self, key: str):
        self.client.delete(key)

