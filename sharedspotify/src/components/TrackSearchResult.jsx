import React from "react";
import { Stack, Typography, Box } from "@mui/material";
import axios from "axios";
import { useParams } from "react-router-dom";

const TrackSearchResult = ({ track }) => {
  const uuid = useParams()?.uuid;
  const API_URI = process.env.REACT_APP_API_URI;

  function add_to_queue() {
    axios.post(
      API_URI + "/toqueue?song_uri=" + track?.uri + "&uuid_client=" + uuid
    );
  }

  if (!track) {
    return null;
  } else {
    return (
      <div>
        <Box
          sx={{
            boxShadow: "2px 0 5px black",
            borderRadius: "1vh",
            width: "80vw",
            background: "rgba(255, 255, 255, .2)",
            color: "white",
            textDecorationLine: "none",
            padding: 2,
          }}
          onClick={() => add_to_queue()}
        >
          <Stack
            direction="row"
            sx={{ height: "10vh", cursor: "pointer" }}
            spacing={2}
          >
            <img
              src={track.image}
              alt="album"
              style={{ marginLeft: "0.5vw", borderRadius: "20%" }}
            />
            <Stack spacing={2}>
              <Typography sx={{ textDecoration: "none" }}>
                {track.name}
              </Typography>
              <Typography>{track?.artist}</Typography>
            </Stack>
          </Stack>
        </Box>
        <br />
      </div>
    );
  }
};

export default TrackSearchResult;
