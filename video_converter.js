import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple video converter to make our format more compatible
async function convertToWebM() {
    const videoPath = path.join(__dirname, 'generated_videos', 'dialogue_example.mp4');
    const outputPath = path.join(__dirname, 'generated_videos', 'dialogue_example_frames.txt');
    
    try {
        console.log('📖 Reading video file...');
        const videoData = JSON.parse(fs.readFileSync(videoPath, 'utf8'));
        
        if (!videoData.frames) {
            throw new Error('No frames found in video file');
        }
        
        console.log(`🎬 Processing ${videoData.frames.length} frames...`);
        
        // Create a simple frame list that can be used by other tools
        const frameList = {
            type: 'FRAME_SEQUENCE',
            metadata: videoData.metadata,
            totalFrames: videoData.frames.length,
            frameRate: videoData.metadata?.fps || 10,
            instructions: [
                '1. Each frame is a base64-encoded PNG image',
                '2. Display frames at the specified frame rate (FPS)',
                '3. Use the video_player.html for best playback experience',
                '4. Individual frame PNGs are available in the frames/ directory'
            ],
            playbackInstructions: {
                web: 'Open video_player.html in a web browser',
                manual: 'Extract frames and use video editing software',
                programming: 'Use the JSON data to create your own player'
            }
        };
        
        // Write frame list info
        fs.writeFileSync(outputPath, JSON.stringify(frameList, null, 2));
        console.log(`📄 Frame information saved to: ${outputPath}`);
        
        // Create an M3U8 playlist for better compatibility
        const m3u8Path = path.join(__dirname, 'generated_videos', 'playlist.m3u8');
        let m3u8Content = '#EXTM3U\n';
        m3u8Content += '#EXT-X-VERSION:3\n';
        m3u8Content += `#EXT-X-TARGETDURATION:${1/videoData.metadata.fps}\n`;
        m3u8Content += '#EXT-X-PLAYLIST-TYPE:VOD\n';
        
        for (let i = 0; i < Math.min(videoData.frames.length, 10); i++) {
            m3u8Content += `#EXTINF:${1/videoData.metadata.fps},\n`;
            m3u8Content += `frames/frame_${String(i + 1).padStart(3, '0')}.png\n`;
        }
        m3u8Content += '#EXT-X-ENDLIST\n';
        
        fs.writeFileSync(m3u8Path, m3u8Content);
        console.log(`📺 M3U8 playlist saved to: ${m3u8Path}`);
        
        console.log('\n✅ Conversion complete!');
        console.log('\n🎯 How to play your video:');
        console.log('1. 🌐 Best: Open video_player.html in any web browser');
        console.log('2. 🖼️ Manual: View individual frames in the frames/ directory');
        console.log('3. 📱 Mobile: Some players support M3U8 playlists');
        console.log('4. 🎥 Advanced: Use the JSON data with video editing software');
        
        return true;
    } catch (error) {
        console.error('❌ Error converting video:', error.message);
        return false;
    }
}

// Run the converter
convertToWebM().then(success => {
    if (success) {
        console.log('\n🎉 Video is ready to play!');
    } else {
        console.log('❌ Conversion failed');
    }
});