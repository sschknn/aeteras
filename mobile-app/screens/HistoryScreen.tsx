import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function HistoryScreen({ navigation }: any) {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_GATEWAY_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_GATEWAY_URL}/scans`);
      const data = await res.json();
      setScans(data);
    } catch (err) {
      console.warn('Verlauf Laden fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScan = async (scanId: number) => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}/scan/${scanId}`);
      const data = await res.json();
      if (res.ok) {
        navigation.navigate('Result', { scanData: data });
      }
    } catch (err) {
      console.error('Scan-Details laden fehlgeschlagen', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📜 Transaktions- & Scan-Verlauf</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 40 }} />
      ) : scans.length === 0 ? (
        <Text style={styles.emptyText}>Noch keine Antiquitäten-Scans durchgeführt.</Text>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => String(item.scan_id || item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => handleSelectScan(item.scan_id || item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.itemTitle}>{item.label}</Text>
                <Text style={styles.priceTag}>{item.price_median || 0} €</Text>
              </View>
              <Text style={styles.subText}>{item.epoch} • {item.material}</Text>
              <Text style={styles.dateText}>{new Date(item.ts).toLocaleString('de-DE')}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  header: { color: '#D4AF37', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', flex: 1 },
  priceTag: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  subText: { color: '#AAA', fontSize: 13, marginTop: 4 },
  dateText: { color: '#666', fontSize: 11, marginTop: 6 }
});
