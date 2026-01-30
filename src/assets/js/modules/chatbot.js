// Chatbot Panel Module - Exact UI Match
const CHAT_STORAGE_KEY = "dr-recetas-chat-messages";
const CHAT_TIMESTAMP_KEY = "dr-recetas-chat-last-active";
const INACTIVITY_LIMIT = 30 * 60 * 1000;

const INITIAL_MESSAGE = {
    id: 1,
    type: "bot",
    text: "¡Hola! 👋 ¿En qué puedo ayudarte hoy?"
};

export const initChatbot = () => {
    const chatBody = document.getElementById("chat-body");
    const chatInput = document.getElementById("chat-input");
    const chatSend = document.getElementById("chat-send");
    
    if (!chatBody || !chatInput || !chatSend) return;

    let messages = [INITIAL_MESSAGE];
    let isLoading = false;

    const loadChat = () => {
        const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
        const lastActive = localStorage.getItem(CHAT_TIMESTAMP_KEY);
        if (savedMessages && lastActive) {
            const now = Date.now();
            if (now - parseInt(lastActive) < INACTIVITY_LIMIT) {
                try { messages = JSON.parse(savedMessages); } catch (e) {}
            }
        }
    };

    const saveChat = () => {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
    };

    const scrollToBottom = () => {
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    };

    const renderMessages = () => {
        chatBody.innerHTML = messages.map(msg => {
            const isBot = msg.type === "bot";
            const formattedText = msg.text
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/\n/g, "<br/>");

            return `
                <div class="flex items-start gap-3 ${!isBot ? 'justify-end' : 'justify-start'} animate-in w-full">
                    ${isBot ? `
                        <div class="w-8 h-8 rounded-full overflow-hidden bg-white border border-teal-50 shrink-0 mt-1 flex items-center justify-center shadow-sm">
                            <img src="assets/images/logo_bot.png" alt="ANA" class="w-full h-full object-cover">
                        </div>
                    ` : ''}
                    <div class="max-w-[85%] w-fit rounded-3xl px-5 py-4 text-[14px] transition-all leading-relaxed shadow-sm text-left ${
                        !isBot 
                        ? 'bg-[#0D4B4D] text-white rounded-br-none text-right' 
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none text-left'
                    }">
                        ${formattedText}
                    </div>
                </div>
            `;
        }).join("");

        if (isLoading) {
            const loadingHtml = `
                <div id="chat-loading" class="flex items-start gap-3 justify-start animate-in">
                    <div class="w-8 h-8 rounded-full overflow-hidden bg-white border border-teal-50 shrink-0 mt-1 flex items-center justify-center shadow-sm">
                        <img src="assets/images/logo_bot.png" alt="ANA" class="w-full h-full object-cover">
                    </div>
                    <div class="bg-white border border-slate-100 text-slate-400 rounded-3xl rounded-tl-none px-6 py-3 text-sm flex gap-1 shadow-sm">
                        <span class="animate-bounce">.</span>
                        <span class="animate-bounce" style="animation-delay: 0.2s">.</span>
                        <span class="animate-bounce" style="animation-delay: 0.4s">.</span>
                    </div>
                </div>
            `;
            chatBody.insertAdjacentHTML('beforeend', loadingHtml);
        }
        scrollToBottom();
    };

    const sendMessage = async (text) => {
        if (!text.trim() || isLoading) return;
        messages.push({ id: Date.now(), type: "user", text: text.trim() });
        isLoading = true;
        renderMessages();
        saveChat();

        try {
            const response = await fetch("https://doctorrecetas.com/v3/chat-api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text.trim() })
            });
            const data = await response.json();
            messages.push({
                id: Date.now() + 1,
                type: "bot",
                text: data.response || data.message || data.text || "Lo siento, tuve un problema al procesar tu mensaje."
            });
        } catch (error) {
            messages.push({
                id: Date.now() + 1,
                type: "bot",
                text: "Lo siento, no pude conectarme con el servidor. Inténtalo más tarde."
            });
        } finally {
            isLoading = false;
            renderMessages();
            saveChat();
        }
    };

    chatSend.onclick = () => {
        const text = chatInput.value;
        if (!text.trim()) return;
        chatInput.value = "";
        sendMessage(text);
    };

    chatInput.onkeypress = (e) => {
        if (e.key === "Enter") {
            const text = chatInput.value;
            if (!text.trim()) return;
            chatInput.value = "";
            sendMessage(text);
        }
    };

    loadChat();
    renderMessages();
};
