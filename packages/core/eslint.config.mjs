import createConfig from '@itskyedo/eslint-config';

export default createConfig(
  {
    library: true,
    typescript: true,
    prettier: true,
    jsdoc: true,
    import: true,
    promise: true,
    stylistic: false,
    sort: true,
  },

  {
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        { packageDir: ['../../', './'] },
      ],
    },
  },
);
