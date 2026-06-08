import { useCallback, useEffect, useMemo, useState } from 'react';
import { getExcelRange } from '../services/excelApi';
import { DEFAULT_RANGE, DEFAULT_SHEET, POLL_INTERVAL_MS } from '../utils';

export function useExcelRange(t) {
  const [tableData, setTableData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRange = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const response = await getExcelRange({
        sheet: DEFAULT_SHEET,
        range: DEFAULT_RANGE,
      });
      setTableData(response.values || []);
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

  const statusText = useMemo(() => {
    if (errorMessage) return `${t('errorPrefix')} ${errorMessage}`;
    if (isLoading && !lastUpdated) return t('loading');
    if (!lastUpdated) return t('waitingForData');
    return t('autoUpdated', {
      time: lastUpdated,
      seconds: Math.floor(POLL_INTERVAL_MS / 1000),
    });
  }, [t, errorMessage, isLoading, lastUpdated]);

  return { tableData, errorMessage, isLoading, statusText };
}
