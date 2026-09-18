import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  createBlick,
  fileStemFromName,
  imageDataUri,
  INSTRUCTION_MAX,
  NAME_MAX,
  type Blick,
  type BlickBackground,
  type BlickImage,
} from '../blick';
import { shareBlick } from '../blickFile';
import { Button } from '../components/Button';
import { ChoiceRow } from '../components/ChoiceRow';
import { useGravity } from '../hooks/useGravity';
import {
  alignmentFromErrorDeg,
  angleBetweenRad,
  elevationDeg,
  formatHeading,
  headingDeg,
  normalize,
  radToDeg,
  type Vec3,
} from '../orientation';
import { pickBlickImage } from '../pickImage';
import { colors } from '../theme';

type Props = {
  onBack: () => void;
  onPreview: (blick: Blick) => void;
};

const DEFAULT_INSTRUCTION = 'Halt das Handy in dieselbe Richtung wie beim Aufnehmen.';

export function CreateScreen({ onBack, onPreview }: Props) {
  const { gravity, look, error: sensorError, status, askPermission } = useGravity();
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const [name, setName] = useState('');
  const [target, setTarget] = useState<{ gravity: Vec3; look: Vec3 } | null>(null);
  const [image, setImage] = useState<BlickImage | null>(null);
  const [sensorsOn, setSensorsOn] = useState(true);
  const [background, setBackground] = useState<BlickBackground>('black');

  const errorDeg = look && target ? radToDeg(angleBetweenRad(look, target.look)) : null;
  const alignment = errorDeg === null ? 0 : alignmentFromErrorDeg(errorDeg);

  const draft = useMemo(() => {
    if (!image || !target) {
      return null;
    }
    return createBlick({
      name,
      instruction,
      gravity: target.gravity,
      look: target.look,
      azimuthDeg: headingDeg(target.look),
      image,
      view: { sensors: sensorsOn, background },
    });
  }, [background, image, instruction, name, sensorsOn, target]);

  async function onPickImage() {
    try {
      const picked = await pickBlickImage();
      if (picked) {
        setImage(picked);
      }
    } catch (err) {
      Alert.alert('Bild', err instanceof Error ? err.message : 'Auswahl fehlgeschlagen.');
    }
  }

  function onCapturePose() {
    if (!gravity || !look) {
      Alert.alert(
        'Richtung',
        sensorError ?? 'Kompass und Lage brauchen einen Moment. Acht schwenken, von Metall weg.',
      );
      return;
    }
    setTarget({ gravity: normalize(gravity), look: normalize(look) });
  }

  function ensureDraft(): Blick | null {
    if (!image) {
      Alert.alert('Bild fehlt', 'Zuerst ein Foto aus der Mediathek wählen.');
      return null;
    }
    if (!target) {
      Alert.alert(
        'Richtung fehlt',
        'Handy auf das Ziel richten und „Diese Richtung übernehmen“ drücken.',
      );
      return null;
    }
    return draft;
  }

  function onCheck() {
    const ready = ensureDraft();
    if (ready) {
      onPreview(ready);
    }
  }

  async function onShare() {
    const ready = ensureDraft();
    if (!ready) {
      return;
    }
    try {
      await shareBlick(ready);
    } catch (err) {
      Alert.alert('Teilen', err instanceof Error ? err.message : 'Teilen fehlgeschlagen.');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
        <Pressable onPress={onBack} accessibilityRole="button">
          <Text style={styles.back}>Zurück</Text>
        </Pressable>
        <Text style={styles.title}>Ofenrohr erzeugen</Text>
        <Text style={styles.hint}>
          Foto aus der Mediathek, dann das Handy wie ein Rohr in eine Richtung im Raum halten
          (Höhe und Himmelsrichtung). Übernehmen speichert den Punkt auf der Kugel. Der Empfänger
          muss dorthin zielen, sonst fährt das Bild über den Rand.
        </Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          value={name}
          onChangeText={(text) => setName(text.slice(0, NAME_MAX))}
          style={styles.inputSingle}
          placeholder="z. B. Küche Norden"
          placeholderTextColor={colors.textDim}
          keyboardAppearance="dark"
          selectionColor={colors.rustLight}
          autoCorrect={false}
        />
        <Text style={styles.counter}>
          {name.length}/{NAME_MAX} · Datei {fileStemFromName(name)}.ofenrohr
        </Text>

        <Text style={styles.label}>1 · Bild</Text>
        {image ? (
          <Image source={{ uri: imageDataUri(image) }} style={styles.preview} />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>Noch kein Foto — Mediathek öffnen.</Text>
          </View>
        )}
        <Button
          title={image ? 'Anderes Foto wählen' : 'Foto aus der Mediathek'}
          onPress={() => void onPickImage()}
        />

        <Text style={styles.label}>2 · Richtung</Text>
        <Text style={styles.stepHint}>
          Rückseite zum Ziel, Bildschirm zu dir — wie in einer Planeten-App. Dann den Knopf
          drücken. Kippen allein reicht nicht, die Himmelsrichtung zählt mit.
        </Text>

        {status === 'denied' ? (
          <View style={styles.permit}>
            <Text style={styles.meterWarn}>{sensorError}</Text>
            <Button title="Einstellungen öffnen" variant="ghost" onPress={() => void askPermission()} />
          </View>
        ) : null}

        <View style={styles.poseBox}>
          <Text style={styles.poseStatus}>
            {target ? 'Richtung hängt am Ofenrohr.' : 'Noch keine Richtung übernommen.'}
          </Text>
          <Text style={styles.meter}>
            {look
              ? `Jetzt ${formatHeading(look)} · Höhe ${elevationDeg(look).toFixed(0)}°`
              : (sensorError ?? 'Warte auf Kompass und Lage…')}
          </Text>
          {target ? (
            <Text style={styles.meter}>
              Gespeichert {formatHeading(target.look)} · Höhe {elevationDeg(target.look).toFixed(0)}°
              {errorDeg !== null
                ? ` · ${errorDeg.toFixed(0)}° daneben, ${Math.round(alignment * 100)}% im Blick`
                : ''}
            </Text>
          ) : null}
          {target ? (
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${Math.round(alignment * 100)}%` }]} />
            </View>
          ) : null}
        </View>

        <Button
          title={target ? 'Richtung erneut übernehmen' : 'Diese Richtung übernehmen'}
          onPress={onCapturePose}
          disabled={status !== 'listening'}
        />

        <Text style={styles.label}>Anleitung (optional)</Text>
        <TextInput
          value={instruction}
          onChangeText={(text) => setInstruction(text.slice(0, INSTRUCTION_MAX))}
          style={styles.input}
          multiline
          placeholder="Kurzer Hinweis für den Empfänger"
          placeholderTextColor={colors.textDim}
          keyboardAppearance="dark"
          selectionColor={colors.rustLight}
        />
        <Text style={styles.counter}>
          {instruction.length}/{INSTRUCTION_MAX}
        </Text>

        <Text style={styles.label}>Empfänger-Steuerung</Text>
        <ChoiceRow
          value={sensorsOn ? 'sensors' : 'finger'}
          options={[
            { id: 'sensors', label: 'Sensoren' },
            { id: 'finger', label: 'Finger' },
          ]}
          onChange={(value) => setSensorsOn(value === 'sensors')}
        />
        <Text style={styles.stepHint}>
          Sensoren: Handy halten. Finger: im Rohr schwenken, falls Lage fehlt oder zum Testen.
        </Text>

        <Text style={styles.label}>Hintergrund</Text>
        <ChoiceRow
          value={background}
          options={[
            { id: 'black', label: 'Schwarz' },
            { id: 'camera', label: 'Kamera' },
            { id: 'panorama', label: 'Gebirge' },
          ]}
          onChange={setBackground}
        />
        <Text style={styles.stepHint}>
          Gebirge ist ein festes Alpenpanorama in der Kugel. Kamera fällt ohne Erlaubnis auf
          Schwarz zurück. Ein eigenes 360° in der Datei kommt später.
        </Text>

        <View style={styles.footer}>
          <Button title="Im Ofenrohr prüfen" onPress={onCheck} />
          <Button title="Als Datei teilen" variant="ghost" onPress={() => void onShare()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  wrap: {
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 40,
    gap: 10,
  },
  back: {
    color: colors.textDim,
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  hint: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  label: {
    color: colors.rustLight,
    marginTop: 10,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  stepHint: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.rim,
    borderRadius: 8,
    color: colors.text,
    backgroundColor: colors.pipe,
    padding: 12,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  inputSingle: {
    borderWidth: 1,
    borderColor: colors.rim,
    borderRadius: 8,
    color: colors.text,
    backgroundColor: colors.pipe,
    padding: 12,
    fontSize: 16,
  },
  counter: {
    color: colors.textDim,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  meter: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 18,
  },
  meterWarn: {
    color: colors.error,
    fontSize: 13,
  },
  poseBox: {
    borderWidth: 1,
    borderColor: colors.rim,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  poseStatus: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.pipe,
    overflow: 'hidden',
    marginTop: 4,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.ok,
  },
  preview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: colors.pipe,
  },
  emptyPreview: {
    width: '100%',
    aspectRatio: 1.4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rim,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyPreviewText: {
    color: colors.textDim,
    textAlign: 'center',
  },
  permit: {
    gap: 8,
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
});
