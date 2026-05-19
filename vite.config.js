import { defineConfig } from 'vite'
import injectHTML from 'vite-plugin-html-inject'
import { resolve } from 'path'

export default defineConfig({
  // Базовый путь для GitHub Pages (название твоего репозитория)
  base: '/Cleaning-service-CLEANPRO/',
  
  plugins: [
    injectHTML()
  ],
  build: {
    rollupOptions: {
      output: {
        // Убираем хэши из названий JS и CSS файлов
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          // Убираем хэши из картинок и шрифтов
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
            return 'img/[name].[ext]'
          }
          if (/\.(woff|woff2|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'fonts/[name].[ext]'
          }
          // CSS файлы
          if (/\.css$/i.test(assetInfo.name)) {
            return 'css/[name].[ext]'
          }
          return 'assets/[name].[ext]'
        }
      }
    }
  }
})