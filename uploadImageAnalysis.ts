// uploadImageAnalysis.ts
export interface UploadImageParams {
    imageUri: string;
    serverUrl: string;
}

export const uploadImageAnalysis = async ({ imageUri, serverUrl }: UploadImageParams) => {
    if (!imageUri) throw new Error('No image URI provided');

    const uriParts = imageUri.split('/');
    const fileName = uriParts.pop() || 'photo.jpg';
    const match = /\.(\w+)$/.exec(fileName);
    const fileType = match ? `image/${match[1]}` : 'image';

    const formData = new FormData();
    formData.append('photo', {
        uri: imageUri,
        name: fileName,
        type: fileType,
    } as any);

    const resp = await fetch(`${serverUrl}/analyze`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Server error');
    }

    const json = await resp.json();
    return json;
};