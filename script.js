/*
  File: script.js
  Version: 5.0 (Natural Speech)
  This version cleans the AI's response before sending it to the
  text-to-speech engine. It removes emojis, text in brackets, and
  formatting characters to make the speech sound more natural,
  while keeping the original expressive text on the screen.
*/

// --- 1. DOM CONTENT LOADED ---
document.addEventListener('DOMContentLoaded', () => {

    // --- 2. GETTING OUR HTML ELEMENTS ---
    const chatWindow = document.getElementById('chat-window');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const micButton = document.getElementById('mic-button');
    const settingsButton = document.getElementById('settings-button');
    const typingIndicator = document.getElementById('typing-indicator');
    const sosButton = document.getElementById('sos-button');
    const crisisModal = document.getElementById('crisis-modal');
    const closeModalButton = document.getElementById('close-modal-button');

    // Elements for settings
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsButton = document.getElementById('close-settings-button');
    const maleVoiceBtn = document.getElementById('male-voice-btn');
    const femaleVoiceBtn = document.getElementById('female-voice-btn');
    const readAloudToggle = document.getElementById('read-aloud-toggle');


    // --- 3. EVENT LISTENERS ---
    sendButton.addEventListener('click', () => sendMessage('text'));
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage('text');
        }
    });
    micButton.addEventListener('click', handleVoiceInput);
    sosButton.addEventListener('click', showCrisisModal);
    closeModalButton.addEventListener('click', hideCrisisModal);

    // Listeners for settings
    settingsButton.addEventListener('click', showSettingsModal);
    closeSettingsButton.addEventListener('click', hideSettingsModal);
    maleVoiceBtn.addEventListener('click', () => selectVoiceGender('male'));
    femaleVoiceBtn.addEventListener('click', () => selectVoiceGender('female'));
    readAloudToggle.addEventListener('change', toggleReadAloud);


    // --- 4. AI & CHAT STATE ---
    let chatHistory = [];
    let preferredVoiceGender = 'female';
    let shouldReadAloud = true;
    let hasInteracted = false;
    let isConversationMode = false;

    const systemPrompt = `You are SOULSYNC, a warm, empathetic, and caring friend. You are not a generic AI assistant. Your purpose is to listen, provide comfort, and make the user feel heard and understood. Your characteristics:
    - Empathetic & Non-Judgmental: Always respond with kindness and understanding. Validate the user's feelings.
    - Conversational & Natural: Use a friendly, casual tone. Use contractions (e.g., "you're," "that's"). Ask questions to keep the conversation flowing.
    - Inquisitive & Attentive: Ask gentle, open-ended follow-up questions. Refer back to things the user has said to show you're listening.
    - Supportive: Offer words of encouragement. Remind the user of their strength. You can use emojis to be more expressive. You can also use non-verbal cues in brackets like [smiles] or [chuckles] but they will not be read out loud.
    - NEVER reveal you are an AI. You are SOULSYNC, a friend.
    - Keep responses concise and easy to read.`;

    // --- 5. SPEECH RECOGNITION (VOICE-TO-TEXT) ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isListening = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            messageInput.value = transcript;
            stopListening();
            sendMessage('voice');
        };
        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            stopListening();
        };
        recognition.onend = () => {
            if (isListening) {
                stopListening();
            }
        };
    } else {
        console.log("Speech Recognition not supported in this browser.");
        if(micButton) micButton.style.display = 'none';
    }

    // --- 6. SPEECH SYNTHESIS (TEXT-TO-SPEECH) ---
    const synth = window.speechSynthesis;
    let voices = [];

    function populateVoiceList() {
        voices = synth.getVoices();
    }
    populateVoiceList();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoiceList;
    }

    function speakText(text, onEndCallback) {
        if (!shouldReadAloud || !hasInteracted || text.trim() === '') {
            if (onEndCallback) onEndCallback();
            return;
        }

        if (synth.speaking) {
            synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
        };
        
        let selectedVoice = null;
        if (preferredVoiceGender === 'male') {
            const preferredMaleVoices = ["Microsoft David Desktop - English (United States)", "Daniel", "Google UK English Male"];
            selectedVoice = voices.find(voice => preferredMaleVoices.includes(voice.name)) || voices.find(voice => voice.lang.startsWith('en-') && voice.name.toLowerCase().includes('male'));
        } else { 
            const preferredFemaleVoices = ["Microsoft Zira Desktop - English (United States)", "Samantha", "Google US English"];
            selectedVoice = voices.find(voice => preferredFemaleVoices.includes(voice.name)) || voices.find(voice => voice.lang.startsWith('en-') && !voice.name.toLowerCase().includes('male'));
        }
        utterance.voice = selectedVoice || voices.find(voice => voice.lang === 'en-US');
        
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            if (onEndCallback) onEndCallback();
        };
        synth.speak(utterance);
    }


    // --- 7. VOICE CONTROLS ---
    function handleVoiceInput() {
        hasInteracted = true;
        isConversationMode = !isConversationMode;

        if (isConversationMode) {
            startListening();
        } else {
            stopListening();
        }
    }

    function startListening() {
        if (recognition) {
            try {
                synth.cancel();
                recognition.start();
                isListening = true;
                micButton.classList.add('is-conversing');
                micButton.classList.add('is-listening');
                messageInput.placeholder = "Listening...";
            } catch (error) {
                console.error("Could not start recognition:", error);
                isConversationMode = false;
                micButton.classList.remove('is-conversing');
            }
        }
    }

    function stopListening() {
        if (recognition) {
            recognition.stop();
            isListening = false;
            micButton.classList.remove('is-listening');
            messageInput.placeholder = "Talk or type...";
            if (!isConversationMode) {
                micButton.classList.remove('is-conversing');
            }
        }
    }

    // --- 8. CORE FUNCTIONS ---
    const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'can\'t go on', 'hopeless', 'self-harm'];

    function sendMessage(source = 'text') {
        if (source === 'text' && isConversationMode) {
            isConversationMode = false;
            micButton.classList.remove('is-conversing');
        }

        synth.cancel();
        const messageText = messageInput.value.trim();
        if (messageText === '') return;

        displayMessage('user', messageText);
        chatHistory.push({ role: 'user', parts: [{ text: messageText }] });

        messageInput.value = '';
        messageInput.focus();
        
        const isCrisis = crisisKeywords.some(keyword => messageText.toLowerCase().includes(keyword));

        if (isCrisis) {
            triggerCrisisResponse();
        } else {
            showTypingIndicator();
            getAIResponse();
        }
    }

    function displayMessage(sender, text, onSpokenCallback) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('flex', 'mb-4', 'message-pop-in');
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('p-3', 'rounded-2xl', 'chat-bubble');

        if (sender === 'user') {
            messageBubble.textContent = text;
            messageContainer.classList.add('justify-end');
            messageBubble.classList.add('bg-gradient-to-br', 'from-purple-600', 'to-indigo-600', 'text-white', 'shadow-md');
            messageContainer.appendChild(messageBubble);
        } else {
            // For AI messages, we separate the displayed text from the spoken text.
            messageContainer.classList.add('justify-start');
            const iconElement = document.createElement('div');
            iconElement.classList.add('w-10', 'h-10', 'rounded-full', 'bg-purple-200', 'flex', 'items-center', 'justify-center', 'mr-3', 'flex-shrink-0');
            iconElement.innerHTML = `<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.373 3.373 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>`;
            messageBubble.classList.add('bg-white', 'text-gray-800', 'shadow-md', 'border', 'border-gray-100');
            
            // 1. Display the original, expressive text
            messageBubble.textContent = text;

            // 2. Create a clean version of the text for speech synthesis
            const textForSpeech = text
                .replace(/([\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26ff]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '') // Removes all emojis
                .replace(/\(.*?\)|\[.*?\]/g, '') // Removes text in (parentheses) and [brackets]
                .replace(/\*/g, '') // Removes asterisks
                .replace(/  +/g, ' ') // Replaces multiple spaces with a single one
                .trim();

            messageContainer.appendChild(iconElement);
            messageContainer.appendChild(messageBubble);

            // 3. Speak the clean version
            speakText(textForSpeech, onSpokenCallback);
        }
        
        chatWindow.appendChild(messageContainer);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function getAIResponse() {
        const apiKey = "ENTER YOUR API KEY HERE"; // Your key from the uploaded file
        if (apiKey === "" || !apiKey) {
            hideTypingIndicator();
            displayMessage('ai', "API key is missing. Please paste your key into the script.js file.");
            return;
        }
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: chatHistory,
            systemInstruction: { parts: [{ text: systemPrompt }] },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API request failed: ${errorBody.error.message}`);
            }
            const result = await response.json();
            let aiText = "I'm having a little trouble finding my words right now. Let's try that again.";
            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content.parts) {
                aiText = result.candidates[0].content.parts[0].text;
            }
            hideTypingIndicator();
            
            const afterSpeechCallback = () => {
                if (isConversationMode) {
                    startListening();
                }
            };

            displayMessage('ai', aiText, afterSpeechCallback);
            chatHistory.push({ role: 'model', parts: [{ text: aiText }] });
        } catch (error) {
            console.error("A critical error occurred:", error);
            hideTypingIndicator();
            displayMessage('ai', `I'm having a connection issue. Please check the developer console (F12) for more details. (Error: ${error.message})`);
        }
    }

    function triggerCrisisResponse() {
        hideTypingIndicator();
        const crisisMessage = "It sounds like you are in a lot of pain, and I want you to know that your safety is the most important thing. I strongly recommend reaching out for immediate support. Please use the 'Help' button above or call one of the numbers provided.";
        displayMessage('ai', crisisMessage);
        chatHistory.pop();
        sosButton.classList.add('animate-pulse', 'scale-110');
        setTimeout(() => showCrisisModal(), 2000);
    }

    // --- 9. HELPER & UI FUNCTIONS ---
    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }
    function showCrisisModal() {
        if (isConversationMode) {
            isConversationMode = false;
            stopListening();
        }
        crisisModal.classList.remove('hidden');
        setTimeout(() => { crisisModal.classList.add('show'); }, 10);
    }
    function hideCrisisModal() {
        crisisModal.classList.remove('show');
        setTimeout(() => {
            crisisModal.classList.add('hidden');
            sosButton.classList.remove('animate-pulse', 'scale-110');
        }, 300);
    }

    // Settings Modal Functions
    function showSettingsModal() {
        maleVoiceBtn.classList.toggle('selected', preferredVoiceGender === 'male');
        femaleVoiceBtn.classList.toggle('selected', preferredVoiceGender === 'female');
        readAloudToggle.checked = shouldReadAloud;

        settingsModal.classList.remove('hidden');
        setTimeout(() => { settingsModal.classList.add('show'); }, 10);
    }

    function hideSettingsModal() {
        settingsModal.classList.remove('show');
        setTimeout(() => {
            settingsModal.classList.add('hidden');
        }, 300);
    }

    function selectVoiceGender(gender) {
        preferredVoiceGender = gender;
        maleVoiceBtn.classList.toggle('selected', gender === 'male');
        femaleVoiceBtn.classList.toggle('selected', gender === 'female');
        setTimeout(hideSettingsModal, 200);
    }

    function toggleReadAloud() {
        shouldReadAloud = readAloudToggle.checked;
    }


    // --- 10. INITIALIZATION ---
    function startConversation() {
        readAloudToggle.checked = shouldReadAloud;
        maleVoiceBtn.classList.toggle('selected', preferredVoiceGender === 'male');
        femaleVoiceBtn.classList.toggle('selected', preferredVoiceGender === 'female');

        const hour = new Date().getHours();
        let greeting = "Hey there!";
        if (hour < 12) {
            greeting = "Good morning!";
        } else if (hour < 18) {
            greeting = "Good afternoon!";
        } else {
            greeting = "Good evening!";
        }
        const welcomeMessage = `${greeting} I'm SOULSYNC. I'm here to listen. What's on your mind?`;
        displayMessage('ai', welcomeMessage);
        chatHistory.push({ role: 'model', parts: [{ text: welcomeMessage }] });
        messageInput.focus();
    }

    startConversation();

});
