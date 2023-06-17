from pydantic import BaseModel

class Authentification:
    access_token: str
    expires_in: int
    refresh_token: str