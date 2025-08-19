import { useState } from "react";
import "./App.css";
import Userinput from "./Userinput";
import Alltodos from "./Alltodos";

function App() {
  const [newtask, setnewtask] = useState([]);

  function datecheck(thedate) {}

  function updateTask(value) {
    const today = new Date();
    const taskDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    setnewtask((prevTasks) => [
      ...prevTasks,
      {
        text: value,
        date: taskDate,
        id: Date.now(), // 👈 Unique ID
      },
    ]);
  }

  // Group tasks by date
  const tasksByDate = newtask.reduce((groups, task, index) => {
    if (!groups[task.date]) {
      groups[task.date] = [];
    }
    groups[task.date].push({ ...task, originalIndex: index });
    return groups;
  }, {});

  function ondelete(idToDelete) {
    setnewtask((prev) => prev.filter((task) => task.id !== idToDelete));
  }

  return (
    <>
      <div className="userinputwrapper">
        <Userinput usersnewinputtedtask={updateTask} />
      </div>

      {Object.entries(tasksByDate).map(([date, dateTasks]) => (
        <div key={date} className="alltodowrapper">
          <div key={date} className="date-group">
            <h3>{date}</h3>
            {dateTasks.map((task, i) => (
              <Alltodos
                key={i}
                newtasktoadd={task.text}
                tasknumber={i}
                deletethisitem={() => ondelete(task.id)} // 👈 Pass ID
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default App;
