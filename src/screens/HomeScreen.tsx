import { Alert, StyleSheet, Text, View } from 'react-native';

import { gebirgeDemoBlick, type Blick } from '../blick';
import { describeImportError, pickBlickFile, shareBlick } from '../blickFile';
import { Button } from '../components/Button';
import { colors } from '../theme';

type Props = {
  onOpenPipe: (blick: Blick) => void;
  onCreate: () => void;
};

export function HomeScreen({ onOpenPipe, onCreate }: Props) {
  async function onReceive() {
    try {
      const blick = await pickBlickFile();
      if (blick) {
        onOpenPipe(blick);
      }
    } catch (err) {
      const message = describeImportError(err);
      Alert.alert('Blick unlesbar', message);
    }
  }

  async function onSaveSample() {
    try {
      await shareBlick(gebirgeDemoBlick());
    } catch (err) {
      Alert.alert('Teilen', err instanceof Error ? err.message : 'Teilen fehlgeschlagen.');
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Machbarkeitsstudie</Text>
      <Text style={styles.title}>Ofenrohr</Text>
      <Text style={styles.lede}>
        Dann kannst du mit dem Ofenrohr ins Gebirge schauen. Das Handy ist das Rohr. Ein Bild
        sitzt in einer Lage; schwenkst du weg, ist es weg.
      </Text>

      <View style={styles.actions}>
        <Button
          title="Ins Gebirge schauen"
          onPress={() => onOpenPipe(gebirgeDemoBlick())}
        />
        <Button
          title="Beispieldatei sichern"
          variant="ghost"
          onPress={() => void onSaveSample()}
        />
        <Button
          title="Blick empfangen"
          variant="ghost"
          onPress={() => void onReceive()}
        />
        <Text style={styles.caption}>
          Zuerst „Beispieldatei sichern“ → In Dateien sichern. Danach unter Empfangen dieselbe
          Datei (blick.ofenrohr) öffnen. Fotos aus der Mediathek: Blick schicken.
        </Text>
        <Button title="Ofenrohr erzeugen" variant="ghost" onPress={onCreate} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  kicker: {
    color: colors.rustLight,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 14,
  },
  lede: {
    color: colors.textDim,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  actions: {
    gap: 12,
  },
  caption: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
    marginTop: -4,
    marginBottom: 4,
  },
});
