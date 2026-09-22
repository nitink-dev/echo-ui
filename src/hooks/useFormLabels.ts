import { useEffect, useState } from 'react';
import { formLabelsService } from '../api/services/formLabelsService';

export function useFormLabels(formKey: string, defaults: Record<string, string>) {
  const [labels, setLabels] = useState<Record<string, string>>(defaults);

  useEffect(() => {
    let cancelled = false;
    formLabelsService.fetchLabels(formKey)
      .then((data) => {
        if (!cancelled && data && Object.keys(data).length > 0) {
          setLabels({ ...defaults, ...data });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [formKey]);

  return labels;
}
