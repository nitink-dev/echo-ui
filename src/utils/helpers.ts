export const normalizeToArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };
  
  export const getChangedFields = (current: any, original: any): any => {
    const diff: any = {};
    
    Object.keys(current).forEach((key) => {
      const cur = current[key];
      const orig = original?.[key];
  
      // Normalize arrays to string for comparison
      if (Array.isArray(cur) || Array.isArray(orig)) {
        const curStr = Array.isArray(cur) ? cur.join(',') : (cur || '').toString();
        const origStr = Array.isArray(orig) ? orig.join(',') : (orig || '').toString();
        if (curStr.trim() !== origStr.trim()) {
          diff[key] = cur;
        }
      } else {
        if ((cur || '').toString().trim() !== (orig || '').toString().trim()) {
          diff[key] = cur;
        }
      }
    });
    
    return diff;
  };
  
  export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === '' ? null : value
      ])
    ) as T;
  };
  
  export const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  export const generateCSV = (data: [string, string][]): string => {
    return data.map(row => row.join(',')).join('\n');
  };
  
  export const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    downloadFile(url, filename);
    window.URL.revokeObjectURL(url);
  };