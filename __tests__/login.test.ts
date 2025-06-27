//__tests__/login.test.ts

import { login } from '@firebase';
import { signInWithEmailAndPassword, getAuth} from "firebase/auth";

jest.mock('firebase/auth');

describe('login', () => {
    it('logs in a user successfully', async () => {
        const mockUser = { uid: 'abc123', email: 'test@example.com'};

        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
            user: mockUser,
    });

    const result = await login('test@example.com', 'password123');

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        getAuth(),
        'test@example.com',
        'password123',
    );
    expect(result.user).toEqual(mockUser);
    });

    it('throws an error for invalid credentials', async () => {
    const error = new Error('Invalid credentials');
        (signInWithEmailAndPassword as jest.Mock).mockRejectedValueOnce(error);

    await expect(login('wrong@example.com', 'wrongpassword')).rejects.toThrow(error);
    });
});
