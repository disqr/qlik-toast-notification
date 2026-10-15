module.exports = {
  build: {
    typescript: true,
    // @qlik/api lazy-loads modules; a Sense extension must be a single file.
    inlineDynamic: true,
  },
};
