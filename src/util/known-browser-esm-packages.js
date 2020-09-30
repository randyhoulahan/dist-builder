const defaultCdn = 'https://unpkg.com/'

export const knownBrowserEsmPackages = {
  vue        : `${defaultCdn}/vue@~2.6/dist/vue.esm.browser.min.js`,
  'vue-i18n' : `${defaultCdn}/vue-i18n@~8.21/dist/vue-i18n.esm.browser.min.js`,
  ky         : `${defaultCdn}/ky@~0.23`
}
