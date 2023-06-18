import { useEffect } from 'react';

import { WSBaseMessage } from '@ws/types';

import { WSMessageType } from '../constants';

export const useListenType = <T extends WSBaseMessage>(
  messageType: WSMessageType,
  cb: (message: T) => void,
  lastMessage: WSBaseMessage | null
) => {
  useEffect(() => {
    if (lastMessage?.type === messageType) {
      cb(lastMessage as T);
    }
  }, [lastMessage]);
};