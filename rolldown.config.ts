import { dts } from 'rolldown-plugin-dts'

export default {
  input: './src/index.ts',
  plugins: [dts()],
  output: [{ dir: 'dist', format: 'es', sourcemap: true }],
  external: ['@hamster-note/document-parser', '@hamster-note/types']
}
