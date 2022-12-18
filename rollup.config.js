import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: './index.js',
    output: [
      {
        file: './min.js',
        format: 'es',
      }
    ],
    plugins: [
      terser()
    ]
  }
]