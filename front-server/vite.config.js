import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
   // 환경변수 로드
   const env = loadEnv(mode, process.cwd(), '');
   
   // 환경에 따른 API 서버 URL 설정
   const API_TARGET = env.VITE_API_TARGET || 
      (mode === 'production' ? 'http://www.bridgehub.asia' : 'http://localhost:7100');

   console.log(`Vite Config - Mode: ${mode}, API Target: ${API_TARGET}`);

   return {
      plugins: [react()],
      server: {
         host: '0.0.0.0',
         allowedHosts: ["www.bridgehub.asia", "localhost",'0.0.0.0'],
         port: 7000,
         proxy: {
            '/api': {
               target: API_TARGET,
               changeOrigin: true,
               secure: false,
               rewrite: (path) => path.replace(/^\/api/, '/api')
            }
         }
      },
      resolve: {
         alias: {
            '@': path.resolve(__dirname, 'src'),
            '@img': path.resolve(__dirname, 'src/assets/imgs/img'),
            '@ico': path.resolve(__dirname, 'src/assets/imgs/ico'),
            '@scss': path.resolve(__dirname, 'src/assets/scss'),
            '@js': path.resolve(__dirname, 'src/assets/js'),
            '@page': path.resolve(__dirname, 'src/page'),
            '@components': path.resolve(__dirname, 'src/page/components'),
            '@common': path.resolve(__dirname, 'src/page/common'),
            '@json': path.resolve(__dirname, 'src/json'),
            '@dev': path.resolve(__dirname, 'dev'),
         },
      }
   };
})