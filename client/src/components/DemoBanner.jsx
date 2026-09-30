import { useState } from 'react';
import { useI18n } from '../i18n';

const DISMISSED_KEY = 'bootleg.demo.bannerDismissed';

/**
 * Temporary notice shown only in the demo build.
 *
 * The published demo has no audio files - every track is a title - so visitors
 * need to know up front that pressing play will not produce sound. Dismissal is
 * remembered for the session.
 */
export default function DemoBanner() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === '1'
  );

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="demo-banner" role="note">
      <span className="demo-banner-text">{t('demo.audioLater')}</span>
      <button
        type="button"
        className="demo-banner-close"
        onClick={dismiss}
        aria-label={t('demo.dismiss')}
      >
        ×
      </button>
    </div>
  );
}
