const messages = document.getElementById("messages");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");

let _config = {
    openAI_api: "https://alcuino-chatbot.azurewebsites.net/api/OpenAIProxy",
    openAI_model: "gpt-4o-mini",
    ai_instruction: 'You are a helpful AI assistant for La Casa de las Flores, a local flower shop offering same-day delivery in Cebu City. Answer customer questions in a friendly, conversational tone (2-4 sentences). You can help with topics like: same-day delivery, delivery fees and coverage area, custom bouquets, care instructions, payment methods, personal notes, refunds and cancellations, event and bulk orders, corporate services, allergies or fragrance-free options, order tracking, and store hours. Keep responses natural and helpful. When formatting is needed, use simple HTML tags like <p>, <strong>, <ul>, <li>. No markdown.',
    response_id: ""
};


addBotMessage("Hi! I'm Flora, How can I help you!")
async function sendopenAIRequest(text) {
    let requestBody = {
        model: _config.openAI_model,
        input: text,
        instructions: _config.ai_instruction
    };

    // Add response_id if this is not the first message
    if (_config.response_id.length > 0) {
        requestBody.previous_response_id = _config.response_id;
    }

    try {
        const response = await fetch(_config.openAI_api, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${_config.openAI_apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);

        let output = data.output[0].content[0].text;
        _config.response_id = data.id;

        return output;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw error;
    }
}

function addUserMessage(text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "user-message";
    messageDiv.textContent = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function addBotMessage(html) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "bot-message";
    messageDiv.innerHTML = html;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

function addLoadingMessage() {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "bot-message loading-message";
    loadingDiv.id = "loading-message";
    loadingDiv.innerHTML = `
        <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    messages.appendChild(loadingDiv);
    messages.scrollTop = messages.scrollHeight;
}

function removeLoadingMessage() {
    const loadingMsg = document.getElementById("loading-message");
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

async function handleSend() {
    const userText = input.value.trim();
    if (!userText) return;

    addUserMessage(userText);
    addLoadingMessage();

    input.value = "";
    sendBtn.disabled = true;

    try {
        const botResponse = await sendopenAIRequest(userText);
        removeLoadingMessage();
        addBotMessage(botResponse);
    } catch (error) {
        addBotMessage("Sorry, there was an error processing your request.");
        removeLoadingMessage();
    } finally {
        sendBtn.disabled = false;
        input.focus();
    }
}

sendBtn.addEventListener("click", handleSend);

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSend();
    }
});