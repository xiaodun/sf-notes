const default_language = 'zh-CN';
import Vue from 'vue'
import VueI18n from 'vue-i18n'
import axios from 'axios'
import zhCN from 'iview/dist/locale/zh-CN';

let default_language_messages = require(`./lang/${default_language}`)

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: default_language, // set locale
  fallbackLocale: default_language,
  messages:{
  	[default_language]:Object.assign(default_language_messages,zhCN)
  }
})

const loadedLanguages = [default_language] // our default language that is preloaded 

function setI18nLanguage (lang) {
  i18n.locale = lang
  axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export function loadLanguageAsync (lang) {
  if (i18n.locale !== lang) {
    if (!loadedLanguages.includes(lang)) {
      return import(/* webpackChunkName: "lang-[request]" */ `./lang/${lang}`).then(msgs => {

        require.ensure([], function(require){
          var iView_messages = require(`iview/dist/locale/${lang}.js`);
          i18n.setLocaleMessage(lang,Object.assign(msgs,iView_messages.default));
          loadedLanguages.push(lang)
          return setI18nLanguage(lang)
        })
      })
    } 
    return Promise.resolve(setI18nLanguage(lang))
  }
  return Promise.resolve(lang)
}