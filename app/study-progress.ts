import type {Language} from './i18n';
import type {Sex} from './anatomy';

interface StudyProgress {
  tours?: Record<string, number>;
  scores?: Record<string, number>;
}

const key = (sex: Sex) => `human-atlas:study:v1:${sex}`;

export function readProgress(sex: Sex): StudyProgress {
  try {
    const value = JSON.parse(localStorage.getItem(key(sex)) ?? '{}');
    return value && typeof value === 'object' ? value : {};
  } catch {
    return {};
  }
}

export function saveProgress(sex: Sex, field: 'tours' | 'scores', id: string, value: number) {
  const progress = readProgress(sex);
  try {
    localStorage.setItem(key(sex), JSON.stringify({
      ...progress,
      [field]: {...progress[field], [id]: value},
    }));
  } catch {
    // Study remains available when storage is disabled.
  }
}

export function atlasLink(sex: Sex, language: Language, target: {tour: string; step: number} | {part: string}) {
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('body', sex);
  url.searchParams.set('lang', language);
  for (const [name, value] of Object.entries(target)) url.searchParams.set(name, String(value));
  return url;
}
