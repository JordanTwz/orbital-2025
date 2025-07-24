import { uploadImageAnalysis } from '../uploadImageAnalysis';

global.fetch = jest.fn();

describe('uploadImageAnalysis', () => {
    const mockImageUri = 'file:///path/to/photo.jpg';
    const mockServerUrl = 'https://example.com';

    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('successfully uploads and returns response', async () => {
        const mockResponse = { result: 'success' };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce(mockResponse),
        });

        const result = await uploadImageAnalysis({ imageUri: mockImageUri, serverUrl: mockServerUrl });
        expect(result).toEqual(mockResponse);
        expect(fetch).toHaveBeenCalledWith(
            `${mockServerUrl}/analyze`,
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        );
    });

    it('throws error when response not ok', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: jest.fn().mockResolvedValueOnce({ error: 'Bad request' }),
        });

        await expect(
            uploadImageAnalysis({ imageUri: mockImageUri, serverUrl: mockServerUrl })
        ).rejects.toThrow('Bad request');
    });

    it('throws error if no imageUri provided', async () => {
        await expect(
            uploadImageAnalysis({ imageUri: '', serverUrl: mockServerUrl })
        ).rejects.toThrow('No image URI provided');
    });
});