
import React, { useRef, useEffect } from 'react';

// Tell TypeScript about the global mermaid library from index.html
declare const mermaid: any;

interface MermaidRendererProps {
    content: string;
    id: string;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({ content, id }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const render = async () => {
            if (content && containerRef.current) {
                try {
                    // Ensure the container is clear before rendering
                    containerRef.current.innerHTML = ''; 
                    const { svg } = await mermaid.render(id, content);
                    containerRef.current.innerHTML = svg;
                } catch (e) {
                    // Provide detailed error feedback directly in the component if rendering fails
                    containerRef.current.innerHTML = `<pre class="text-red-400 text-sm whitespace-pre-wrap font-mono">Mermaid Error: Invalid syntax.</pre><pre class="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed mt-2">${content}</pre>`;
                }
            }
        };
        render();
    }, [content, id]); // Re-render only when content or the unique ID changes

    return <div ref={containerRef} className="mermaid-container w-full h-full flex justify-center items-center" />;
};
