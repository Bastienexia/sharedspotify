from fastapi import APIRouter, FastAPI
import base64
import urllib
import requests
import redis
import uuid
from models.auth import Authentification
import datetime
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

redis_db = redis.StrictRedis(host="localhost", port=6379, db=0, decode_responses=True)

load_dotenv()

app = FastAPI()

router = APIRouter()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

encoded_credentials = base64.b64encode(
    client_id.encode() + b":" + client_secret.encode()
).decode("utf-8")

token_headers = {
    "Authorization": "Basic " + encoded_credentials,
    "Content-Type": "application/x-www-form-urlencoded",
}

tokens = Authentification

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/login")
async def login(code: str):
    token_list = ["access_token", "expires_in", "refresh_token"]
    id_tokens = str(uuid.uuid4())

    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost:3000",
    }

    token_request = requests.post(
        "https://accounts.spotify.com/api/token", data=token_data, headers=token_headers
    )

    token = {
        "access_token": token_request.json().get("access_token"),
        "expires_in": str(datetime.datetime.utcnow() + datetime.timedelta(minutes=58)),
        "refresh_token": token_request.json().get("refresh_token"),
    }

    for i in token_list:
        redis_db.set(id_tokens + "." + i, token.get(i))

    return id_tokens


async def refresh(uuid_client: str):
    token_data = {
        "grant_type": "refresh_token",
        "refresh_token": redis_db.get(uuid_client + ".refresh_token"),
    }

    refreshed_token = requests.post(
        "https://accounts.spotify.com/api/token", data=token_data, headers=token_headers
    )
    redis_db.set(uuid_client + ".access_token", refreshed_token.json().get("access_token"))
    redis_db.set(
        uuid_client + ".expires_in",
        str(datetime.datetime.utcnow() + datetime.timedelta(minutes=58)),
    )


async def get_access_token(uuid_client: str):

    expires_in = redis_db.get(uuid_client + ".expires_in")

    if expires_in:
        expires = datetime.datetime.strptime(
            expires_in, "%Y-%m-%d %H:%M:%S.%f"
        )

        if datetime.datetime.utcnow() > expires:
            await refresh(uuid_client)
        temp_access_token = redis_db.get(uuid_client + ".access_token")
    access_token = {"Authorization": "Bearer " + temp_access_token}
    return access_token


@app.get("/search")
async def search_song(q: str, uuid_client: str):
    base_url = "https://api.spotify.com/v1/search?q="
    final_url = base_url + urllib.parse.quote(q) + "&type=track"
    access_token = await get_access_token(uuid_client)
    response = requests.get(final_url, headers=access_token)

    tracks_list = response.json().get("tracks").get("items")
    final_track_list = []
    j = 0
    for i in tracks_list:
        j += 1
        if j < 11:
            final_track_list.append(
                {
                    "name": i.get("name"),
                    "artist": i.get("album").get("artists")[0].get("name"),
                    "image": i.get("album").get("images")[0].get("url"),
                    "uri": i.get("uri"),
                }
            )
    return final_track_list


@app.post("/toqueue")
async def add_to_queue(song_uri: str, uuid_client: str):
    base_url = "https://api.spotify.com/v1/me/player/queue?uri="
    final_url = base_url + urllib.parse.quote(song_uri)

    headers = await get_access_token(uuid_client)

    response = requests.post(final_url, headers=headers)
    return response


@app.get("/artist_search")
async def get_artist_search(artist: str, uuid_client: str):
    base_url = "https://api.spotify.com/v1/search?q="
    final_url = base_url + urllib.parse.quote(artist) + "&type=artist"

    header = await get_access_token(uuid_client)

    response = requests.get(final_url, headers=header)

    final_artists_list = []
    j = 0
    for i in response.json().get("artists").get("items"):
        j += 1
        if j < 6:
            if i.get("images"):
                img = i.get("images")[0].get("url")
            else:
                img = ""
            final_artists_list.append(
                {"name": i.get("name"), "image": img, "id": i.get("id")}
            )
    return final_artists_list


@app.post("/getArtistDetails")
async def get_artist_details(artist_id: str, uuid_client: str):
    url_info = "https://api.spotify.com/v1/artists/" + artist_id
    url_top_tracks = (
        "https://api.spotify.com/v1/artists/" + artist_id + "/top-tracks?market=FR"
    )
    url_album = "https://api.spotify.com/v1/artists/" + artist_id + "/albums"

    authorization = get_access_token(uuid_client)
    response_info = requests.get(url_info, headers=authorization)
    response_top_tracks = requests.get(url_top_tracks, headers=authorization)
    response_albums = requests.get(url_album, headers=authorization)

    # Set artist's infos
    info = {
        "name": response_info.json().get("name"),
        "image": response_info.json().get("images")[0],
    }

    top_tracks_list = []
    # Set artist top tracks
    for i in response_top_tracks.json().get("tracks"):
        top_tracks_list.append(
            {
                "name": i.get("name"),
                "image": i.get("album").get("images")[0].get("url"),
                "uri": i.get("uri"),
            }
        )

    album_list = []
    # Set artist album list
    for j in response_albums.json().get("items"):
        album_list.append(
            {
                "name": j.get("name"),
                "image": j.get("images")[0].get("url"),
                "id": j.get("id"),
            }
        )

    return {"info": info, "top_tracks": top_tracks_list, "albums": album_list}


@app.get("/getAlbumsTracks")
async def get_album_tracks(album_id: str, uuid_client: str):
    base_url = "https://api.spotify.com/v1/albums/" + album_id + "/tracks?limit=50"

    response = requests.get(base_url, headers=get_access_token(uuid_client))

    album_tracks = []
    for i in response.json().get("items"):
        album_tracks.append({"name": i.get("name"), "uri": i.get("uri")})

    return album_tracks
