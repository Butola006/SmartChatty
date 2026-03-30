// ===== ZUSTAND STORE: Authentication & Real-time Socket Management =====
// Purpose: Centralized auth state + WebSocket connection for live online users
//breif:
// User Login → authUser saved → connectSocket() called 
// → Socket connection created → Backend broadcasts online users 
// → onlineUsers updated → Real-time chat works ✅
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Dynamic URL: Dev uses localhost:5001, Production uses same domain
const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  
  // ===== STATE =====
  authUser: null,                    // Currently logged-in user object
  isSigningUp: false,                // Loading state for signup form
  isLoggingIn: false,                // Loading state for login form
  isUpdatingProfile: false,          // Loading state for profile update
  isCheckingAuth: true,              // Loading state on app startup
  onlineUsers: [],                   // Array of online user IDs (from Socket)
  socket: null,                      // WebSocket connection object

  // ===== FUNCTIONS =====

  // 1. CHECK AUTH: Verifies if user still logged in (runs on app startup)
  //    If valid → sets authUser + connects Socket
  //    If invalid → clears authUser
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();  // Connect to live updates
    } catch (error) {
      set({ authUser: null });  // Not logged in
    } finally {
      set({ isCheckingAuth: false });  // Stop loading spinner
    }
  },

  // 2. SIGNUP: Creates new account
  //    Flow: Validate → HTTP POST → Save user → Connect Socket → Toast message
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      get().connectSocket();
      toast.success("Account created successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // 3. LOGIN: Logs in existing user
  //    Same flow as signup
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      get().connectSocket();  // IMPORTANT: Connect to Socket after login
      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // 4. UPDATE PROFILE: Updates user info (name, avatar, etc)
  //    Sends PUT request → Updates authUser state
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });  // Update local state
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // 5. LOGOUT: Clears auth & disconnects Socket
  //    Flow: HTTP POST logout → Clear user → Disconnect Socket
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      get().disconnectSocket();  // IMPORTANT: Disconnect Socket on logout
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  },

  // 6. CONNECT SOCKET: Establishes WebSocket connection for live updates
  //    • Checks if user exists
  //    • Creates Socket connection with userId in query
  //    • Listens for "getOnlineUsers" event → updates onlineUsers array
  //    ⚠️ KEY CONCEPT: This is called after login/signup to enable real-time chat
  connectSocket: () => {
    const { authUser } = get();
    
    // Guard: Don't reconnect if already connected
    if (!authUser || get().socket?.connected) return;

    // Create Socket connection with userId
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,  // Send user ID to backend
      },
    });
    socket.connect();
    set({ socket });

    // Listen for online users broadcast from backend
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });  // Update list of who's online
    });
  },

  // 7. DISCONNECT SOCKET: Closes WebSocket connection
  //    Called on logout to clean up
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

}));
