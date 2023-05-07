import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { Plugin } from "./plugin/plugin";
import path from "path";


export default defineConfig({
    optimizeDeps: {
      // It's recommended to disable deps optimization
      disabled: true,
    },
    root: path.resolve(__dirname, './'),
    plugins: [vue(), Plugin('server')],
});
