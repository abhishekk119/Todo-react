import { useState } from "react";

function Alltodos({ newtasktoadd, tasknumber, deletethisitem }) {
  const [isChecked, setIsChecked] = useState(false);
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <div className="alltodos">
        <div className="tasknumber-and-checkbox-and-task">
          <p>{tasknumber + 1}.</p>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
          <p className={isChecked ? "task-done" : ""}>{newtasktoadd}</p>
        </div>
        <div className="currenttime-and-deletebutton">
          {currentTime}
          <button onClick={deletethisitem}>Delete</button>
        </div>
      </div>
      <hr />
    </>
  );
}

export default Alltodos;
