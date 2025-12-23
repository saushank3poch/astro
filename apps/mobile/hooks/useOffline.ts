import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { storage } from '@/lib/storage';

interface QueuedAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export function useOffline() {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);

      // If we're back online, sync queued actions
      if (state.isConnected && state.isInternetReachable) {
        syncQueuedActions();
      }
    });

    // Load queued actions from storage
    loadQueuedActions();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadQueuedActions = async () => {
    try {
      const stored = await storage.getItem('queued_actions');
      if (stored) {
        setQueuedActions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading queued actions:', error);
    }
  };

  const queueAction = async (type: string, data: any) => {
    const action: QueuedAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now(),
    };

    const updated = [...queuedActions, action];
    setQueuedActions(updated);
    await storage.setItem('queued_actions', JSON.stringify(updated));
  };

  const syncQueuedActions = async () => {
    if (queuedActions.length === 0) return;

    console.log(`Syncing ${queuedActions.length} queued actions...`);

    // TODO: Implement actual sync logic based on action types
    // For now, just clear the queue
    const synced: string[] = [];

    for (const action of queuedActions) {
      try {
        // Sync action based on type
        switch (action.type) {
          case 'prediction':
            // Re-submit prediction
            break;
          case 'profile_update':
            // Re-submit profile update
            break;
          default:
            console.warn(`Unknown action type: ${action.type}`);
        }

        synced.push(action.id);
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    }

    // Remove synced actions from queue
    const remaining = queuedActions.filter((a) => !synced.includes(a.id));
    setQueuedActions(remaining);
    await storage.setItem('queued_actions', JSON.stringify(remaining));
  };

  const clearQueue = async () => {
    setQueuedActions([]);
    await storage.removeItem('queued_actions');
  };

  return {
    isConnected,
    isInternetReachable,
    isOffline: !isConnected || !isInternetReachable,
    queuedActions,
    queueAction,
    syncQueuedActions,
    clearQueue,
  };
}
