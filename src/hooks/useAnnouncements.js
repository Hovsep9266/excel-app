import { useCallback, useEffect, useState } from 'react';
import { deleteAnnouncement as deleteAnnouncementApi, getAnnouncement, saveAnnouncement as saveAnnouncementApi } from '../services/announcementApi';
import { POLL_INTERVAL_MS } from '../utils';

export function useAnnouncements() {
  const [announcement, setAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadAnnouncement = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const next = await getAnnouncement();
      setAnnouncement(next);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load announcement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  useEffect(() => {
    const timerId = window.setInterval(loadAnnouncement, POLL_INTERVAL_MS);
    return () => window.clearInterval(timerId);
  }, [loadAnnouncement]);

  const publishAnnouncement = useCallback(async ({ text, recipientIds, recipientKeys, userId, userName }) => {
    const saved = await saveAnnouncementApi({
      text,
      recipientIds,
      recipientKeys,
      userId,
      userName,
    });
    setAnnouncement(saved);
    return saved;
  }, []);

  const removeAnnouncement = useCallback(async ({ userId, userName }) => {
    await deleteAnnouncementApi({ userId, userName });
    setAnnouncement(null);
  }, []);

  return {
    announcement,
    errorMessage,
    isLoading,
    loadAnnouncement,
    publishAnnouncement,
    removeAnnouncement,
  };
}
