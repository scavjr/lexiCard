// Simple entry point for the PWA
// This loads the main app from the Expo bundle

console.log("Loading LexiCard app...");

// Try to load and render the app
(async () => {
  try {
    // Import the main App component
    // Note: In production, this should be a bundled version from Expo
    const { default: App } = await import("../App.tsx");

    // Get the root element
    const root = document.getElementById("root");

    if (root) {
      // Clear loading state
      root.innerHTML = "";

      // Create a simple container for React rendering
      const div = document.createElement("div");
      div.id = "app-root";
      root.appendChild(div);

      console.log("✅ App bundle loaded successfully");
    }
  } catch (error) {
    console.error("Failed to load app bundle:", error);
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML =
        '<div class="loading"><div class="loading-text">Erro ao carregar aplicação</div><p style="color: white; margin-top: 20px; font-size: 12px;">' +
        error.message +
        "</p></div>";
    }
  }
})();
