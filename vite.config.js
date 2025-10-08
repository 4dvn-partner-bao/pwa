// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // SW auto update & chiếm quyền ngay khi tải xong
      registerType: "autoUpdate",
      devOptions: {
        enabled: false, // bật true nếu muốn test SW trong dev
      },

      includeAssets: ["apple-touch-icon.png"],

      manifest: {
        id: "/",
        scope: "/",
        start_url: "/",
        name: "Space Hub – PWA",
        short_name: "SpaceHub",
        description: "Check-in/Check-out không gian làm việc",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        display_override: ["standalone", "fullscreen", "minimal-ui"],
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },

      workbox: {
        // 🔧 QUAN TRỌNG: Fallback cho SPA (fix mở /session, /checkout trực tiếp)
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          // không áp dụng fallback cho API hay file tĩnh
          /^\/api\//,
          /\/assets\//,
          /\/icons\//,
          /\/manifest\.webmanifest$/,
          /\/robots\.txt$/,
        ],

        // Dọn cache cũ & claim clients ngay
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // Precache các file build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],

        // Runtime caching
        runtimeCaching: [
          // API: ưu tiên mạng, có cache dự phòng
          {
            urlPattern: /\/api\/.*$/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Ảnh/static: vào cache trước, sau mới mạng
          {
            urlPattern: ({ request }) =>
              request.destination === "image" || /\.(?:png|jpg|jpeg|svg|webp)$/.test(request.url),
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 ngày
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Fonts: cache lâu
          {
            urlPattern: ({ request }) =>
              request.destination === "font" || /\.(?:woff2?)$/.test(request.url),
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    tailwindcss(),
  ],
});
