import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ChatbotContext = createContext();

export const useChatbot = () => {
    const context = useContext(ChatbotContext);
    if (!context) {
        throw new Error('useChatbot must be used within a ChatbotProvider');
    }
    return context;
};

export const ChatbotProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load chat history from session storage (optional, clears on tab close)
    useEffect(() => {
        const savedMessages = sessionStorage.getItem('chatbot_history');
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    // Save messages to session storage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('chatbot_history', JSON.stringify(messages));
        }
    }, [messages]);

    const toggleChatbot = () => setIsOpen(prev => !prev);
    const closeChatbot = () => setIsOpen(false);

    const sendMessage = async (content) => {
        if (!content.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const response = await axios.post('/api/chat/gemini', { message: content }, config);

            const botMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: response.data.reply,
                toolUsed: response.data.toolUsed,
                model: response.data.model,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);

            const errorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                content: "Sorry, I encountered an error. Please try again later.",
                isError: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isOpen,
        messages,
        isLoading,
        toggleChatbot,
        closeChatbot,
        sendMessage,
        setMessages // Allow clearing history if needed
    };

    return (
        <ChatbotContext.Provider value={value}>
            {children}
        </ChatbotContext.Provider>
    );
};
