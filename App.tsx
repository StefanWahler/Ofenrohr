import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';

import type { Blick } from './src/blick';
import { CreateScreen } from './src/screens/CreateScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PipeScreen } from './src/screens/PipeScreen';

type Route =
  | { name: 'home' }
  | { name: 'pipe'; blick: Blick }
  | { name: 'create' };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'home' });

  return (
    <>
      <StatusBar style="light" />
      {route.name === 'home' ? (
        <HomeScreen
          onOpenPipe={(blick) => setRoute({ name: 'pipe', blick })}
          onCreate={() => setRoute({ name: 'create' })}
        />
      ) : null}
      {route.name === 'pipe' ? (
        <PipeScreen blick={route.blick} onBack={() => setRoute({ name: 'home' })} />
      ) : null}
      {route.name === 'create' ? (
        <CreateScreen
          onBack={() => setRoute({ name: 'home' })}
          onPreview={(blick) => setRoute({ name: 'pipe', blick })}
        />
      ) : null}
    </>
  );
}
