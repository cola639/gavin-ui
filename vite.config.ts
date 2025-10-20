/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config https://vitest.dev/config
export default defineConfig(({ command, mode }) => {
  // 根据当前工作員录中的`mode`加载.env 设置第三个参数为'’来加载所有环境变量，而不管是否有VITE ” 前绿。const env=loadEnv(mode,process.cwd()，
  const env = loadEnv(mode, process.cwd(), '');
  // console.log('env ->', env.VITE_BASE_API);
  // console.log('mode', mode, { ...env }); // current environment variables

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    server: {
      proxy: {
        // 选项写法
        [env.VITE_BASE_API]: {
          target: 'http://localhost:8888', // 目标地址
          changeOrigin: true, // 开启代理，在本地创建一个虚拟服务器，然后发送请求的数据，同时会收到请求的数据，这样服务端和服务端进行数据的交互就不会有跨域问题
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_BASE_API}`), '') // 路径重写，移除路径中的VITE_BASE_API
        }
      }
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
        }
      }
    },
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          exportType: 'named',
          ref: true,
          svgo: false,
          titleProp: true
        },
        include: '**/*.svg'
      }),
      tsconfigPaths()
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: '.vitest/setup',
      include: ['**/test.{ts,tsx}']
    }
  };
});
