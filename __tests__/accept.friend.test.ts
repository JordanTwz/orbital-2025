// accept.friend.test.ts

import { acceptFriend } from '@firebase';
import { setDoc, deleteDoc, doc, getFirestore, writeBatch} from 'firebase/firestore';

const firestoreMocks: any = {};

jest.mock('firebase/firestore', () => {
    const setMock = jest.fn();
    const deleteMock = jest.fn();
    const commitMock = jest.fn();

    // Save them for use in your test
    firestoreMocks.setMock = setMock;
    firestoreMocks.deleteMock = deleteMock;
    firestoreMocks.commitMock = commitMock;

    return {
        doc: jest.fn((db, ...segments) => segments.join('/')),
        getFirestore: jest.fn(() => ({})),
        writeBatch: jest.fn(() => ({
            set: setMock,
            delete: deleteMock,
            commit: commitMock,
        })),
    };
});

// Now you can use firestoreMocks.setMock in your test
test('acceptFriend calls batch methods correctly', async () => {
    await acceptFriend('userA', 'userB');

    expect(firestoreMocks.setMock).toHaveBeenCalledTimes(2);
    expect(firestoreMocks.deleteMock).toHaveBeenCalledTimes(2);
    expect(firestoreMocks.commitMock).toHaveBeenCalled();
});