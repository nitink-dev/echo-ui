import { useEffect, useState } from 'react';
import { formLabelsService } from '../api/services/formLabelsService';

export function useFormLabels(formKey: string, defaults: Record<string, string>) {
  const [labels, setLabels] = useState<Record<string, string>>(defaults);

  useEffect(() => {
    let cancelled = false;
    formLabelsService.fetchLabels(formKey)
      .then((data) => {
        if (cancelled || !data) return;
        const nonEmpty = Object.fromEntries(
          Object.entries(data).filter(([, value]) => typeof value === 'string' && value.trim().length > 0)
        );
        if (Object.keys(nonEmpty).length > 0) {
          setLabels({ ...defaults, ...nonEmpty });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [formKey]);

  return labels;
}