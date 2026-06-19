import { test } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("user cannot read another user's trips", async () => {

  const rulesPath = path.resolve(__dirname, '../../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');

  const testEnv = await initializeTestEnvironment({
    projectId: 'carboncoach-test',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8080,
    },
  });

  const aliceDb = testEnv.authenticatedContext('alice').firestore();
  const bobDb = testEnv.authenticatedContext('bob').firestore();

  // Test trips subcollection security
  const aliceTripRef = doc(aliceDb, 'users/alice/trips/t1');
  const bobTripRef = doc(bobDb, 'users/alice/trips/t1');

  const validTrip = {
    origin: 'A',
    destination: 'B',
    mode: 'metro',
    distance_km: 10,
    kg_co2: 1.5,
    timestamp: new Date().toISOString()
  };

  await assertSucceeds(setDoc(aliceTripRef, validTrip));
  await assertFails(getDoc(bobTripRef));
  await assertSucceeds(getDoc(aliceTripRef));

  // Test insights subcollection security
  const aliceInsightRef = doc(aliceDb, 'users/alice/insights/latest');
  const bobInsightRef = doc(bobDb, 'users/alice/insights/latest');

  const validInsight = {
    summary: 'Good job',
    top_action: 'Take bus',
    encouragement: 'Keep it up',
    timestamp: new Date().toISOString()
  };

  await assertSucceeds(setDoc(aliceInsightRef, validInsight));
  await assertFails(getDoc(bobInsightRef));
  await assertSucceeds(getDoc(aliceInsightRef));

  await testEnv.cleanup();
}, 15000);
