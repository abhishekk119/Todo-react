import { useState, useEffect } from "react";
import { useRef } from "react";

function Alltodos({
  newtasktoadd,
  tasknumber,
  isCompleted,
  toggleCompletion,
  deletethisitem,
  currentTime,
  id, // This prop is now received
}) {
  const [taskText, setTaskText] = useState(newtasktoadd);
  const [duedate, setduedate] = useState("");
  const dateInputRef = useRef(null);

  const handleIconClick = () => {
    dateInputRef.current?.showPicker();
  };

  // Load data from localStorage
  useEffect(() => {
    // Load due date
    const savedDueDate = localStorage.getItem(`dueDate_${id}`);
    if (savedDueDate) {
      setduedate(savedDueDate);
    }

    // Load saved task text (if user edited it)
    const savedTaskText = localStorage.getItem(`taskText_${id}`);
    if (savedTaskText && savedTaskText !== newtasktoadd) {
      setTaskText(savedTaskText);
    }
  }, [id, newtasktoadd]);

  // Save due date to localStorage
  useEffect(() => {
    if (duedate) {
      localStorage.setItem(`dueDate_${id}`, duedate);
    } else {
      localStorage.removeItem(`dueDate_${id}`);
    }
  }, [duedate, id]);

  // Save task text to localStorage
  useEffect(() => {
    localStorage.setItem(`taskText_${id}`, taskText);
  }, [taskText, id]);

  const handleInput = (e) => {
    const newText = e.currentTarget.textContent;
    setTaskText(newText);
  };

  const handleDateChange = (e) => {
    setduedate(e.target.value);
  };

  return (
    <>
      <div className="alltodoswrapper">
        <div className="alltodoscontainer-one">
          <div className="tasknumber-and-checkbox-and-task">
            <p>{tasknumber + 1}.</p>
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={toggleCompletion}
            />
            <p
              className={isCompleted ? "task-done" : ""}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleInput}
            >
              {taskText}
            </p>
          </div>
          <div className="currenttime-and-deletebutton">
            <p>{currentTime}</p>
            <button onClick={deletethisitem}>Delete</button>
          </div>
        </div>
        <div className="alltodoscontainer-two">
          <input
            ref={dateInputRef}
            className="hidden-date-input"
            type="date"
            value={duedate}
            onChange={(e) => setduedate(e.target.value)}
          />
          <i
            className="fa-solid fa-calendar-days calendar-icon"
            onClick={handleIconClick}
          />
          {duedate && <p>Due by: {new Date(duedate).toLocaleDateString()}</p>}
        </div>
      </div>

      <hr />
    </>
  );
}

export default Alltodos;
