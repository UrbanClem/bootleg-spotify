import { LANGUAGES, useI18n } from '../i18n';

/**
 * Two-option segmented control for switching UI language.
 *
 * Renders as a radio group so assistive tech announces which option is live,
 * and the choice persists via `localStorage` inside `I18nProvider`.
 */
export default function LanguageSwitch({ compact = false, className = '' }) {
  const { lang, setLang } = useI18n();

  return (
    <div
      className={`lang-switch${compact ? ' lang-switch--compact' : ''} ${className}`.trim()}
      role="group"
    >
      {LANGUAGES.map((option) => {
        const active = option.code === lang;
        return (
          <button
            key={option.code}
            type="button"
            className={`lang-option${active ? ' is-active' : ''}`}
            onClick={() => setLang(option.code)}
            aria-pressed={active}
            lang={option.code}
          >
            {compact ? option.short : option.label}
          </button>
        );
      })}
    </div>
  );
}
