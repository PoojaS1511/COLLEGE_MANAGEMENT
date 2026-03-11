// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/Admin/Downloads/ST-main/ST-main/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Admin/Downloads/ST-main/ST-main/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath, URL } from "url";
import { nodePolyfills } from "file:///C:/Users/Admin/Downloads/ST-main/ST-main/frontend/node_modules/vite-plugin-node-polyfills/dist/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\Admin\\Downloads\\ST-main\\ST-main\\frontend";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Admin/Downloads/ST-main/ST-main/frontend/vite.config.js";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/",
    define: {
      "process.env": {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      },
      global: "window"
    },
    optimizeDeps: {
      include: [
        "@supabase/auth-helpers-nextjs",
        "@supabase/ssr",
        "@supabase/supabase-js",
        "react",
        "react-dom",
        "react-router-dom",
        "tailwindcss",
        "postcss",
        "autoprefixer",
        "@tailwindcss/nesting",
        "file-saver",
        "jspdf",
        "jspdf-autotable"
      ]
    },
    plugins: [
      react(),
      nodePolyfills({
        exclude: [],
        protocolImports: true
      })
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
        crypto: "crypto-browserify",
        stream: "stream-browserify",
        util: "util",
        path: "path-browserify",
        os: "os-browserify/browser",
        https: "agent-base",
        http: "agent-base"
      },
      extensions: [".js", ".jsx", ".ts", ".tsx", ".json", ".mjs"]
    },
    // Development server configuration
    server: {
      port: 3001,
      open: true,
      strictPort: true,
      host: true,
      cors: true,
      fs: {
        allow: [
          fileURLToPath(new URL("./", __vite_injected_original_import_meta_url)),
          fileURLToPath(new URL("../", __vite_injected_original_import_meta_url))
        ]
      },
      proxy: {
        "^/api": {
          target: "http://localhost:5001",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    // Build configuration
    build: {
      manifest: true,
      outDir: "dist",
      sourcemap: true,
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        input: {
          main: resolve(__vite_injected_original_dirname, "index.html")
        },
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"]
          }
        },
        onwarn(warning, warn) {
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEb3dubG9hZHNcXFxcU1QtbWFpblxcXFxTVC1tYWluXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBZG1pblxcXFxEb3dubG9hZHNcXFxcU1QtbWFpblxcXFxTVC1tYWluXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BZG1pbi9Eb3dubG9hZHMvU1QtbWFpbi9TVC1tYWluL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIFxuICByZXR1cm4ge1xuICAgIGJhc2U6ICcvJyxcbiAgICBkZWZpbmU6IHtcbiAgICAgICdwcm9jZXNzLmVudic6IHtcbiAgICAgICAgVklURV9TVVBBQkFTRV9VUkw6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX1NVUEFCQVNFX1VSTCksXG4gICAgICAgIFZJVEVfU1VQQUJBU0VfQU5PTl9LRVk6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZKVxuICAgICAgfSxcbiAgICAgIGdsb2JhbDogJ3dpbmRvdycsXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgJ0BzdXBhYmFzZS9hdXRoLWhlbHBlcnMtbmV4dGpzJyxcbiAgICAgICAgJ0BzdXBhYmFzZS9zc3InLFxuICAgICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcbiAgICAgICAgJ3JlYWN0JyxcbiAgICAgICAgJ3JlYWN0LWRvbScsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tJyxcbiAgICAgICAgJ3RhaWx3aW5kY3NzJyxcbiAgICAgICAgJ3Bvc3Rjc3MnLFxuICAgICAgICAnYXV0b3ByZWZpeGVyJyxcbiAgICAgICAgJ0B0YWlsd2luZGNzcy9uZXN0aW5nJyxcbiAgICAgICAgJ2ZpbGUtc2F2ZXInLFxuICAgICAgICAnanNwZGYnLFxuICAgICAgICAnanNwZGYtYXV0b3RhYmxlJ1xuICAgICAgXVxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3QoKSxcbiAgICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgICBleGNsdWRlOiBbXSxcbiAgICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxuICAgICAgfSksXG4gICAgXSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgY3J5cHRvOiAnY3J5cHRvLWJyb3dzZXJpZnknLFxuICAgICAgICBzdHJlYW06ICdzdHJlYW0tYnJvd3NlcmlmeScsXG4gICAgICAgIHV0aWw6ICd1dGlsJyxcbiAgICAgICAgcGF0aDogJ3BhdGgtYnJvd3NlcmlmeScsXG4gICAgICAgIG9zOiAnb3MtYnJvd3NlcmlmeS9icm93c2VyJyxcbiAgICAgICAgaHR0cHM6ICdhZ2VudC1iYXNlJyxcbiAgICAgICAgaHR0cDogJ2FnZW50LWJhc2UnLFxuICAgICAgfSxcbiAgICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy5qc3gnLCAnLnRzJywgJy50c3gnLCAnLmpzb24nLCAnLm1qcyddXG4gICAgfSxcbiAgICAvLyBEZXZlbG9wbWVudCBzZXJ2ZXIgY29uZmlndXJhdGlvblxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMSxcbiAgICAgIG9wZW46IHRydWUsXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGNvcnM6IHRydWUsXG4gICAgICBmczoge1xuICAgICAgICBhbGxvdzogW1xuICAgICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi8nLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICAgICBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4uLycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICAgIF1cbiAgICAgIH0sXG4gICAgICBwcm94eToge1xuICAgICAgICAnXi9hcGknOiB7XG4gICAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo1MDAxJyxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICAvLyBCdWlsZCBjb25maWd1cmF0aW9uXG4gICAgYnVpbGQ6IHtcbiAgICAgIG1hbmlmZXN0OiB0cnVlLFxuICAgICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIGlucHV0OiB7XG4gICAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJylcbiAgICAgICAgfSxcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICByZWFjdDogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgICAgbXVpOiBbJ0BtdWkvbWF0ZXJpYWwnLCAnQG11aS9pY29ucy1tYXRlcmlhbCcsICdAZW1vdGlvbi9yZWFjdCcsICdAZW1vdGlvbi9zdHlsZWQnXSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBvbndhcm4od2FybmluZywgd2Fybikge1xuICAgICAgICAgIGlmICh3YXJuaW5nLmNvZGUgPT09ICdNT0RVTEVfTEVWRUxfRElSRUNUSVZFJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICB3YXJuKHdhcm5pbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVixTQUFTLGNBQWMsZUFBZTtBQUN6WCxPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlLFdBQVc7QUFDbkMsU0FBUyxxQkFBcUI7QUFDOUIsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBQThLLElBQU0sMkNBQTJDO0FBTXhRLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixlQUFlO0FBQUEsUUFDYixtQkFBbUIsS0FBSyxVQUFVLElBQUksaUJBQWlCO0FBQUEsUUFDdkQsd0JBQXdCLEtBQUssVUFBVSxJQUFJLHNCQUFzQjtBQUFBLE1BQ25FO0FBQUEsTUFDQSxRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sY0FBYztBQUFBLFFBQ1osU0FBUyxDQUFDO0FBQUEsUUFDVixpQkFBaUI7QUFBQSxNQUNuQixDQUFDO0FBQUEsSUFDSDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxRQUNwRCxRQUFRO0FBQUEsUUFDUixRQUFRO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsUUFDTixJQUFJO0FBQUEsUUFDSixPQUFPO0FBQUEsUUFDUCxNQUFNO0FBQUEsTUFDUjtBQUFBLE1BQ0EsWUFBWSxDQUFDLE9BQU8sUUFBUSxPQUFPLFFBQVEsU0FBUyxNQUFNO0FBQUEsSUFDNUQ7QUFBQTtBQUFBLElBRUEsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsT0FBTztBQUFBLFVBQ0wsY0FBYyxJQUFJLElBQUksTUFBTSx3Q0FBZSxDQUFDO0FBQUEsVUFDNUMsY0FBYyxJQUFJLElBQUksT0FBTyx3Q0FBZSxDQUFDO0FBQUEsUUFDL0M7QUFBQSxNQUNGO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxTQUFTO0FBQUEsVUFDUCxRQUFRO0FBQUEsVUFDUixjQUFjO0FBQUEsVUFDZCxRQUFRO0FBQUEsVUFDUixTQUFTLENBQUMsU0FBUztBQUFBLFFBQ3JCO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBR0EsT0FBTztBQUFBLE1BQ0wsVUFBVTtBQUFBLE1BQ1YsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsT0FBTztBQUFBLFVBQ0wsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxRQUN2QztBQUFBLFFBQ0EsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osT0FBTyxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUNoRCxLQUFLLENBQUMsaUJBQWlCLHVCQUF1QixrQkFBa0IsaUJBQWlCO0FBQUEsVUFDbkY7QUFBQSxRQUNGO0FBQUEsUUFDQSxPQUFPLFNBQVMsTUFBTTtBQUNwQixjQUFJLFFBQVEsU0FBUywwQkFBMEI7QUFDN0M7QUFBQSxVQUNGO0FBQ0EsZUFBSyxPQUFPO0FBQUEsUUFDZDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
