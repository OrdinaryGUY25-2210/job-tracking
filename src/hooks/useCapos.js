import { useState, useEffect, useCallback } from 'react';
import { fetchCaposAnalytics, fetchCaposLogs, markCaposLogsAsRead } from '../lib/capos';

export function useCapos() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    users: [],
    totalUsers: 0,
    freeCount: 0,
    proCount: 0,
    supremeCount: 0,
    proRevenue: 0,
    supremeRevenue: 0,
    totalRevenue: 0,
    hasUnread: false,
  });
  const [logs, setLogs] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const analyticsResult = await fetchCaposAnalytics();
    const logsResult = await fetchCaposLogs();
    
    setData(analyticsResult);
    setLogs(logsResult);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const clearNotifications = async () => {
    await markCaposLogsAsRead();
    setData((prev) => ({ ...prev, hasUnread: false }));
  };

  return {
    ...data,
    logs,
    loading,
    refreshCapos: loadData,
    clearNotifications,
  };
}