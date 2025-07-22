import { analyzePhoto } from '@firebase';

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
            description: "Grilled Chicken",
            totalCalories: 550,
            dishes: ["Chicken", "Salad"]
        }),
    })
) as jest.Mock;

describe('analyzePhoto', () => {
    it('calls the server and returns analysis data', async () => {
        const result = await analyzePhoto('file:///path/to/image.jpg');
        expect(fetch).toHaveBeenCalled();
        expect(result.description).toBe("Grilled Chicken");
    });
});