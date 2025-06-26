jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
    createUserWithEmailAndPassword: jest.fn(),
    getAuth: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    setDoc: jest.fn(() => Promise.resolve()),
}));

// Tell TypeScript to treat it as a mocked function
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc } from 'firebase/firestore';
import { register } from '@firebase';

const mockedCreateUser = createUserWithEmailAndPassword as jest.MockedFunction<typeof createUserWithEmailAndPassword>;
const mockedSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;

test('registers a new user and writes to Firestore', async () => {
    mockedCreateUser.mockResolvedValueOnce({
        user: { uid: 'abc123' },
    } as any);

    const result = await register('Test@Example.com', 'password123');

    expect(result.uid).toBe('abc123');
    expect(mockedSetDoc).toHaveBeenCalled(); // ✅ confirms Firestore was called
});
