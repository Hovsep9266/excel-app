import { useCallback, useEffect, useMemo, useState } from 'react';
import { getExcelRange } from '../services/excelApi';
import { DEFAULT_RANGE, DEFAULT_SHEET, POLL_INTERVAL_MS } from '../utils';

export function useExcelRange(t) {
  const [tableData, setTableData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [fileLastModifiedAt, setFileLastModifiedAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRange = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await getExcelRange({
        sheet: DEFAULT_SHEET,
        ...(DEFAULT_RANGE ? { range: DEFAULT_RANGE } : {}),
      });
      setTableData(response.values || []);
      setFileLastModifiedAt(response.fileLastModifiedAt || '');
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load Excel range.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRange();
  }, [loadRange]);

  useEffect(() => {
    const timerId = window.setInterval(loadRange, POLL_INTERVAL_MS);
    return () => window.clearInterval(timerId);
  }, [loadRange]);

  useEffect(() => {
    const onFocus = () => loadRange();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [loadRange]);

  const statusText = useMemo(() => {
    if (errorMessage) return `${t('errorPrefix')} ${errorMessage}`;
    if (isLoading && !lastUpdated) return t('loading');
    if (!lastUpdated) return t('waitingForData');
    if (!fileLastModifiedAt) return '';
    const fileSavedAt = new Date(fileLastModifiedAt).toLocaleString();
    return t('fileSavedAt', { fileSavedAt });
  }, [t, errorMessage, isLoading, lastUpdated, fileLastModifiedAt]);

  return { tableData, errorMessage, isLoading, statusText };
}
