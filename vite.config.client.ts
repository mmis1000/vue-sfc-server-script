import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { Plugin } from "./plugin/plugin";
import path from "path";


export default defineConfig({
    root: path.resolve(__dirname, './'),
    plugins: [vue(), Plugin('client')],
});
