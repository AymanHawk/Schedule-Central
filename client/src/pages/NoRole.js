import React, { useEffect, useState } from "react";
import Axios from "axios";
import "./Employee.css";
import { useNavigate } from "react-router-dom";

import './NoRole.css'
 function NoRole() {

  let navigate = useNavigate();

  const logOut = () => {
    Axios.post("http://localhost:3001/logout").then((response) => {
      console.log(response);
      navigate("login");
    });
  };

  return (
    <div className="norole"> 
    <div className="logoutNorole">
          <button onClick={logOut}>LOG OUT</button>
    </div>
    <main>
      <h1>Please contact an Admin or Supervisor to access account</h1>
    </main>
    </div>
  );
}
export default NoRole
