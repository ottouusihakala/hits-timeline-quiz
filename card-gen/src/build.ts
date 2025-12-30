await Bun.build({
  entrypoints: ['./src/index.ts'],
  target: 'bun',
  outdir: './dist',
  external: ['sharp'],
  minify: {
    whitespace: true,
    syntax: true,
  },
  bytecode: true,
});