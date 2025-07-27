// friend.request.test.ts

import { sendFriendRequest } from '@firebase';
import {setDoc, doc, getFirestore } from "firebase/firestore";

jest.mock("firebase/firestore", () => ({
    setDoc: jest.fn(),
    doc: jest.fn((db, ...segments) => segments.join('/')),
    getFirestore: jest.fn(() => ({})),
}));

describe("Friend request logic", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends a friend request by creating incoming and outgoing documents', async () => {
        const from = 'userA';
        const to = 'userB';

        await sendFriendRequest(from, to);

        expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', from, 'outgoingRequests', to);
        expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', to, 'incomingRequests', from);

        expect(setDoc).toHaveBeenCalledWith('users/userA/outgoingRequests/userB', expect.objectContaining({
            from: from,
            to: to,
            status: 'pending',
        }));
    });
});