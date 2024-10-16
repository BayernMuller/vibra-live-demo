import requests
import uuid
import json
import random
from datetime import datetime
from user_agent import USER_AGENT
from timezone import TIMZONES


class Shazam:
    URL = "https://amp.shazam.com/discovery/v5/fr/FR/android/-/tag/"

    def recognize(self, signature: str, samplems: int):
        uuid1 = str(uuid.uuid4())
        uuid2 = str(uuid.uuid4())
        now_ms = int(datetime.now().timestamp() * 1000)
        
        url = self.URL + uuid1 + "/" + uuid2
        url += "?sync=true&webv3=true&sampling=true&connected=&shazamapiversion=v3&sharehub=true&video=v3"
        
        body = {
            "geolocation": {
                "altitude": 300,
                "latitude": 45,
                "longitude": 2
            },
            "signature": {
                "uri": signature,
                "samplems": samplems,
                "timestamp": int(datetime.now().timestamp() * 1000)
            },
            "timestamp": int(datetime.now().timestamp() * 1000),
            "timezone": random.choice(TIMZONES)
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": random.choice(USER_AGENT),
            "Content-Language": "en_US"
        }

        response = requests.post(url, headers=headers, data=json.dumps(body))
        return response.json()