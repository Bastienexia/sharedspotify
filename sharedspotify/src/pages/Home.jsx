import React from "react";
import { useState } from "react";
import { Stack, Button, TextField } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import sharedSpotify from "../resources/shared-spotify.png";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
const API_URI = process.env.REACT_APP_API_URI;

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20playlist-read-collaborative%20playlist-read-private%20playlist-modify-public%20playlist-modify-private%20user-top-read%20user-follow-read`;

const code = new URLSearchParams(window.location.search).get("code");

const Home = () => {
  const [joinCode, setJoinCode] = useState("");

  const navigate = useNavigate();

  if (code) {
    axios.post(API_URI + "/login?code=" + code).then((response) => {
      navigate("/room/" + response.data);
    });
  }

  return (
    <>
      <Stack
        direction="column"
        spacing={2}
        alignItems="center"
        sx={{
          width: "100%",
          height: "100%",
        }}
      >
        <br />
        <img src={sharedSpotify} style={{ width: "50vw" }} />
        <br />

        <Button variant="contained" href={AUTH_URL}>
          Create a room
        </Button>
        <TextField
          label="Room ID"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          sx={{ background: "white" }}
        />
        <Button
          onClick={() => navigate("/room/" + joinCode)}
          variant="contained"
        >
          Join room
        </Button>
      </Stack>
    </>
  );
};

export default Home;
