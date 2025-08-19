import { useState, useEffect } from "react";
import "./App.css";
import Userinput from "./Userinput";
import Alltodos from "./Alltodos";

function App() {
  const [newtask, setnewtask] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log("Loading from localStorage...");

    const savedTasks = localStorage.getItem("todoTasks");
    const savedExpandedStates = localStorage.getItem("expandedDates");

    console.log("Saved tasks:", savedTasks);
    console.log("Saved expanded states:", savedExpandedStates);

    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        console.log("Parsed tasks:", parsedTasks);

        // Ensure all tasks have the required properties
        const validatedTasks = parsedTasks.map((task) => ({
          text: task.text || "",
          date: task.date || new Date().toLocaleDateString(),
          time: task.time || new Date().toLocaleTimeString(),
          id: task.id || Date.now() + Math.random(),
          completed: task.completed || false,
        }));

        console.log("Validated tasks:", validatedTasks);
        setnewtask(validatedTasks);
      } catch (error) {
        console.error("Error parsing saved tasks:", error);
        localStorage.removeItem("todoTasks");
      }
    }

    if (savedExpandedStates) {
      try {
        const parsedExpanded = JSON.parse(savedExpandedStates);
        console.log("Parsed expanded states:", parsedExpanded);
        setExpandedDates(parsedExpanded);
      } catch (error) {
        console.error("Error parsing expanded states:", error);
        localStorage.removeItem("expandedDates");
      }
    }

    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving tasks to localStorage:", newtask);
      try {
        localStorage.setItem("todoTasks", JSON.stringify(newtask));
        console.log("Tasks saved successfully");
      } catch (error) {
        console.error("Error saving tasks to localStorage:", error);
        // Handle storage quota exceeded
        if (error.name === "QuotaExceededError") {
          alert("Storage limit exceeded. Some data may not be saved.");
        }
      }
    }
  }, [newtask, isLoaded]);

  // Save expanded states to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving expanded states to localStorage:", expandedDates);
      try {
        localStorage.setItem("expandedDates", JSON.stringify(expandedDates));
        console.log("Expanded states saved successfully");
      } catch (error) {
        console.error("Error saving expanded states to localStorage:", error);
      }
    }
  }, [expandedDates, isLoaded]);

  const toggleDateExpansion = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  function updateTask(value) {
    if (!value.trim()) return;

    const today = new Date();
    const taskDate = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;

    const taskTime = today.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newTask = {
      text: value.trim(),
      date: taskDate,
      time: taskTime,
      id: Date.now() + Math.random(),
      completed: false,
    };

    console.log("Adding new task:", newTask);
    setnewtask((prevTasks) => [...prevTasks, newTask]);
  }

  function toggleCompletion(id) {
    console.log("Toggling completion for task:", id);
    setnewtask((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  const tasksByDate = newtask.reduce((groups, task, index) => {
    if (!groups[task.date]) {
      groups[task.date] = {
        tasks: [],
        incompleteCount: 0,
      };
    }
    groups[task.date].tasks.push({ ...task, originalIndex: index });
    if (!task.completed) {
      groups[task.date].incompleteCount++;
    }
    return groups;
  }, {});

  function ondelete(idToDelete) {
    console.log("Deleting task:", idToDelete);
    setnewtask((prev) => prev.filter((task) => task.id !== idToDelete));

    // Also remove individual task data from localStorage
    localStorage.removeItem(`dueDate_${idToDelete}`);
    localStorage.removeItem(`taskText_${idToDelete}`);
  }

  const clearAllTasks = () => {
    if (window.confirm("Are you sure you want to clear all tasks?")) {
      console.log("Clearing all tasks");
      setnewtask([]);
      setExpandedDates({});

      // Clear all localStorage data
      localStorage.removeItem("todoTasks");
      localStorage.removeItem("expandedDates");

      // Clear all individual task data
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("dueDate_") || key.startsWith("taskText_")) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // Debug function to check localStorage contents
  const debugStorage = () => {
    console.log("=== LOCALSTORAGE DEBUG ===");
    console.log("todoTasks:", localStorage.getItem("todoTasks"));
    console.log("expandedDates:", localStorage.getItem("expandedDates"));
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("dueDate_") || key.startsWith("taskText_")) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    });
    console.log("=== END DEBUG ===");
  };

  return (
    <>
      <div className="userinputwrapper">
        <Userinput usersnewinputtedtask={updateTask} />
      </div>

      {Object.entries(tasksByDate).map(([date, dateGroup]) => (
        <div key={date} className="alltodowrapper">
          <div key={date} className="date-group">
            <div className="topdiv">
              <h3>{date}</h3>
              <button onClick={() => toggleDateExpansion(date)}>
                {expandedDates[date] ? "Expand" : "Collapse"}
              </button>
            </div>
            {dateGroup.incompleteCount > 0 && (
              <div className="incomplete-tasks-notification">
                ⚠️ You have {dateGroup.incompleteCount} incomplete task(s)!
              </div>
            )}
            {dateGroup.incompleteCount === 0 && dateGroup.tasks.length > 0 && (
              <div className="incomplete-tasks-notification">
                ✅ All tasks completed.
              </div>
            )}
            {!expandedDates[date] &&
              dateGroup.tasks.map((task, i) => (
                <div key={task.id} className="alltodosdiv">
                  <Alltodos
                    key={task.id}
                    id={task.id}
                    newtasktoadd={task.text}
                    tasknumber={i}
                    isCompleted={task.completed}
                    toggleCompletion={() => toggleCompletion(task.id)}
                    deletethisitem={() => ondelete(task.id)}
                    currentTime={task.time}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </>
  );
}

export default App;
