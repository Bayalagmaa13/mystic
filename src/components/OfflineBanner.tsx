import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Txt } from './Txt';

/** Интернэт тасрахад дэлгэцийн дээд талд шар мэдэгдэл гаргана */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => NetInfo.addEventListener((s) => setOffline(s.isConnected === false)), []);

  if (!offline) return null;
  return (
    <View style={[styles.wrap, { top: insets.top + 6 }]} pointerEvents="none">
      <Ionicons name="cloud-offline-outline" size={16} color="#F2C66D" />
      <Txt style={{ fontSize: 13 }}>Интернэт холболтгүй байна</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 20, right: 20, zIndex: 100, flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 14, backgroundColor: '#3B2F14', borderWidth: 1, borderColor: '#F2C66D',
  },
});
