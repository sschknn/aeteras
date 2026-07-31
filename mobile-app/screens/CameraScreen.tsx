import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

  const API_GATEWAY_URL = process.env.EXPO_PUBLIC_GATEWAY_URL || 'http://localhost:4000';

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Kamera-Zugriff erforderlich für den Antiquitäten-Scan</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Zugriff Erlauben</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakeScan = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      // Erstelle FormData
      const formData = new FormData();
      formData.append('image', {
        uri: photo.uri,
        name: 'scan.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('userId', 'mobile_app_user_1');

      console.log('Sende Bild an Gateway:', `${API_GATEWAY_URL}/scan`);
      const response = await fetch(`${API_GATEWAY_URL}/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.item) {
        navigation.navigate('Result', { scanData: data });
      } else {
        Alert.alert('Scan Fehler', data.error || 'Antiquität konnte nicht klassifiziert werden.');
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Netzwerkfehler', 'Verbindung zum Backend Gateway fehlgeschlagen: ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.scanBox}>
            <Text style={styles.scanBoxText}>Antiquität im Rahmen zentrieren</Text>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={styles.historyBtn} 
              onPress={() => navigation.navigate('History')}
            >
              <Text style={styles.historyBtnText}>📜 Verlauf</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.captureBtn, loading && styles.captureBtnDisabled]} 
              onPress={handleTakeScan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="large" />
              ) : (
                <View style={styles.captureInner} />
              )}
            </TouchableOpacity>

            <View style={{ width: 60 }} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#121212' },
  permissionText: { color: '#FFF', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  scanBox: { width: 280, height: 280, borderWidth: 2, borderColor: '#D4AF37', borderRadius: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.05)' },
  scanBoxText: { color: '#FFF', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, fontSize: 13 },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%' },
  historyBtn: { backgroundColor: '#222', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, borderBottomWidth: 2, borderColor: '#D4AF37' },
  historyBtnText: { color: '#D4AF37', fontWeight: 'bold' },
  captureBtn: { width: 76, height: 76, borderRadius: 38, borderHeight: 4, borderWidth: 4, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D4AF37' },
  button: { backgroundColor: '#D4AF37', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#000', fontWeight: 'bold' }
});
