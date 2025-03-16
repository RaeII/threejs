import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    fs: {
      // Permitir servir arquivos de fora do diretório raiz
      allow: ['..']
    }
  },
  build: {
    // Configurações de build
    rollupOptions: {
      input: 'index.html'
    }
  }
}); 