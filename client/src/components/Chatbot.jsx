import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChatbot } from '../context/ChatbotContext';

// SVG Icons
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

const SparkleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
);

const MinimizeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

const LoginIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

// Quick action buttons data
const getQuickActions = (isLoggedIn) => {
    const baseActions = [
        { id: 'how-to-use', label: 'How to use this app?', icon: '❓' },
        { id: 'features', label: 'What features are available?', icon: '✨' },
    ];

    if (isLoggedIn) {
        return [
            ...baseActions,
            { id: 'submit-complaint', label: 'How to submit a complaint?', icon: '📝' },
            { id: 'my-complaints', label: 'Show my complaints', icon: '📋' },
            { id: 'check-status', label: 'Check complaint status', icon: '🔍' },
            { id: 'categories', label: 'Complaint categories', icon: '📂' },
        ];
    }

    return [
        ...baseActions,
        { id: 'login-help', label: 'How to login/signup?', icon: '🔐' },
    ];
};

// Format message content with markdown-like syntax
const formatMessage = (content) => {
    if (!content) return '';

    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, '<li>$1</li>');

    // Convert bullet points
    formatted = formatted.replace(/^[-•]\s+(.*)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> elements in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="chatbot-list">$&</ul>');

    // Convert newlines to <br> (but not inside lists)
    formatted = formatted.replace(/\n(?!<)/g, '<br/>');

    return formatted;
};

function Chatbot() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isOpen, messages, isLoading, toggleChatbot, sendMessage, closeChatbot } = useChatbot();
    const [inputValue, setInputValue] = useState('');
    const [showQuickActions, setShowQuickActions] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem('token');
    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user'));
        } catch {
            return null;
        }
    })();

    // Chatbot is now available on all pages including admin

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    // Hide quick actions after first message
    useEffect(() => {
        if (messages.length > 0) {
            setShowQuickActions(false);
        }
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        sendMessage(inputValue);
        setInputValue('');
    };

    const handleQuickAction = (actionId) => {
        const actionMessages = {
            'how-to-use': 'How do I use this GrievAssist application?',
            'features': 'What features are available in this application?',
            'submit-complaint': 'How can I submit a new complaint?',
            'my-complaints': 'Show me my submitted complaints',
            'check-status': 'How can I check the status of my complaint?',
            'categories': 'What are the different complaint categories?',
            'login-help': 'How do I login or create an account?'
        };

        const message = actionMessages[actionId];
        if (message) {
            sendMessage(message);
            setShowQuickActions(false);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        closeChatbot();
    };



    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={toggleChatbot}
                className="chatbot-toggle-btn"
                aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
            >
                {isOpen ? <CloseIcon /> : <ChatIcon />}
            </button>

            {/* Chat Window */}
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <SparkleIcon />
                        </div>
                        <div className="chatbot-header-text">
                            <h3>GrievAssist Helper</h3>
                            <span className="chatbot-status">
                                <span className="status-dot"></span>
                                AI Powered Assistant
                            </span>
                        </div>
                    </div>
                    <button onClick={closeChatbot} className="chatbot-minimize-btn" aria-label="Minimize chat">
                        <MinimizeIcon />
                    </button>
                </div>

                {/* Messages Container */}
                <div className="chatbot-messages">
                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="chatbot-welcome">
                            <div className="welcome-icon">
                                <SparkleIcon />
                            </div>
                            <h4>Welcome{user?.name ? `, ${user.name}` : ''}! 👋</h4>
                            <p>
                                {isLoggedIn
                                    ? "I'm here to help you use GrievAssist. Ask me anything about submitting complaints, tracking status, or using the platform!"
                                    : "I'm your GrievAssist assistant. Please login to access all features like submitting and tracking complaints."}
                            </p>

                            {!isLoggedIn && (
                                <div className="chatbot-login-prompt">
                                    <button onClick={() => handleNavigate('/login')} className="chatbot-login-btn">
                                        <LoginIcon />
                                        <span>Login to Continue</span>
                                    </button>
                                    <p className="login-note">Or <button onClick={() => handleNavigate('/signup')} className="signup-link">create an account</button></p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quick Actions */}
                    {showQuickActions && messages.length === 0 && (
                        <div className="chatbot-quick-actions">
                            <p className="quick-actions-title">Quick Actions:</p>
                            <div className="quick-actions-grid">
                                {getQuickActions(isLoggedIn).map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action.id)}
                                        className="quick-action-btn"
                                    >
                                        <span className="quick-action-icon">{action.icon}</span>
                                        <span>{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chat Messages */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={`chatbot-message ${msg.type}`}>
                            {msg.type === 'bot' && (
                                <div className="message-avatar bot">
                                    <SparkleIcon />
                                </div>
                            )}
                            <div className={`message-bubble ${msg.type} ${msg.isError ? 'error' : ''}`}>
                                <div
                                    className="message-content"
                                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                                />
                                {msg.toolUsed && (
                                    <span className="message-tool-badge">
                                        🔧 Used: {msg.toolUsed.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>
                            {msg.type === 'user' && (
                                <div className="message-avatar user">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <div className="chatbot-message bot">
                            <div className="message-avatar bot">
                                <SparkleIcon />
                            </div>
                            <div className="message-bubble bot loading">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="chatbot-input-form">
                    <div className="chatbot-input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={isLoggedIn ? "Type your message..." : "Login to send messages..."}
                            disabled={isLoading}
                            className="chatbot-input"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="chatbot-send-btn"
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                    <p className="chatbot-disclaimer">
                        AI assistant for GrievAssist. Answers are related to this platform only.
                    </p>
                </form>
            </div>
        </>
    );
}

export default Chatbot;
