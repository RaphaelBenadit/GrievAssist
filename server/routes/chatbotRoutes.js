const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Complaint = require("../models/Complaint");
const User = require("../models/User");

// Helper: Extract user from token (optional - for authenticated requests)
function getUserFromToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        return decoded;
    } catch {
        return null;
    }
}

// Available tools/functions the AI can use
const TOOLS = {
    check_complaint_status: {
        description: "Check the status of a specific complaint by its complaint ID (e.g., CMP-12345-6789)",
        parameters: ["complaintId"]
    },
    get_my_complaints: {
        description: "Get list of all complaints submitted by the current user",
        parameters: []
    },
    get_complaint_stats: {
        description: "Get overall statistics about complaints (total, pending, resolved, etc.)",
        parameters: []
    },
    search_complaints: {
        description: "Search complaints by keyword in description",
        parameters: ["keyword"]
    },
    get_categories: {
        description: "Get list of complaint categories and their counts",
        parameters: []
    }
};

// Execute a tool
async function executeTool(toolName, params, userId) {
    switch (toolName) {
        case "check_complaint_status": {
            const complaint = await Complaint.findOne({
                complaintId: { $regex: params.complaintId, $options: 'i' }
            }).select("complaintId status category priority description createdAt district");

            if (!complaint) {
                return { success: false, message: `No complaint found with ID: ${params.complaintId}` };
            }
            return {
                success: true,
                data: {
                    complaintId: complaint.complaintId,
                    status: complaint.status,
                    category: complaint.category,
                    priority: complaint.priority,
                    district: complaint.district,
                    submittedOn: complaint.createdAt?.toLocaleDateString(),
                    description: complaint.description?.substring(0, 100) + "..."
                }
            };
        }

        case "get_my_complaints": {
            if (!userId) {
                return { success: false, message: "You need to be logged in to view your complaints. Please login first." };
            }

            const complaints = await Complaint.find({ user: userId })
                .select("complaintId status category priority description createdAt")
                .sort({ createdAt: -1 })
                .limit(10);

            if (complaints.length === 0) {
                return { success: true, message: "You haven't submitted any complaints yet." };
            }

            return {
                success: true,
                data: complaints.map(c => ({
                    id: c.complaintId,
                    status: c.status,
                    category: c.category,
                    priority: c.priority,
                    date: c.createdAt?.toLocaleDateString(),
                    preview: c.description?.substring(0, 50) + "..."
                }))
            };
        }

        case "get_complaint_stats": {
            const total = await Complaint.countDocuments();
            const pending = await Complaint.countDocuments({ status: "pending" });
            const inProgress = await Complaint.countDocuments({ status: "in progress" });
            const resolved = await Complaint.countDocuments({ status: "resolved" });

            const categories = await Complaint.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            return {
                success: true,
                data: {
                    total,
                    pending,
                    inProgress,
                    resolved,
                    topCategories: categories.map(c => `${c._id}: ${c.count}`)
                }
            };
        }

        case "search_complaints": {
            const complaints = await Complaint.find({
                description: { $regex: params.keyword, $options: 'i' }
            })
                .select("complaintId status category description createdAt")
                .limit(5);

            if (complaints.length === 0) {
                return { success: true, message: `No complaints found matching "${params.keyword}"` };
            }

            return {
                success: true,
                data: complaints.map(c => ({
                    id: c.complaintId,
                    status: c.status,
                    category: c.category,
                    preview: c.description?.substring(0, 60) + "..."
                }))
            };
        }

        case "get_categories": {
            const categories = await Complaint.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);

            return {
                success: true,
                data: categories.map(c => ({ category: c._id, count: c.count }))
            };
        }

        default:
            return { success: false, message: "Unknown tool" };
    }
}

// Parse AI response to detect tool calls
function parseToolCall(text) {
    // Check for complaint ID patterns
    const complaintIdMatch = text.match(/CMP-\d{5}-\d{4}/i) || text.match(/complaint\s*(?:id|#|number)?[:\s]*([A-Z]{3}-\d+-\d+)/i);
    if (complaintIdMatch) {
        return { tool: "check_complaint_status", params: { complaintId: complaintIdMatch[0] } };
    }

    // Check for intent patterns
    const lowerText = text.toLowerCase();

    if (lowerText.includes("my complaint") || lowerText.includes("my complaints") || lowerText.includes("complaints i submitted")) {
        return { tool: "get_my_complaints", params: {} };
    }

    if (lowerText.includes("statistic") || lowerText.includes("how many") || lowerText.includes("total complaint")) {
        return { tool: "get_complaint_stats", params: {} };
    }

    if (lowerText.includes("categories") || lowerText.includes("types of complaint")) {
        return { tool: "get_categories", params: {} };
    }

    // Search by keyword
    const searchMatch = lowerText.match(/search\s+(?:for\s+)?["']?([^"']+?)["']?\s*(?:complaint)?$/i);
    if (searchMatch) {
        return { tool: "search_complaints", params: { keyword: searchMatch[1].trim() } };
    }

    return null;
}

// POST /api/chat/gemini - Main chat endpoint with agentic capabilities
router.post("/gemini", async (req, res) => {
    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    const user = getUserFromToken(req);

    if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key not configured." });
    }

    if (!message) {
        return res.status(400).json({ error: "Message is required." });
    }

    // Check if user is asking about a specific complaint or action
    const toolCall = parseToolCall(message);
    let contextData = "";

    if (toolCall) {
        console.log(`🔧 Executing tool: ${toolCall.tool}`, toolCall.params);
        const result = await executeTool(toolCall.tool, toolCall.params, user?._id || user?.id);

        if (result.success && result.data) {
            contextData = `\n\n[SYSTEM DATA - Use this to answer the user's question]:\n${JSON.stringify(result.data, null, 2)}`;
        } else if (result.message) {
            contextData = `\n\n[SYSTEM INFO]: ${result.message}`;
        }
    }

    // System prompt for the AI
    const systemPrompt = `You are GrievAssist Helper, an AI assistant for the GrievAssist complaint management platform. You ONLY answer questions related to GrievAssist and its features. For unrelated questions, politely redirect users to platform-related help.

## Your Role:
- Guide users step-by-step on how to use the platform
- Provide "click here → then do this" style navigation instructions
- Be friendly, concise, and helpful
- Use bullet points and numbered steps for clarity

## Platform Navigation Guide:

### To Submit a New Complaint:
1. Make sure you're logged in (click "Sign In" in the top right if not)
2. Click "Submit Complaint" button on your dashboard or go to the Complaint Form
3. Fill in your complaint description (be detailed about the issue)
4. Select your district and provide the address
5. Optionally upload an image as evidence
6. Optionally share your GPS location for accurate tracking
7. Click "Submit Complaint" - AI will auto-categorize it!

### To View Your Complaints:
1. Click "My Complaints" in the navigation menu
2. You'll see all your submitted complaints with their status
3. Each complaint shows: Category, Priority, Status (pending/in progress/resolved)
4. Click on any complaint to see full details

### To Check Complaint Status:
- Go to "My Complaints" page to see all your complaint statuses
- Or tell me your Complaint ID (format: CMP-XXXXX-XXXX) and I'll look it up

### Complaint Categories:
- **Roads**: Potholes, street damage, drainage issues
- **Garbage**: Waste collection, trash, cleanliness issues  
- **Utilities**: Water supply, electricity, power outages
- **Others**: Any other civic issues

### Account Actions:
- **Login**: Click "Sign In" → Enter email & password
- **Signup**: Click "Sign In" → Click "Create an account" → Fill details
- **Logout**: Click "Logout" button (this clears your chat history)

### Status Meanings:
- 🟡 **Pending**: Complaint received, awaiting review
- 🔵 **In Progress**: Being worked on by authorities
- 🟢 **Resolved**: Issue has been fixed

## Important Notes:
- You must be logged in to submit complaints or view your complaint history.
- If a user provides a Complaint ID (e.g., CMP-12345-6789), ALWAYS use the [SYSTEM DATA] to confirm details.
- If you don't have [SYSTEM DATA] but the user is asking about their complaints, tell them to check the "My Complaints" page.
- For technical issues, advise users to contact support at support@grievassist.com.
- ALWAYS maintain a professional, empathetic, and civic-minded tone.`;

    // Models to try (ordered by preference)
    const modelsToTry = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro"
    ];

    for (const model of modelsToTry) {
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            console.log(`🤖 Trying model: ${model}`);

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${systemPrompt}${contextData}\n\nUser: ${message}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024
                    }
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                const reply = data.candidates[0].content.parts[0].text;
                console.log(`✅ Success with model: ${model}`);
                return res.json({
                    reply,
                    model,
                    toolUsed: toolCall?.tool || null
                });
            }

            // Handle specific errors and continue to next model
            const errorCode = data.error?.code || response.status;
            const errorMessage = data.error?.message || "Unknown error";

            if (errorCode === 429) {
                console.warn(`⚠️ Model ${model} quota exceeded. Trying next...`);
            } else if (errorCode === 404) {
                console.warn(`⚠️ Model ${model} not found/available. Trying next...`);
            } else {
                console.error(`❌ Error with ${model} (Status ${errorCode}):`, errorMessage);
            }

            // Continue to next model in the loop
            continue;

        } catch (err) {
            console.error(`🔥 Connection error with ${model}:`, err.message);
        }
    }

    return res.json({
        reply: "I'm currently experiencing a high volume of requests and my AI core is temporarily unavailable. Please try again in a few moments, or check your dashboard manually for updates on your complaints.",
        error: "All Gemini models unavailable",
        isSystemMessage: true
    });
});

// GET /api/chat/test - Test endpoint
router.get("/test", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ status: "error", message: "API key not configured" });
    }

    try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ status: "error", message: data.error?.message });
        }

        const geminiModels = data.models
            ?.filter(m => m.name.includes("gemini") && m.supportedGenerationMethods?.includes("generateContent"))
            ?.map(m => m.name.replace("models/", ""))
            ?.slice(0, 10) || [];

        return res.json({
            status: "ok",
            message: "API key is valid",
            availableModels: geminiModels
        });
    } catch (err) {
        return res.status(500).json({ status: "error", message: err.message });
    }
});

module.exports = router;
