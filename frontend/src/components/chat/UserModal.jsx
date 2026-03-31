import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api.js";

const UserModal = ({ onClose, refreshChats }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await apiFetch("/api/user/all-users");
    if (res.success) setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createChat = async (userId) => {
    const res = await apiFetch("/api/chat/create-new-chat", {
      method: "POST",
      body: JSON.stringify({ otherUserId: userId }),
    });

    if (res.success) {
      refreshChats();
      onClose();
    }
  };

  return (
    <div className="absolute top-0 left-0 w-1/3 h-full bg-white p-3 z-10">
      <h2 className="font-bold mb-3">Select User</h2>

      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => createChat(user._id)}
          className="p-2 border-b cursor-pointer"
        >
          {user.fullName}
        </div>
      ))}

      <button onClick={onClose} className="mt-3">
        Close
      </button>
    </div>
  );
};

export default UserModal;