import { acceptFriend } from '@firebase';
import { setDoc, deleteDoc, doc, getFirestore} from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({

    getFirestore: jest.fn(() => ({})),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
    doc: jest.fn((db, ...segments) => segments.join('/')),
}));

test('acceptFriend establishes friendship and deletes request documents', async () => {
    const uid = 'userA';
    const friendUid = 'userB';

    await acceptFriend(uid, friendUid);

    expect(setDoc).toHaveBeenCalledWith('users/userA/friends/userB', expect.any(Object));
    expect(setDoc).toHaveBeenCalledWith('users/userB/friends/userA', expect.any(Object));

    expect(deleteDoc).toHaveBeenCalledWith('users/userA/incomingRequests/userB');
    expect(deleteDoc).toHaveBeenCalledWith('users/userB/outgoingRequests/userA');
});