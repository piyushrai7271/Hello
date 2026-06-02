import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api";

const ChatInfoPanel = ({ selectedChat, closePanel }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [media, setMedia] = useState([]);
  const [files, setFiles] = useState([]);

  const userId = selectedChat?.members?.[0]?._id;
  const chatId = selectedChat?._id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !chatId) return;

      setLoading(true);

      const profileRes = await apiFetch(`/api/user/${userId}/profile`);

      if (profileRes.success) {
        setUser(profileRes.data);
      }

      const mediaRes = await apiFetch(`/api/chat/${chatId}/media`);

      if (mediaRes.success) {
        setMedia(mediaRes.data || []);
      }

      const filesRes = await apiFetch(`/api/chat/${chatId}/files`);

      if (filesRes.success) {
        setFiles(filesRes.data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, chatId]);

  if (loading) {
    return (
      <div className="w-[350px] h-full bg-white border-l flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-[350px] h-full bg-white border-l flex items-center justify-center">
        Failed to load profile
      </div>
    );
  }

  return (
    <div className="w-[450px] h-full bg-white border-l overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4 sticky top-0 bg-white z-10">
        <button
          onClick={closePanel}
          className="text-lg hover:text-blue-500 transition"
        >
          ←
        </button>

        <h2 className="font-semibold text-lg">Contact Info</h2>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center p-8">
        {user?.avatar?.url ? (
          <img
            src={user.avatar.url}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl shadow-md">
            {user.fullName?.charAt(0).toUpperCase()}
          </div>
        )}

        <h3 className="mt-5 text-2xl font-semibold text-center">
          {user.fullName}
        </h3>

        <p className="text-gray-800 text-center mt-2">
          {user.bio || "No bio available"}
        </p>

        {/* User Details */}
        <div className="w-full mt-8 border-t pt-6">
          <div className="mb-4 p-3 bg-gray-200 rounded-xl">
            <p className="text-xs text-gray-800 mb-1">Email</p>
            <p className="font-medium break-all">
              {user.email || "Not available"}
            </p>
          </div>

          <div className="mb-4 p-3 bg-gray-200 rounded-xl">
            <p className="text-xs text-gray-800 mb-1">Mobile</p>
            <p className="font-medium">
              {user.mobileNumber || "Not available"}
            </p>
          </div>

          <div className="mb-4 p-3 bg-gray-200 rounded-xl">
            <p className="text-xs text-gray-800 mb-1">Gender</p>
            <p className="font-medium">
              {user.gender || "Not specified"}
            </p>
          </div>

          <div className="mb-4 p-3 bg-gray-200 rounded-xl">
            <p className="text-xs text-gray-800 mb-1">Joined</p>
            <p className="font-medium">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Shared Media */}
          <div className="mt-8 border-t pt-6 w-full">
            <h4 className="font-semibold text-lg mb-4">
              Shared Media ({media.length})
            </h4>

            {media.length === 0 ? (
              <p className="text-sm text-gray-500">No shared media</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {media.slice(0, 9).map((item) => (
                  <img
                    key={item._id}
                    src={item.fileUrl}
                    alt="shared media"
                    className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shared Files */}
          <div className="mt-8 border-t pt-6 w-full">
            <h4 className="font-semibold text-lg mb-4">
              Shared Files ({files.length})
            </h4>

            {files.length === 0 ? (
              <p className="text-sm text-gray-500">No shared files</p>
            ) : (
              <div className="flex flex-col gap-3">
                {files.slice(0, 10).map((file) => (
                  <a
                    key={file._id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition"
                  >
                    <div className="text-2xl">📄</div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {file.fileName || "Unnamed File"}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(file.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInfoPanel;