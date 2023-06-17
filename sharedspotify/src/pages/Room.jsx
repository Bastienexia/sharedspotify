import React from "react";
import { useState, useEffect } from "react";
import { Stack, Typography, TextField, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import TrackSearchResult from "../components/TrackSearchResult";
import ArtistsVignette from "../components/ArtistsVignette";
import sharedSpotify from "../resources/shared-spotify.png";

const Room = () => {
  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const uuid = useParams()?.uuid;
  const API_URI = process.env.REACT_APP_API_URI;

  function searchFunc() {
    if (!search) return;
    axios
      .get(API_URI + "/search?q=" + search + "&uuid_client=" + uuid)
      .then((response) => {
        setTracks(response.data);
      });

    axios
      .get(API_URI + "/artist_search?artist=" + search + "&uuid_client=" + uuid)
      .then((response) => {
        setArtists(response.data);
      });
  }

  return (
    <>
      <Stack
        alignItems="center"
        direction="column"
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <br />
        <img src={sharedSpotify} style={{ width: "50vw" }} />
        <br />

        <TextField
          label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            background: "white",
          }}
        />
        <br />
        <Button variant="contained" onClick={() => searchFunc()}>
          Search
        </Button>
        <br />
        {tracks[0] ? (
          <>
            <Stack alignItems="center">
              <Typography variant="h5">Tracks</Typography>
              <br />
              {tracks.map((track) => (
                <TrackSearchResult track={track} />
              ))}
            </Stack>
            <Stack alignItems="center" spacing={2}>
              <Typography variant="h5">Artists</Typography>
              <br />
              {artists.map((artist) => (
                <ArtistsVignette artist={artist} />
              ))}
            </Stack>
          </>
        ) : (
          <Stack direction="column" alignItems="center" sx={{ width: "80%" }}>
            <Typography>Share the room code: {uuid}</Typography>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default Room;
