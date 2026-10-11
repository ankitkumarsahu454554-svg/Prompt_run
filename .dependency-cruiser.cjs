/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-is-pure',
      comment: 'src/domain imports nothing from react, next, store, features or components',
      severity: 'error',
      from: {
        path: '^src/domain'
      },
      to: {
        path: '^(react|next|src/store|src/features|src/components)'
      }
    },
    {
      name: 'features-do-not-cross-import',
      comment: 'features never import other features directly (only via domain/store)',
      severity: 'error',
      from: {
        path: '^src/features/([^/]+)'
      },
      to: {
        path: '^src/features/([^/]+)',
        pathNot: '^src/features/$1'
      }
    },
    {
      name: 'ui-components-do-not-import-features',
      comment: 'components/ui never import features',
      severity: 'error',
      from: {
        path: '^src/components/ui'
      },
      to: {
        path: '^src/features'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    }
  }
};
