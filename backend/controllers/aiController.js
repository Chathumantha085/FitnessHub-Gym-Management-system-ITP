const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @desc    Get AI Diet/Nutrition Advice
// @route   POST /api/ai/chat
// @access  Private
exports.getDietAdvice = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const systemPrompt = `
      You are "ITP Fitness AI", a professional nutritionist and fitness coach for ITP Fitness Hub.
      Your goal is to provide accurate, encouraging, and science-based diet and nutrition advice to gym members.
      
      Guidelines:
      1. Keep responses concise and actionable.
      2. If asked about dangerous diets or supplements, provide a warning to consult a doctor.
      3. Use a professional yet motivating tone.
      4. If the user mentions their name (${req.user.name}), use it to personalize the response.
      5. You can suggest meal plans, calorie targets, and hydration tips.
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // or 'gpt-3.5-turbo' depending on availability
      messages: messages,
      max_tokens: 500,
    });

    const aiMessage = response.choices[0].message.content;

    res.status(200).json({
      success: true,
      data: aiMessage,
    });
  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI Service is currently unavailable. Please try again later.' 
    });
  }
};
