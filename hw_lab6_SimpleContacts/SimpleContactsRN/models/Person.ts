import * as Crypto from 'expo-crypto';

export interface Person {
  id: string;
  name: string;
  email: string;
  details: string;
  photoUri?: string;
}

// Spec: returns a new Person with a fresh random UUID as its id and empty
// name, email, and details. photoUri is left undefined until a photo is picked.
export function createBlankPerson(): Person {
  return {
    id: Crypto.randomUUID(),
    name: '',
    email: '',
    details: '',
  };
}