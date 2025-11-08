// Add this before the component to tell TypeScript about the global library from index.html
declare const pdfjsLib: any;

// Fix: Update type to reflect that PDFs are processed and returned as 'text'.
type FileReadResult = {
    data: string; // base64 encoded for media, raw text for text/pdf
    mimeType: string;
    type: 'image' | 'video' | 'audio' | 'text';
};

export const readFileContent = async (file: File): Promise<FileReadResult> => {
    return new Promise((resolve, reject) => {
        const mimeType = file.type;
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        
        const fileType = mimeType.startsWith('image/') ? 'image' :
                         mimeType.startsWith('video/') ? 'video' :
                         mimeType.startsWith('audio/') ? 'audio' :
                         ['txt', 'md'].includes(extension) ? 'text' :
                         extension === 'pdf' ? 'pdf' : null;

        if (!fileType) {
            return reject(`Unsupported file type: .${extension}. Please upload a supported file.`);
        }

        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const result = event.target?.result;
                if (!result) return reject('Failed to read file: empty result.');

                if (fileType === 'text') {
                    resolve({ data: result as string, mimeType, type: 'text' });
                } else if (fileType === 'pdf') {
                     const typedArray = new Uint8Array(result as ArrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let textContent = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        textContent += content.items.map((item: any) => item.str).join(' ');
                        textContent += '\n\n';
                    }
                    resolve({ data: textContent, mimeType: 'text/plain', type: 'text' });
                } else { // image, video, audio
                    const base64String = (result as string).split(',')[1];
                    resolve({ data: base64String, mimeType, type: fileType });
                }
            } catch (error) {
                 reject(`Failed to parse ${fileType} file. ${error instanceof Error ? error.message : ''}`);
            }
        };

        reader.onerror = () => reject('Failed to read file.');
        
        if (fileType === 'text') {
            reader.readAsText(file);
        } else if (fileType === 'pdf') {
            reader.readAsArrayBuffer(file);
        } else { // image, video, audio
            reader.readAsDataURL(file);
        }
    });
};