import { terser } from 'rollup-plugin-terser'
import minifyHTML from 'rollup-plugin-minify-html-literals'

export default [
  {
    input: './src/index.js',
    output: [
      {
        file: './min.js',
        format: 'es',
      }
    ],
    plugins: [
      terser(),
      minifyHTML(),
    ]
  }
]