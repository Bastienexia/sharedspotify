import React from "react";
import { Stack, Typography } from "@mui/material";

const ArtistsVignette = ({ artist }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        boxShadow: "2px 0 5px black",
        width: "80vw",
        borderRadius: "1vh",
        cursor: "pointer",
        background: "rgba( 255, 255, 255, .2)",
        padding: 2,
      }}
    >
      <img
        style={{ height: "10vh", borderRadius: "20%", marginRight: "0.5vw" }}
        src={artist.image}
        alt={artist.name}
      />
      <Typography sx={{ marginLeft: "2vw", fontSize: "18px" }}>
        {artist.name}
      </Typography>
    </Stack>
  );
};

export default ArtistsVignette;
