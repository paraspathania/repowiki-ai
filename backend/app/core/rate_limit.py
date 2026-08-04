from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# Usage notes for endpoints:
# @limiter.limit("10/minute") for analysis endpoints
# @limiter.limit("30/minute") for chat endpoints
# @limiter.limit("5/minute") for export endpoints
