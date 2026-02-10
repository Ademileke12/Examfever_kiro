# Fireworks AI Setup Guide

## Fireworks AI Integration

Your ExamFever application is now configured to use Fireworks AI as the primary AI service for question generation.

### Current Configuration:
- **API Key**: `fw_UfSBeuVjWAwvZuAScarinP` (already configured)
- **Model**: `accounts/fireworks/models/qwen3-vl-235b-a22b-thinking`
- **Priority**: Primary AI service (Priority 1)

### Benefits of Fireworks AI:

- **High Performance**: Optimized inference infrastructure for fast responses
- **Advanced Models**: Access to state-of-the-art models like Qwen3-VL
- **Competitive Pricing**: Cost-effective API pricing
- **Reliable Infrastructure**: Enterprise-grade uptime and performance
- **Vision Capabilities**: The Qwen3-VL model supports multimodal understanding

### Model Features:

**Qwen3-VL-235B-A22B-Thinking**:
- **Multimodal**: Supports text and vision inputs
- **Large Context**: Handles extensive document processing
- **Reasoning**: Advanced thinking capabilities for complex questions
- **High Quality**: Generates contextually relevant and accurate questions

### System Architecture:

The system now uses this priority order:
1. **Fireworks AI Qwen3-VL** (Primary) - Your configured model
2. **Groq Models** (Fallback) - Existing Groq setup as backup
3. **Local Models** (Ollama) - Local processing option
4. **Mock Generation** - Always works as final fallback

### Testing Your Setup:

1. **Test API Connection**:
   - Visit `/api/ai/test` to verify Fireworks AI is working
   - Should show successful connection to your Qwen3-VL model

2. **Test Question Generation**:
   - Upload a PDF file through the upload interface
   - System will automatically use Fireworks AI for question generation
   - Check the console for "Using Fireworks AI" messages

### API Limits & Usage:

- **Rate Limits**: 60 requests per minute, 10,000 per day (generous limits)
- **Token Limits**: 8,192 tokens per request (suitable for most documents)
- **Fallback**: Automatic fallback to Groq if Fireworks AI is unavailable

### Troubleshooting:

- **API Key Issues**: Your key is already configured and should work immediately
- **Model Errors**: The system will automatically fall back to Groq models if needed
- **Testing**: Use `/api/ai/test` endpoint to verify your setup
- **Logs**: Check browser console for detailed AI processing information

### Cost Optimization:

- **Primary Service**: Fireworks AI for high-quality question generation
- **Fallback Services**: Free Groq tier provides backup coverage
- **Local Processing**: Ollama for offline development and testing
- **Smart Routing**: System automatically uses the best available model

### Advanced Features:

**Vision Capabilities**: The Qwen3-VL model can potentially process images and diagrams in PDFs for even better question generation (future enhancement).

**Thinking Mode**: The "thinking" variant provides enhanced reasoning for complex academic content.

**Multimodal Understanding**: Better comprehension of documents with mixed content types.

Your Fireworks AI integration is ready to use! The system will automatically use your Qwen3-VL model for generating high-quality exam questions from uploaded PDFs.