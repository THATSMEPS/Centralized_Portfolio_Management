import { io } from "socket.io-client";
import config from "../config";

const SOCKET_URL = config.api.API_URL;

let socket;

export const initiateSocketConnection = (token) => {
    socket = io(SOCKET_URL, {
        auth: {
            token: token
        },
        transports: ['websocket', 'polling']
    });

    console.log(`📡 Connecting socket to ${SOCKET_URL}...`);

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err.message);
    });

    return socket;
};

export const disconnectSocket = () => {
    console.log("🔌 Disconnecting socket...");
    if (socket) socket.disconnect();
};

export const subscribeToNewOrders = (cb) => {
    if (!socket) return (true);
    socket.on("new_order", (data) => {
        console.log("🔔 New order received via socket:", data);
        return cb(null, data);
    });
};

export const subscribeToStatusUpdates = (cb) => {
    if (!socket) return (true);
    socket.on("order_status_update", (data) => {
        console.log("🔄 Order status updated via socket:", data);
        return cb(null, data);
    });
};

export const getSocket = () => socket;
