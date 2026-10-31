import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export async function initTestI18n(lng = 'en'): Promise<void> {
  if (!i18next.isInitialized) {
    await i18next.use(initReactI18next).init({ lng, resources: {} });
  } else {
    await i18next.changeLanguage(lng);
  }
}
