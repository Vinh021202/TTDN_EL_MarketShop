import { GoogleGenerativeAI } from '@google/generative-ai';

const key = 'AIzaSyCf2znJbqJljLAcKMLNzSDP3ufH_rMBoUc';
const genAI = new GoogleGenerativeAI(key);

try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const r = await model.generateContent('Hello');
    console.log('Response:', r.response.text());
} catch (e: any) {
    // Print full error
    console.log('Full error:', JSON.stringify(e, null, 2));
    console.log('Message:', e.message);
}
