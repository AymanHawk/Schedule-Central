import React, { useEffect, useState } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

import "./Login.css";

function Login() {
  let navigate = useNavigate();

  const [usernameReg, setUsernameReg] = useState("");
  const [passwordReg, setPasswordReg] = useState("");
  const [buttonPopup, setButtonPopup] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState({
    password: "",
    showPassword: false,
  });
  const [department, setDepartment] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [role, setRole] = useState(null);

  Axios.defaults.withCredentials = true;

  const handleClickShowPassword = () => {
    setPassword({ ...password, showPassword: !password.showPassword });
  };


  const handlePasswordChange = (event) => {
    setPassword({ ...password, password: event.target.value });
  };

  const register = () => {
    Axios.post("http://localhost:3001/register", {
      username: usernameReg,
      password: passwordReg,
      name: name,
      position: position,
      department: department,
      role: role,
    }).then((response) => {
      console.log(response);
    });
  };

  const login = () => {
    Axios.post("http://localhost:3001/login", {
      username: username,
      password: password.password,
    })
      .then((response) => {
        if (response.data.message) {
          setLoginStatus(response.data.message);
        } else {
          setLoginStatus(response.data[0].username);
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
        setLoginStatus("Error: " + error.message);
      });
  };

  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn == true) {
        setLoginStatus(response.data.user[0].username);
        navigate("/");
      }
    });
  }, []);

  return (
    <div className="login-container">
      <div className="toptab">
        <img className="LOGO" src={require("./images/schedulecLOGOFINALL.png")} />
      </div>

      <div className="login">
        <h3 id="signIn">Sign In</h3>

        <div id="boxing">
          <input
            className="varr"
            type="text"
            placeholder="Username"
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </div>

        <div id="boxing" className="password-input">
  <input
    className="varr"
    type={password.showPassword ? "text" : "password"}
    placeholder="Password"
    value={password.password}
    onChange={handlePasswordChange}
  />
  <i
    className={`password-toggle ${
      password.showPassword ? "visible" : ""
    }`}
    onClick={handleClickShowPassword}
  >
    Show
  </i>
</div>
        <button className="submit" onClick={login}>
          Login
        </button>

        <h3 className="login-status">{loginStatus}</h3>


        <div className="Information">
          <main>
            <button className="submit" onClick={() => setButtonPopup(true)}>
              Register
            </button>
          </main>
          <Popup trigger={buttonPopup} setTrigger={setButtonPopup}>
          <form class="register-form">
  <label for="fullname">Full Name:</label>
  <input
    type="text" required
    id="fullname"
    onChange={(e) => {
      setName(e.target.value);
    }}
  />
  <label for="position">Position:</label>
  <input
    type="text"
    id="position"
    onChange={(e) => {
      setPosition(e.target.value);
    }}
  />

  <label for="department">Department:</label>
  <select required
    type = 'text'
    id="department"
    onChange={(e) => {
      setDepartment(e.target.value);
    }}
  >
  <option value="0"></option>
  <option value="Nursing">Nursing</option>
  <option value="Bookeeping">Bookeeping</option>
  <option value="Outpatient">Outpatient</option>
  <option value="Inpatient">Inpatient</option>
  <option value="Pharmacy">Pharmacy</option>
  <option value="Intensive Care">Intensive Care</option>
  <option value="Morgue">Morgue</option>
  </select>

  <label for="username">Username:</label>
  <input
    type="text" required
    id="username"
    onChange={(e) => {
      setUsernameReg(e.target.value);
    }}
  />

  <label for="password">Password:</label>
  <input
    type="text" required
    id="password"
    onChange={(e) => {
      setPasswordReg(e.target.value);
    }}
  />

  <button onClick={register} class="popup-buttons buttonsHover">
    Register
  </button>
</form>

          </Popup>
        </div>
      </div>
      <i className="glyphicon glyphicon-user w3-text-teal"></i>
    </div>
  );
}

export default Login;
