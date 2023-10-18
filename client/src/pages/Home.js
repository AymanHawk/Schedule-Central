import React, { useEffect, useState } from "react";
import Axios from "axios";

import Employee from "../pages/Employee";
import Supervisor from "../pages/Supervisor";
import Admin from "../pages/Admin";
import NoRole from "../pages/NoRole";

export default function Home() {
  const [role, setRole] = useState("");

  Axios.defaults.withCredentials = true;
  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn == true) {
        setRole(response.data.user[0].role);
      }
    });
  }, []);

  return (
    <div>
      {role == "employee" && <Employee />}
      {role == "supervisor" && <Supervisor />}
      {role == "admin" && <Admin />}
      {role == null && <NoRole />}
    </div>
  );
}