const config = {
    api: {
        API_URL:
            import.meta.env.PROD
                ? (import.meta.env.VITE_API_URL_PROD || "/api").replace(/"/g, "")
                : (import.meta.env.VITE_API_URL_DEV || "http://localhost:7005/api").replace(/"/g, ""),
    },
};

export default config;
