import { useState } from "react";

function Userinput({ usersnewinputtedtask }) {
  const [UserInput, setUserInput] = useState("");
  function handleADDbuttonclick() {
    usersnewinputtedtask(UserInput);
    setUserInput("");
  }
  return (
    <div className="userInput">
      <input
        className="inputbox"
        type="text"
        placeholder="Enter a task"
        value={UserInput}
        onChange={(e) => setUserInput(e.target.value)}
      />
      <button onClick={handleADDbuttonclick}>Add Task</button>
    </div>
  );
}

export default Userinput;
