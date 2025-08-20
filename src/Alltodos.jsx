import { useState, useEffect } from "react";
import { useRef } from "react";

function Alltodos({
  newtasktoadd,
  tasknumber,
  isCompleted,
  toggleCompletion,
  deletethisitem,
  currentTime,
  id,
}) {
  const [taskText, setTaskText] = useState(newtasktoadd);
  const [duedate, setduedate] = useState("");
  const dateInputRef = useRef(null);
  const contentEditableRef = useRef(null);
  const lastCaretPosition = useRef(0);

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
    // Save cursor position before updating state
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(contentEditableRef.current);
      preSelectionRange.setEnd(range.endContainer, range.endOffset);
      lastCaretPosition.current = preSelectionRange.toString().length;
    }

    const newText = e.currentTarget.textContent;
    setTaskText(newText);
  };

  // Restore cursor position after render
  useEffect(() => {
    if (contentEditableRef.current && lastCaretPosition.current > 0) {
      const range = document.createRange();
      const selection = window.getSelection();

      // Find the correct text node and offset
      let charCount = 0;
      let nodeStack = [contentEditableRef.current];
      let node;
      let foundStart = false;

      while ((node = nodeStack.pop())) {
        if (node.nodeType === 3) {
          // Text node
          const nextCharCount = charCount + node.length;
          if (
            !foundStart &&
            lastCaretPosition.current >= charCount &&
            lastCaretPosition.current <= nextCharCount
          ) {
            range.setStart(node, lastCaretPosition.current - charCount);
            range.setEnd(node, lastCaretPosition.current - charCount);
            foundStart = true;
          }
          charCount = nextCharCount;
        } else {
          // Add children in reverse order to process first child first
          let i = node.childNodes.length;
          while (i--) {
            nodeStack.push(node.childNodes[i]);
          }
        }
      }

      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [taskText]);

  const handleDateChange = (e) => {
    setduedate(e.target.value);
  };

  return (
    <>
      <div className="alltodoswrapper">
        <div className="alltodoscontainer-one">
          <div className="tasknumber-and-checkbox-and-task">
            <p style={{ color: "grey", fontSize: "14px" }}>{tasknumber + 1}.</p>
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={toggleCompletion}
              />
              <span className="checkmark"></span>
            </label>
            <p
              ref={contentEditableRef}
              className={isCompleted ? "task-done" : ""}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleInput}
              style={{ color: "white", fontSize: "22px", textWrap: "wrap" }}
            >
              {taskText}
            </p>
          </div>
          <div className="currenttime-and-deletebutton">
            <p style={{ color: "grey" }}>{currentTime}</p>
            <button className="deletebtn" onClick={deletethisitem}>
              <i class="fa-solid fa-trash-can"></i>
            </button>
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
          {duedate && (
            <p style={{ color: "grey", fontSize: "14px" }}>
              Due by: {new Date(duedate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <hr />
    </>
  );
}

export default Alltodos;
