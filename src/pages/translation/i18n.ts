import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/translation.json';
import translationJP from '../locales/jp/translation.json';
import Cookies from "js-cookie";

// the translations
const resources = {
    en: {
        translation: translationEN
    },
    jp: {
        translation: translationJP
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: Cookies.get('i18next') || 'jp',
        fallbackLng: "jp",
        interpolation: {
            escapeValue: false // not needed for react as it escapes by default
        }
    });

export default i18n;
