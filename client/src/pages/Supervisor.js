import React, { useEffect, useState } from "react";
import Axios from "axios";
import Popup from "./Popup";
import "./Supervisor.css";
import { useNavigate } from "react-router-dom";
import {
  addDays,
  format,
  startOfWeek,
  endOfWeek,
  isSameWeek,
  isMonday,
  isTuesday,
  isWednesday,
  isThursday,
  isFriday,
  isSaturday,
  isSunday,
  isSameDay,
} from "date-fns";

function Supervisor() {
  let navigate = useNavigate();
  const [employeeList, setEmployeeList] = useState([]);
  const [scheduleList, setScheduleList] = useState([]);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const [weekEnd, setWeekEnd] = useState(
    endOfWeek(new Date(), { weekEndsOn: 6 })
  );
  const [updatebuttonPopup, setUpdateButtonPopup] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(0);

  const [workDate, setWorkDate] = useState(new Date());
  const [workStart, setWorkStart] = useState("");
  const [workEnd, setWorkEnd] = useState("");
  const [loginInfo, setLoginInfo] = useState(0);
  const [department, setDepartment] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if (response.data.loggedIn == true) {
        setLoginInfo(response.data.user[0].login_id);
        getDepartment(response.data.user[0].login_id);
      }
    });
    getEmployees();
    getSchedules();
  }, []);

  const logOut = () => {
    Axios.post("http://localhost:3001/logout").then((response) => {
      console.log(response);
      navigate("login");
    });
  };

  const getEmployees = () => {
    Axios.get("http://localhost:3001/employees").then((response) => {
      setEmployeeList(response.data);
    });
  };

  const getSchedules = () => {
    Axios.get("http://localhost:3001/schedule").then((response) => {
      setScheduleList(response.data);
    });
  };

  const getDepartment = (id) => {
    Axios.get(`http://localhost:3001/department/${id}`)
      .then((response) => {
        setDepartment(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const updateEmployee = (id) => {
    Axios.put("http://localhost:3001/update", {
      workDate: workDate,
      workStart: workStart,
      workEnd: workEnd,
      id: id,
    })
      .then((response) => {
        alert("Updated successfully!");
        getSchedules();
        if (isSameWeek(new Date(), new Date(workDate))) {
          addNotification(id);
        }
      })
      .catch((error) => {
        alert("Error occurred while updating the employee's schedule.");
        console.log(error);
      });
  };

  const deleteDate = (id, workDate) => {
    Axios.delete(
      `http://localhost:3001/deletedate/${id}?workDate=${workDate}`
    ).then((response) => {
      getSchedules();
      if (isSameWeek(new Date(), new Date(workDate))) {
        addNotification(id);
      }
    });
  };

  const addNotification = (id) => {
    Axios.post("http://localhost:3001/notification", {
      id: id,
    }).then((response) => {
      console.log(response);
    });
  };

  useEffect(() => {
    getEmployees();
    getSchedules();
  }, []);

  const handleForwardArrowClick = () => {
    const newStart = addDays(weekStart, 7); 
    const newEnd = addDays(weekEnd, 7);
    setWeekStart(newStart);
    setWeekEnd(newEnd); 
  };

  const handleBackwardArrowClick = () => {
    const newStart = addDays(weekStart, -7); 
    const newEnd = addDays(weekEnd, -7);
    setWeekStart(newStart);
    setWeekEnd(newEnd); 
  };

  function hasScheduleConflict(employee1, work_date, work_start, work_end) {
    const filteredEmployees = employeeList.filter(
      (employee2) =>
        employee1.position === employee2.position &&
        employee1.department === employee2.department &&
        employee1.id_employees !== employee2.id_employees
    );

    for (const employee2 of filteredEmployees) {
      const employee2Schedules = scheduleList.filter(
        (schedule) =>
          schedule.employee_ID === employee2.id_employees &&
          isSameDay(new Date(schedule.work_date), new Date(work_date))
      );

      for (const schedule of employee2Schedules) {
        if (
          ((work_start < schedule.end_work_hour &&
            work_end > schedule.start_work_hour) ||
            (work_start < schedule.start_work_hour &&
              work_end > schedule.end_work_hour)) &&
          work_start != schedule.end_work_hour
        ) {
          return {
            conflictingShift: schedule.work_date,
            conflictingEmployee: employee2,
          };
        }
      }
    }

    return false; 
  }

  function formatTime(time) {
    
    const [hours, minutes] = time.split(":");

    const formattedTime = new Date();
    formattedTime.setHours(hours);
    formattedTime.setMinutes(minutes);

    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return formattedTime.toLocaleTimeString("en-US", options);
  }

  return (
    <div className="Attributes">
    
      <div className="header">
        <img className="pagelogo" src={require("./images/schedulecLOGOFINALL.png")} />
        <h1>Department Schedules</h1>
        <div className="logout">
          <button onClick={logOut}>LOG OUT</button>
        </div>
      </div>
      <div className="container">

          <div className="week-picker">
            <button className="arrow-button" onClick={handleBackwardArrowClick}>
              <img
                src={require("./images/icons8-left-64.png")}
                alt="Button Image"
                className="backward-arrow"
              />
            </button>
            <span className="week-span">
              Week {format(weekStart, "MM/dd/yyyy")} -{" "}
              {format(weekEnd, "MM/dd/yyyy")}
            </span>
            <button className="arrow-button" onClick={handleForwardArrowClick}>
            <img
                src={require("./images/icons8-right-64.png")}
                alt="Button Image"
                className="forward-arrow"
              />
            </button>
          </div>
        </div>

      <div className="row">
        <div className="col-md-12">
        <div class="table-container">
          <div className="schedule-table">
            <table className="table bg-white">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Sunday</th>
                  <th>Monday</th>
                  <th>Tuesday</th>
                  <th>Wednesday</th>
                  <th>Thursday</th>
                  <th>Friday</th>
                  <th>Saturday</th>
                  <th className="last"></th>
                </tr>
              </thead>
              <tbody>
                {employeeList.map((employee, rowIndex) =>
                  employee.department === department[0]?.department ? (
                    <tr key={rowIndex}>
                      <td className="day">{employee.name}</td>
                      {[
                        { isDay: isSunday, label: "Sun" },
                        { isDay: isMonday, label: "Mon" },
                        { isDay: isTuesday, label: "Tue" },
                        { isDay: isWednesday, label: "Wed" },
                        { isDay: isThursday, label: "Thu" },
                        { isDay: isFriday, label: "Fri" },
                        { isDay: isSaturday, label: "Sat" },
                      ].map(({ isDay, label }, columnIndex) => (
                        <td className="active" key={columnIndex}>
                            {scheduleList.map((schedule, cellIndex) => {
                              if (
                                employee.id_employees ===
                                  schedule.employee_ID &&
                                isSameWeek(
                                  new Date(schedule.work_date),
                                  weekEnd
                                ) &&
                                isDay(new Date(schedule.work_date))
                              ) {
                                const conflict = hasScheduleConflict(
                                  employee,
                                  schedule.work_date,
                                  schedule.start_work_hour,
                                  schedule.end_work_hour
                                );
                                const isConflict = conflict;
                              return (
                                <div key={cellIndex}>
                                    <h4>
                                      {formatTime(schedule.start_work_hour)} -{" "}
                                      {formatTime(schedule.end_work_hour)}
                                    </h4>
                                    <div
                                      className={`hover ${
                                        isConflict ? "conflict" : ""
                                      }`}
                                    >
                                      <h4>
                                        {formatTime(schedule.start_work_hour)} -{" "}
                                        {formatTime(schedule.end_work_hour)}
                                      </h4>

                                      <p>
                                        {employee.department} -{" "}
                                        {employee.position}
                                      </p>
                                      {isConflict && (
                                        <span className="conflict-text">
                                          Conflict with{" "}
                                          {conflict.conflictingEmployee.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                              );
                            } else {
                              return null;
                            }
                          })}
                        </td>
                      ))}
                      <td>
                      <div className="Information">
                          <button
                            className="imageButton"
                            onClick={() => {
                              setSelectedEmployeeId(employee.id_employees);
                              setUpdateButtonPopup(true);
                            }}
                          >
                            <img
                              src={require("./images/icons8-create-64.png")}
                              alt="Button Image"
                              className="button-image"
                            />
                          </button>
                          

                          <Popup
                            trigger={updatebuttonPopup}
                            setTrigger={setUpdateButtonPopup}
                            employeeId={selectedEmployeeId}
                          >
                            <label class = "popup-headers">Availability</label>
                            <br/>
                            <label>Date:</label>
                            <input
                              type="date"
                              placeholder="2000..."
                              min={today}
                              onChange={(event) => {
                                setWorkDate(event.target.value);
                              }}
                            />
                            <label>Starting Time: </label>
                            <input
                                type="time"
                                placeholder="Work Start..."
                                onChange={(event) => {
                                  const inputTime = event.target.value;
                                  const [hours, minutes] = inputTime.split(":");
                            
                                  const time = new Date();
                                  time.setHours(hours);
                                  time.setMinutes(minutes);

                                  const formattedTime = `${time.getHours()}:${time.getMinutes()}`;

                                  setWorkStart(formattedTime); 
                                }}
                              />
                            <label>Ending Time: </label>
                            <input
                                type="time"
                                placeholder="Work End..."
                                onChange={(event) => {
                                  const inputTime = event.target.value;
                                  const [hours, minutes] = inputTime.split(":");

                                  
                                  const time = new Date();
                                  time.setHours(hours);
                                  time.setMinutes(minutes);

                                
                                  const formattedTime = `${time.getHours()}:${time.getMinutes()}`;


                                  setWorkEnd(formattedTime); 
                                }}
                              />
                            <button
                              onClick={() => {
                                updateEmployee(selectedEmployeeId);
                              }}
                              className="popup-buttons buttonsHover"
                            >
                              UPDATE SHIFT
                            </button>

                            <button
                              onClick={() => {
                                const confirmBox = window.confirm(
                                  "This will remove an employee's shift from the system. Are you sure you want to proceed?"
                                )
                                if (confirmBox == true){
                                deleteDate(selectedEmployeeId, workDate);
                                }
                              }}
                              className="delete-shift-button"
                            >
                              Delete Shift
                            </button>
                          </Popup>
                        </div>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Supervisor;
