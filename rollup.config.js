import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'es'
  },
  plugins: [
    resolve({ preferBuiltins: true, exportConditions: ['node'] }),
    commonjs()
  ],
  onwarn(warning, warn) {
    // Suppress "this has been rewritten to undefined" and circular dependency warnings
    // which are expected when bundling some CommonJS dependencies like @actions/core.
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    if (warning.code === 'CIRCULAR_DEPENDENCY') return;
    warn(warning);
  }
};
