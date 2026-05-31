import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT ?? "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({
            root: path.resolve(import.meta.dirname, ".."),
          }),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("@react-three/fiber")) return "r3f";
          if (id.includes("@react-three/drei")) return "drei";
          if (id.includes("node_modules/howler")) return "howler";
          if (id.includes("node_modules/framer-motion")) return "motion";
        },
      },
    },
  },
  optimizeDeps: {
    entries: [
      './src/main.tsx',
      './src/App.tsx',
      './src/pages/SplashPage.tsx',
      './src/pages/StoryPage.tsx',
      './src/pages/HomePage.tsx',
      './src/pages/CharacterSelectPage.tsx',
      './src/pages/ScenePage.tsx',
      './src/pages/ConnectARPage.tsx',
      './src/pages/RewardsPage.tsx',
      './src/pages/SettingsPage.tsx',
      // Scan the 3D scenes up front so their heavy deps are discovered
      // during the initial pre-bundle (avoids mid-session re-optimize + reload)
      './src/scenes/*.tsx',
    ],
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'framer-motion',
      'wouter',
      '@tanstack/react-query',
      'zustand',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      // Heavy 3D / audio deps — pre-bundle once at startup instead of
      // discovering them on first navigation (which forces a full reload)
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'three/examples/jsm/loaders/FBXLoader.js',
      'howler',
      'gsap',
    ],
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
    warmup: {
      clientFiles: [
        './src/App.tsx',
        './src/main.tsx',
        './src/pages/SplashPage.tsx',
        './src/pages/StoryPage.tsx',
        './src/pages/HomePage.tsx',
        './src/pages/ScenePage.tsx',
        './src/index.css',
        // Warm the first scenes so they transform before the user reaches them
        './src/scenes/Scene1_IntroPortal.tsx',
        './src/scenes/Scene2_Bedroom.tsx',
        './src/components/Vimo.tsx',
      ],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
