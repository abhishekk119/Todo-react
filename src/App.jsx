import { useState, useEffect, useRef } from "react";
import "./App.css";
import Userinput from "./Userinput";
import Alltodos from "./Alltodos";

function App() {
  const [newtask, setnewtask] = useState([]);
  const [expandedDates, setExpandedDates] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [showDropdownForDate, setShowDropdownForDate] = useState(null);
  const [categories, setCategories] = useState({});

  // Load data from localStorage on component mount
  useEffect(() => {
    console.log("Loading from localStorage...");

    const savedTasks = localStorage.getItem("todoTasks");
    const savedExpandedStates = localStorage.getItem("expandedDates");
    const savedCategories = localStorage.getItem("taskCategories");

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

    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        console.log("Parsed categories:", parsedCategories);
        setCategories(parsedCategories);
      } catch (error) {
        console.error("Error parsing categories:", error);
        localStorage.removeItem("taskCategories");
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

  // Save categories to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      console.log("Saving categories to localStorage:", categories);
      try {
        localStorage.setItem("taskCategories", JSON.stringify(categories));
        console.log("Categories saved successfully");
      } catch (error) {
        console.error("Error saving categories to localStorage:", error);
      }
    }
  }, [categories, isLoaded]);

  const toggleDateExpansion = (date) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const toggleDropdownForDate = (date) => {
    setShowDropdownForDate(showDropdownForDate === date ? null : date);
  };

  const handleCategorySelect = (date, category) => {
    setCategories((prev) => ({
      ...prev,
      [date]: category,
    }));
    setShowDropdownForDate(null); // Close dropdown after selection
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
      hour12: true,
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

  // Sort the date groups by date (newest first)
  const sortedDateEntries = Object.entries(tasksByDate).sort(
    ([dateA], [dateB]) => {
      // Convert "dd/mm/yyyy" to Date objects for comparison
      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split("/").map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed in Date
      };

      return parseDate(dateB) - parseDate(dateA); // Sort descending (newest first)
    }
  );

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
      setCategories({});

      // Clear all localStorage data
      localStorage.removeItem("todoTasks");
      localStorage.removeItem("expandedDates");
      localStorage.removeItem("taskCategories");

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
    console.log("taskCategories:", localStorage.getItem("taskCategories"));
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("dueDate_") || key.startsWith("taskText_")) {
        console.log(`${key}:`, localStorage.getItem(key));
      }
    });
    console.log("=== END DEBUG ===");
  };

  return (
    <>
      <div className="logo">
        <p>Tasks.</p>
      </div>
      <div className="userinputwrapper">
        <Userinput usersnewinputtedtask={updateTask} />
      </div>

      {sortedDateEntries.map(([date, dateGroup]) => (
        <div key={date} className="alltodowrapper">
          <div key={date} className="date-group">
            <div className="topdiv">
              <h3 className="dateh3">{date}</h3>
              <div
                onClick={() => toggleDropdownForDate(date)}
                className="categories"
              >
                <p style={{ fontSize: "15px", color: "grey" }}>
                  {categories[date] || "Category"}
                </p>
              </div>

              <button
                className="expandcollapsebtn"
                onClick={() => toggleDateExpansion(date)}
              >
                {expandedDates[date] ? (
                  <i className="fa-solid fa-chevron-down"></i>
                ) : (
                  <i className="fa-solid fa-chevron-up"></i>
                )}
              </button>
            </div>
            {showDropdownForDate === date && (
              <div className="dropdowncontainer">
                <div className="click-dropdown-content show" id="clickDropdown">
                  <p onClick={() => handleCategorySelect(date, "🛒 Groceries")}>
                    🛒 Groceries
                  </p>
                  <p onClick={() => handleCategorySelect(date, "✨ Personal")}>
                    ✨ Personal
                  </p>
                  <p onClick={() => handleCategorySelect(date, "💡 Ideas")}>
                    💡 Ideas
                  </p>
                  <p onClick={() => handleCategorySelect(date, "📐 Project")}>
                    📐 Project
                  </p>
                  <p onClick={() => handleCategorySelect(date, "‼️ Important")}>
                    ‼️ Important
                  </p>
                </div>
              </div>
            )}
            {dateGroup.incompleteCount > 0 && (
              <div className="incomplete-tasks-notification">
                ⚠️ You have {dateGroup.incompleteCount} incomplete task(s)!
              </div>
            )}
            {dateGroup.incompleteCount === 0 && dateGroup.tasks.length > 0 && (
              <div className="incomplete-tasks-notification">
                <span style={{ color: "white" }}>✓</span> All tasks completed.
              </div>
            )}
            {dateGroup.tasks.map((task, i) => (
              <div
                key={task.id}
                className={`alltodosdiv ${
                  expandedDates[date] ? "collapsing" : "expanding"
                }`}
              >
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
