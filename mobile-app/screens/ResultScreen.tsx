import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function ResultScreen({ route, navigation }: any) {
  const { scanData } = route.params || {};
  const item = scanData?.item || {};
  const pricing = scanData?.pricing || {};
  const stats = pricing.stats || {};
  const offers = pricing.offers || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Badge */}
      <View style={styles.cardHeader}>
        <Text style={styles.epochBadge}>{item.epoch || 'Epoche Unbekannt'}</Text>
        <Text style={styles.confidenceText}>Konfidenz: {Math.round((item.confidence || 0.85) * 100)}%</Text>
      </View>

      <Text style={styles.title}>{item.label || 'Klassifiziertes Objekt'}</Text>

      {/* Meta Grid */}
      <View style={styles.metaRow}>
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Material</Text>
          <Text style={styles.metaValue}>{item.material || 'Guss / Glas'}</Text>
        </View>
        <View style={styles.metaBox}>
          <Text style={styles.metaLabel}>Herkunft</Text>
          <Text style={styles.metaValue}>{item.origin || 'Europa'}</Text>
        </View>
      </View>

      {/* Price Valuation Box */}
      <View style={styles.valuationCard}>
        <Text style={styles.sectionHeader}>💰 Schätzpreis-Spanne</Text>
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={styles.priceSub}>Min</Text>
            <Text style={styles.priceVal}>{stats.price_min || 0} €</Text>
          </View>
          <View style={[styles.priceCol, styles.medianCol]}>
            <Text style={styles.priceSubHighlight}>Median (Kassenwert)</Text>
            <Text style={styles.priceValMain}>{stats.price_median || 0} €</Text>
          </View>
          <View style={styles.priceCol}>
            <Text style={styles.priceSub}>Max</Text>
            <Text style={styles.priceVal}>{stats.price_max || 0} €</Text>
          </View>
        </View>
      </View>

      {/* Offers List */}
      <Text style={styles.sectionHeaderMargin}>🛒 Marktangebote ({offers.length})</Text>
      {offers.map((offer: any, idx: number) => (
        <TouchableOpacity 
          key={idx} 
          style={styles.offerCard}
          onPress={() => offer.url && Linking.openURL(offer.url)}
        >
          <View style={styles.offerRow}>
            <Text style={styles.offerPlatform}>{offer.platform}</Text>
            <Text style={styles.offerPrice}>{offer.price} {offer.currency}</Text>
          </View>
          <Text style={styles.offerTitle} numberOfLines={2}>{offer.title}</Text>
          <Text style={styles.offerCondition}>Zustand: {offer.condition}</Text>
        </TouchableOpacity>
      ))}

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backBtn}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.backBtnText}>📷 Neuer Scan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  content: { padding: 20, paddingBottom: 40 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  epochBadge: { backgroundColor: '#332900', color: '#D4AF37', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold' },
  confidenceText: { color: '#888', fontSize: 12 },
  title: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  metaBox: { flex: 1, backgroundColor: '#1E1E1E', padding: 12, borderRadius: 8 },
  metaLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  metaValue: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  valuationCard: { backgroundColor: '#1E1B10', borderWidth: 1, borderColor: '#D4AF37', padding: 16, borderRadius: 12, marginBottom: 20 },
  sectionHeader: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  sectionHeaderMargin: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginTop: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceCol: { alignItems: 'center' },
  medianCol: { backgroundColor: '#2B230B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D4AF37' },
  priceSub: { color: '#888', fontSize: 11 },
  priceSubHighlight: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },
  priceVal: { color: '#CCC', fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  priceValMain: { color: '#D4AF37', fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  offerCard: { backgroundColor: '#1E1E1E', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  offerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  offerPlatform: { color: '#D4AF37', fontSize: 12, fontWeight: 'bold' },
  offerPrice: { color: '#4ADE80', fontSize: 15, fontWeight: 'bold' },
  offerTitle: { color: '#EEE', fontSize: 14, marginBottom: 4 },
  offerCondition: { color: '#777', fontSize: 11 },
  backBtn: { backgroundColor: '#D4AF37', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  backBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});
