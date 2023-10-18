const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    key: "userId",
    secret: "testing",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: null,
    },
  })
);

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "password",
  database: "schedulecentral",
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const name = req.body.name;
  const position = req.body.position;
  const department = req.body.department;
  const role = req.body.role;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO login_info (username, password, role) VALUES (?,?,?)",
      [username, hash, role],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          // Get the login ID for the inserted user
          const login_id = result.insertId;

          // Insert the employee information with the retrieved login ID
          db.query(
            "INSERT INTO all_employees (name, login_ID, position, department) VALUES (?,?,?,?)",
            [name, login_id, position, department],
            (err, result) => {
              if (err) {
                console.log(err);
              } else {
                res.send("Values Inserted");
              }
            }
          );
        }
      }
    );
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM login_info WHERE username = ?",
    [username],
    (err, result) => {
      if (err) {
        res.send({ err: err });
      } else if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send(result);
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "Wrong username/password combination!" });
      }
    }
  );
});

app.get("/employees", (req, res) => {
  db.query(
    "SELECT all_employees.*, login_info.role FROM all_employees JOIN login_info ON all_employees.login_ID = login_info.login_id",
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});


app.get("/schedule", (req, res) => {
  db.query("SELECT * FROM schedules", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/notificationrecieve", (req, res) => {
  db.query("SELECT * FROM notification", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.put("/update", (req, res) => {
  const id = req.body.id;
  const workDate = req.body.workDate;
  const workStart = req.body.workStart;
  const workEnd = req.body.workEnd;

  db.query(
    "SELECT * FROM schedules WHERE employee_ID = ? AND work_date = ?",
    [id, workDate],
    (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error while updating schedule");
      } else if (rows.length === 0) {
        // No row found, insert a new one
        db.query(
          "INSERT INTO schedules (employee_ID, work_date, start_work_hour, end_work_hour) VALUES (?,?,?,?)",
          [id, workDate, workStart, workEnd],
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error while inserting schedule");
            } else {
              res.send("Schedule Updated Successfully");
            }
          }
        );
      } else {
        // Row found, update it
        db.query(
          "UPDATE schedules SET start_work_hour = ?, end_work_hour = ? WHERE employee_ID = ? AND work_date = ?",
          [workStart, workEnd, id, workDate],
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error while updating schedule");
            } else {
              res.send("Schedule updated");
            }
          }
        );
      }
    }
  );
});

app.put("/role", (req, res) => {
  const id = req.body.id;
  const role = req.body.role;

  db.query(
    "SELECT login_ID FROM all_employees WHERE id_employees = ?",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving login ID");
      } else if (result.length === 0) {
        res.status(404).send("Employee not found");
      } else {
        // Get the login ID for the employee
        const login_id = result[0].login_ID;

        // Update the role of the login
        db.query(
          "UPDATE login_info SET role = ? WHERE login_id = ?",
          [role, login_id],
          (err, result) => {
            if (err) {
              console.log(err);
              res.status(500).send("Error updating role");
            } else {
              res.send("Role updated successfully");
            }
          }
        );
      }
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "SELECT login_ID FROM all_employees WHERE id_employees = ?",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error finding login ID for employee");
        return;
      }

      if (result.length === 0) {
        res.status(404).send("Employee not found in schedules");
        return;
      }

      // Get the login ID for the employee from the schedules table
      const login_id = result[0].login_ID;

      // Delete employee from schedules table
      db.query(
        "DELETE FROM schedules WHERE employee_ID = ?",
        [id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send("Error deleting employee from schedules");
            return;
          }
          // Delete employee from notification table
          db.query(
            "DELETE FROM notification WHERE employee_ID = ?",
            [id],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send("Error deleting employee from notification");
                return;
              }
              // Delete employee from all_employees table
              db.query(
                "DELETE FROM all_employees WHERE id_employees = ?",
                [id],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    res.status(500).send("Error deleting employee from all_employees");
                    return;
                  }

                  // Delete employee's login info
                  db.query(
                    "DELETE FROM login_info WHERE login_id = ?",
                    [login_id],
                    (err, result) => {
                      if (err) {
                        console.log(err);
                        res.status(500).send("Error deleting employee's login info");
                        return;
                      }

                      res.send("Employee deleted successfully");
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});


app.get("/department/:id", (req, res) => {
  const login_id = req.params.id;

  db.query(
    "SELECT department FROM all_employees WHERE login_ID = ?",
    [login_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving department");
      } else {
        res.send(result);
      }
    }
  );
});


app.get("/employee/:id", (req, res) => {
  const login_id = req.params.id;

  db.query(
    "SELECT id_employees FROM all_employees WHERE login_ID = ?",
    [login_id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error retrieving employee");
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deletedate/:id", (req, res) => {
  const id = req.params.id;
  const workDate = req.query.workDate;

  // delete data from the database
  db.query(
    "DELETE FROM schedules WHERE employee_ID = ? AND work_date = ?",
    [id, workDate],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting date");
      } else {
        res.send(result);
      }
    }
  );
});

app.delete("/deletenoti/:id", (req, res) => {
  const id = req.params.id;

  // delete data from the database
  db.query(
    "DELETE FROM notification WHERE employee_ID = ?",
    id,
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting data");
      } else {
        res.send(result);
      }
    }
  );
});

app.post("/notification", (req, res) => {
  const id = req.body.id;
  const notification =
    "Your schedule has been updated for this week, please make sure to take a look!";
  const date = new Date().toLocaleDateString();

  // check if notification already exists for the same employee on the same date
  db.query(
    "SELECT * FROM notification WHERE employee_ID = ? AND date = ?",
    [id, date],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error checking for existing notification");
      } else {
        if (result.length > 0) {
          // notification already exists, do not add a new one
          console.log(
            "Notification already exists for this employee on this date"
          );
          res.send(
            "Notification already exists for this employee on this date"
          );
        } else {
          // notification does not exist, add a new one
          db.query(
            "INSERT INTO notification (employee_ID, message, date ) VALUES (?,?,?)",
            [id, notification, date],
            (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send("Error creating notification");
              } else {
                res.send(result);
              }
            }
          );
        }
      }
    }
  );
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.clearCookie("userId");
    res.send("Logged out successfully");
  });
});

app.listen(3001, (req, res) => {
  console.log("yey, your server is running on port 3001");
});
