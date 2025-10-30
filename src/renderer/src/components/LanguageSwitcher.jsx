import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button onClick={() => changeLanguage('en')} disabled={i18n.language === 'en'} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
        English
      </button>
      <button onClick={() => changeLanguage('ru')} disabled={i18n.language === 'ru'} className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
        Русский
      </button>
    </div>
  );
}

export default LanguageSwitcher;
