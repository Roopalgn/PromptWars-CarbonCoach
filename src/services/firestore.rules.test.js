import { test } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

test('user cannot read another user\'s trips', async () => {
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

  await assertSucceeds(setDoc(aliceTripRef, { mode: 'metro' }));
  await assertFails(getDoc(bobTripRef));
  await assertSucceeds(getDoc(aliceTripRef));

  // Test insights subcollection security
  const aliceInsightRef = doc(aliceDb, 'users/alice/insights/latest');
  const bobInsightRef = doc(bobDb, 'users/alice/insights/latest');

  await assertSucceeds(setDoc(aliceInsightRef, { summary: 'Good job' }));
  await assertFails(getDoc(bobInsightRef));
  await assertSucceeds(getDoc(aliceInsightRef));

  await testEnv.cleanup();
});
