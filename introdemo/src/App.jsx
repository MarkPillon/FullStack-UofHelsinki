import { useState, useEffect } from "react";
import Note from "./components/Note";

const App = () => {
  const [notes, setNotes] = useState([]); // Start with an empty array
  const [newNote, setNewNote] = useState("");
  const [showAll, setShowAll] = useState(true);

  // Fetch notes from /data.json when component mounts
  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => setNotes(data)) // Update state with fetched data
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
      id: String(notes.length + 1),
    };

    setNotes(notes.concat(noteObject));
    setNewNote("");
  };

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  };

  const notesToShow = showAll ? notes : notes.filter((note) => note.important);

  return (
    <div>
      <h1>Notes</h1>
      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? "important" : "all"}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) => (
          <Note key={note.id} note={note} />
        ))}
      </ul>
      <form onSubmit={addNote}>
        <input value={newNote} onChange={handleNoteChange} />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default App;

