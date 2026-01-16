// src/hooks/useRilevazioniRealtime.tsx
import { useEffect, useRef } from 'react';
import supabase from '../lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Configurazione di un canale realtime da sottoscrivere
 */
export interface ChannelConfig {
  /** Nome del canale Supabase */
  channelName: string;
  /** Nome dell'evento broadcast da ascoltare */
  eventName: string;
}

/**
 * Hook generico per sottoscriversi a canali realtime Supabase
 * 
 * @param channels - Array di configurazioni dei canali da sottoscrivere
 * @param onEvent - Callback chiamato quando arriva un evento da uno dei canali
 * 
 * @example
 * // Sottoscriversi a un solo canale
 * useRilevazioniRealtime(
 *   [{ channelName: 'monitoraggio_telefono', eventName: 'info' }],
 *   (payload) => console.log(payload)
 * );
 * 
 * @example
 * // Sottoscriversi a più canali
 * useRilevazioniRealtime(
 *   [
 *     { channelName: 'rilevazione', eventName: 'nuova_rilevazione' },
 *     { channelName: 'test_foto', eventName: 'foto' }
 *   ],
 *   (payload) => console.log(payload)
 * );
 */
export default function useRilevazioniRealtime(
  channels: ChannelConfig[],
  onEvent: (payload: any) => void
) {
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  useEffect(() => {
    if (!channels || channels.length === 0) {
      console.warn('useRilevazioniRealtime: nessun canale specificato');
      return;
    }

    console.log('useRilevazioniRealtime: sottoscrizione a', channels.length, 'canali');

    // Crea e sottoscrivi a tutti i canali specificati
    channels.forEach(({ channelName, eventName }) => {
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: true, ack: true }, private: false },
      });

      channel
        .on('broadcast', { event: eventName }, (payload) => {
          console.log(`Payload da ${channelName}:${eventName}:`, payload);
          if (onEvent) onEvent(payload);
        })
        .subscribe((status, error) => {
          console.log(`Status canale ${channelName}:`, status);
          if (error) {
            console.error(`Errore canale ${channelName}:`, error);
          }
          if (status === 'SUBSCRIBED') {
            channelsRef.current.set(channelName, channel);
            console.log(`Sottoscritto a ${channelName}:${eventName}`);
          } else if (status === 'CLOSED') {
            channelsRef.current.delete(channelName);
          }
        });
    });

    // Cleanup: rimuove tutti i canali quando il componente si smonta o cambiano le dipendenze
    return () => {
      channelsRef.current.forEach((channel, channelName) => {
        console.log(`Rimozione canale ${channelName}`);
        supabase.removeChannel(channel);
      });
      channelsRef.current.clear();
    };
  }, [channels, onEvent]);

  return null; // hook non rende nulla, usa callback onEvent per ricevere eventi
}