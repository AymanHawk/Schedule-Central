import React from "react";
import "./Popup.css";
function Popup(employee_ID) {
  return employee_ID.trigger ? (
    <div className="popup">
      <div className="popup-inner">
        <img
          src={require("./images/icons8-close-window-50.png")}
          alt="Button Image"
          className="close-btn"
          onClick={() => employee_ID.setTrigger(false)}
        />
        {employee_ID.children}
      </div>
    </div>
  ) : (
    ""
  );
}

export default Popup;
