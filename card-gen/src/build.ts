await Bun.build({
  entrypoints: ['./src/index.ts'],
  compile: {
    outfile: './cardgen',
    target: 'bun-linux-x64',
  },
  external: ['sharp'],
});