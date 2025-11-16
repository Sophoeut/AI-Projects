
import http from 'http';
import { URL } from 'url';
import { generateRealMP4Video, generateImage, generateYoutubeContent, generateWebsiteContent } from './AIvideos.js';

const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    
    if (reqUrl.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AI Content Generator</title>
                <style>
                    :root {
                        --primary-color: #007bff;
                        --primary-hover: #0056b3;
                        --background-color: #f4f7f9;
                        --container-bg: #ffffff;
                        --text-color: #333;
                        --border-color: #dee2e6;
                        --shadow: 0 6px 15px rgba(0,0,0,0.1);
                    }
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                        display: flex; 
                        justify-content: center; 
                        align-items: flex-start; 
                        min-height: 100vh; 
                        margin: 0;
                        padding: 2rem 1rem;
                        background-color: var(--background-color);
                        font-size: 1.1rem;
                    }
                    .container {
                        background: var(--container-bg);
                        padding: 2.5rem;
                        border-radius: 12px;
                        box-shadow: var(--shadow);
                        width: 95%;
                        max-width: 800px;
                        text-align: center;
                    }
                    h1 {
                        color: var(--text-color);
                        margin-bottom: 1.5rem;
                    }
                    .options {
                        display: flex;
                        justify-content: center;
                        gap: 1rem;
                        margin-bottom: 1.5rem;
                        flex-wrap: wrap;
                    }
                    .options label {
                        display: flex;
                        align-items: center;
                        cursor: pointer;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        background: #e9ecef;
                        transition: background-color 0.3s;
                    }
                    .options input[type="radio"] {
                        display: none;
                    }
                    .options input[type="radio"]:checked + span {
                        color: var(--container-bg);
                    }
                    .options input[type="radio"]:checked + span {
                        background-color: var(--primary-color);
                        border-radius: 20px;
                        padding: 0.5rem 1rem;
                        margin: -0.5rem -1rem;
                    }
                    textarea {
                        width: 100%;
                        height: 120px;
                        margin-bottom: 1.5rem;
                        padding: 0.75rem;
                        border-radius: 8px;
                        border: 1px solid var(--border-color);
                        font-size: 1.1rem;
                        box-sizing: border-box;
                        resize: vertical;
                    }
                    button#generateBtn {
                        width: 100%;
                        padding: 1rem;
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: white;
                        background-color: var(--primary-color);
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: background-color 0.3s;
                    }
                    button:disabled {
                        background-color: #ccc;
                        cursor: not-allowed;
                    }
                    button:hover:not(:disabled) {
                        background-color: var(--primary-hover);
                    }
                    #status { 
                        margin-top: 2rem; 
                        text-align: left;
                        display: none; /* Hidden by default */
                    }
                    .content-section {
                        background-color: #f8f9fa;
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        padding: 1.5rem;
                        margin-bottom: 1rem;
                        position: relative;
                    }
                    .content-section h3 {
                        margin-top: 0;
                        color: #495057;
                    }
                    .content-section p {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                        color: var(--text-color);
                    }
                    .copy-btn {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        background: #6c757d;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        padding: 0.3rem 0.7rem;
                        cursor: pointer;
                        font-size: 0.9rem;
                    }
                    .copy-btn:hover {
                        background: #5a6268;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>AI Content Generator</h1>
                    <div class="options">
                        <label><input type="radio" name="contentType" value="video" checked><span>Video</span></label>
                        <label><input type="radio" name="contentType" value="image"><span>Image</span></label>
                        <label><input type="radio" name="contentType" value="youtube"><span>YouTube</span></label>
                        <label><input type="radio" name="contentType" value="website"><span>Website</span></label>
                    </div>
                    <textarea id="promptInput" placeholder="Enter a prompt for your content..."></textarea>
                    <button id="generateBtn">Generate</button>
                    <div id="status"></div>
                </div>
                <script>
                    const generateBtn = document.getElementById('generateBtn');
                    const statusDiv = document.getElementById('status');
                    const promptInput = document.getElementById('promptInput');

                    document.querySelectorAll('.options input').forEach(radio => {
                        radio.addEventListener('change', (e) => {
                            document.querySelectorAll('.options label span').forEach(span => {
                                span.style.backgroundColor = '';
                                span.style.color = '';
                                span.style.padding = '';
                                span.style.margin = '';
                            });
                            const span = e.target.nextElementSibling;
                            span.style.backgroundColor = 'var(--primary-color)';
                            span.style.color = 'white';
                            span.style.borderRadius = '20px';
                            span.style.padding = '0.5rem 1rem';
                            span.style.margin = '-0.5rem -1rem';
                        });
                    });

                    generateBtn.addEventListener('click', async () => {
                        const prompt = promptInput.value;
                        const contentType = document.querySelector('input[name="contentType"]:checked').value;

                        if (!prompt) {
                            statusDiv.style.display = 'block';
                            statusDiv.innerHTML = '<p>Please enter a prompt before generating.</p>';
                            return;
                        }

                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = '<p>Generating content... please wait.</p>';
                        generateBtn.disabled = true;

                        try {
                            const response = await fetch('/generate-content', { 
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ prompt, type: contentType })
                            });
                            const result = await response.json();
                            statusDiv.innerHTML = ''; // Clear status
                            if (response.ok) {
                                if (result.filePath) {
                                    statusDiv.innerHTML = \`<div class="content-section"><h3>Success</h3><p>Content generated successfully!\\n\\nPath: \${result.filePath}</p></div>\`;
                                } else if (result.content) {
                                    let contentHtml = '<h2>Generated Content</h2>';
                                    for (const [key, value] of Object.entries(result.content)) {
                                        const title = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' \$1').trim();
                                        contentHtml += \`
                                            <div class="content-section">
                                                <button class="copy-btn" onclick="copyToClipboard('\${key}')">Copy</button>
                                                <h3>\${title}</h3>
                                                <p id="\${key}">\${value}</p>
                                            </div>
                                        \`;
                                    }
                                    statusDiv.innerHTML = contentHtml;
                                }
                            } else {
                                statusDiv.innerHTML = \`<p>Error: \${result.message}</p>\`;
                            }
                        } catch (error) {
                            statusDiv.innerHTML = '<p>An error occurred while communicating with the server.</p>';
                        } finally {
                            generateBtn.disabled = false;
                        }
                    });

                    function copyToClipboard(elementId) {
                        const text = document.getElementById(elementId).innerText;
                        navigator.clipboard.writeText(text).then(() => {
                            alert('Copied to clipboard!');
                        }).catch(err => {
                            alert('Failed to copy!');
                        });
                    }
                </script>
            </body>
            </html>
        `);
    } else if (reqUrl.pathname === '/generate-content' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { prompt, type } = JSON.parse(body);
                if (!prompt || !type) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Prompt and content type are required.' }));
                }
                
                let result;
                switch (type) {
                    case 'video':
                        const videoPath = await generateRealMP4Video(prompt);
                        result = { filePath: videoPath };
                        break;
                    case 'image':
                        const imagePath = await generateImage(prompt);
                        result = { filePath: imagePath };
                        break;
                    case 'youtube':
                        const youtubeContent = await generateYoutubeContent(prompt);
                        result = { content: youtubeContent };
                        break;
                    case 'website':
                        const websiteContent = await generateWebsiteContent(prompt);
                        result = { content: websiteContent };
                        break;
                    default:
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ message: 'Invalid content type.' }));
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                console.error('Error generating content:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Failed to generate content.' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('Server running at http://localhost:3000/');
    console.log('Open your browser and navigate to the address above.');
    console.log('Click the "Generate Video" button to start the process.');
});
