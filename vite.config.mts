import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import svgLoader from 'vite-svg-loader'
import Components from 'unplugin-vue-components/vite'
import { viteMockServe } from 'vite-plugin-mock'

// https://vitejs.dev/config/
export default defineConfig(config => {
	return {
		plugins: [
			vue({
				// script: {
				// 	defineModel: true,
				// 	propsDestructure: true
				// }
			}),
			viteMockServe({
				// supportTs: true, // 是否开启支持ts
				mockPath: 'mock', // 设置mockPath为根目录下的mock目录
				localEnabled: true, // 设置是否监视mockPath对应的文件夹内文件中的更改
				prodEnabled: false, // 设置是否启用生产环境的mock服务
				watchFiles: true, // 是否监视文件更改
				logger: true //是否在控制台显示请求日志
			}),
			vueJsx(),
			svgLoader(),
			Components({
				dirs: ['src/components/cards'],
				dts: 'src/unplugin.components.d.ts'
			})
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		optimizeDeps: {
			include: ['@fawmi/vue-google-maps', 'fast-deep-equal']
		},
		server: {
			open: true
		},
		build: {
			sourcemap: config.mode === 'development' // 是否生成 sourcemap 文件
		}
	}
})
