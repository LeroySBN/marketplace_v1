import redis
from redis.exceptions import RedisError
from typing import Optional
from os import getenv
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = getenv('REDIS_HOST', 'localhost')
REDIS_PORT = getenv('REDIS_PORT', 6379)
REDIS_PASSWORD = getenv('REDIS_PASSWORD', None)
REDIS_DB = getenv('REDIS_DB', 0)


class RedisClient:
    def __init__(self, host: str, port: int, password: Optional[str], db: int):
        self.client = redis.StrictRedis(
            host=host,
            port=port,
            password=password,
            db=db,
            decode_responses=True
        )

    def is_alive(self):
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


storage = RedisClient(REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB)
