// User clicks contact 
// → setSelectedUser(user) 
// → getMessages(userId) - loads history
// → subscribeToMessages() - starts listening for new messages

// New message arrives from backend 
// → Socket "newMessage" event fires 
// → Check if from selected user (prevents noise)
// → Add to messages array 
// → UI updates instantly ✅

// User switches contact 
// → unsubscribeFromMessages() - stops listening
// → setSelectedUser(newUser) 
// → Repeat process
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  // ===== STATE =====
  messages: [],                      // Array of all messages with selected user
  users: [],                         // Array of all users to chat with
  selectedUser: null,                // Currently selected user for chatting
  isUsersLoading: false,             // Loading state while fetching users list
  isMessagesLoading: false,          // Loading state while fetching messages
  messageListener: null,             // Store reference to current message listener

  // ===== FUNCTIONS =====

  // 1. GET USERS: Fetches list of all available users to chat with
  //    Used in Sidebar to show list of contacts
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });  // Save user list to state
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // 2. GET MESSAGES: Fetches chat history with a specific user
  //    Called when user clicks on someone in Sidebar
  //    Parameter: userId → receives all previous messages with that user
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });  // Load chat history
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // 3. SEND MESSAGE: Sends a message to the selected user
  //    Flow: POST to backend → Get response → Add to messages array immediately
  //    messageData = { text: "hello", image: "url" } etc
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`, 
        messageData
      );
      // IMPORTANT: Add sent message to local state immediately (optimistic update)
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // 4. SUBSCRIBE TO MESSAGES: Listens for incoming real-time messages
  //    Uses Socket.io to get "newMessage" event from backend
  //    ⚠️ KEY: Properly manages listener to avoid duplicates and stale closures
  //    Called when user clicks on a contact
  subscribeToMessages: () => {
    const { selectedUser, messageListener } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    
    // First, remove old listener if it exists
    if (messageListener) {
      socket.off("newMessage", messageListener);
    }

    // Create new listener that checks current selectedUser dynamically
    const newMessageHandler = (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      // Only process if message is from selected user
      if (!currentSelectedUser || newMessage.senderId !== currentSelectedUser._id) {
        return;
      }
      // Add message to current chat
      set({
        messages: [...get().messages, newMessage],
      });
    };

    // Register listener and save reference
    socket.on("newMessage", newMessageHandler);
    set({ messageListener: newMessageHandler });
  },

  // 5. UNSUBSCRIBE FROM MESSAGES: Stops listening for incoming messages
  //    Called when user switches to different chat or logs out
  //    Properly removes the specific listener to prevent memory leaks
  unsubscribeFromMessages: () => {
    const { messageListener } = get();
    if (!messageListener) return;

    const socket = useAuthStore.getState().socket;
    socket.off("newMessage", messageListener);
    set({ messageListener: null });
  },

  // 6. SET SELECTED USER: Sets which user user is chatting with
  //    Triggers: getMessages() + subscribeToMessages() in UI
  setSelectedUser: (selectedUser) => set({ selectedUser }),

}));
