import React from "react";
import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Home from "./Home";
import Room from "./Room";

const Main = () => {
  return (
    <>
      <Box
        sx={{
          minWidth: "100vw",
          minHeight: "100vh",
          color: "white",
          background: "#36393F",
        }}
      >
        <Routes>
          <Route path={"/"} element={<Home />} />
          <Route path={"/room/:uuid"} element={<Room />} />
        </Routes>
        <br />
      </Box>
    </>
  );
};

export default Main;
