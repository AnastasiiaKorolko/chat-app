import { useEffect, useState } from "react";

export const ChatApp = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const socketInstance = new WebSocket("ws://localhost:3001");

    socketInstance.addEventListener("open", () => {
      console.log("Connected to server");
    });

    socketInstance.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "message") {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      } else if (data.type === "rooms") {
        setRooms(data.rooms);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, []);

  const handleSetUserName = () => {
    if (socket && username) {
      localStorage.setItem("username", username);
      socket.send(JSON.stringify({ type: "setUsername", username }));
    }
  };

  const handleJoinRoom = (roomName) => {
    if (socket) {
      setCurrentRoom(roomName);
      socket.send(
        JSON.stringify({ type: "join", room: roomName, author: username })
      );
    }
  };

  const handleCreateRoom = (roomName) => {
    if (socket) {
      socket.send(JSON.stringify({ type: "create", room: roomName }));
    }
  };

  const handleSendMessage = () => {
    if (socket && currentRoom && messageText.trim()) {
      const message = {
        type: "message",
        room: currentRoom,
        text: messageText,
        author: username,
        time: new Date().toLocaleTimeString(),
      };
      socket.send(JSON.stringify(message));
      setMessageText("");
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          required
        />
        <button onClick={handleSetUserName}>Set Username</button>
      </div>
      <div>
        <h2>Rooms</h2>
        <div>
          {rooms.map((room, index) => (
            <button key={index} onClick={() => handleJoinRoom(room)}>
              Join {room}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="New room name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateRoom(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>
      <div>
        <h2>Messages</h2>
        <div>
          {messages.map((msg, index) => (
            <div key={index}>
              <strong>{msg.author}</strong>: {msg.text} <em>({msg.time})</em>
            </div>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};
