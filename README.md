# Visual Intelligence Suite: Advanced Video Analysis Toolkit

## 1. Project Overview
The **Visual Intelligence Suite** is a powerful, modular toolkit designed to extract deep insights from video content. Developed for a high-stakes hackathon, this project demonstrates a multi-faceted approach to video analysis, implementing three distinct, high-impact features. While currently presented as standalone modules, the architecture is designed for future integration into a sophisticated, conversational AI agent.

This toolkit serves as a robust foundation for applications in traffic monitoring, security surveillance, and content moderation by providing detailed, actionable data from video streams.

## 2. Implemented Features (Drive link - 
This project successfully implements three core video analysis features, each leveraging state-of-the-art AI models and technologies.

### Feature 1: General Video Analysis & Conversational Summarization
- **Core Functionality**: Upload a video and receive a comprehensive summary of its contents, including key events, scenes, and actions.
- **Conversational Interaction**: Multi-turn chat support, allowing users to ask follow-up questions about the video content.
- **Intelligent Clip Extraction**: Identify and extract important clips with timestamps for quick review.
- **Technology**: Powered by a state-of-the-art multimodal model capable of processing and reasoning about video content.

### Feature 2: In-Video Text Transcription and Querying
- **Core Functionality**: Use Google Cloud Vision Intelligence API to perform OCR on video frames, transcribing all visible text.
- **Queryable Knowledge Base**: Index the transcribed text and query it via a Large Language Model (LLM) (e.g., "What were the license plates of the vehicles involved?").
- **Applications**: Forensic analysis, traffic monitoring (license plate capture), and media content analysis.

### Feature 3: High-Precision Object Tracking
- **Dual-Technology Approach**:
  - **Google Cloud Vision Intelligence API**: Baseline object tracking.
  - **YOLO (You Only Look Once)**: High-speed, self-hosted object detection for superior accuracy.
- **Superior Performance with YOLO**: Demonstrates improved tracking accuracy and granularity, capable of following multiple objects in complex scenes.
- **Use Cases**: Security, traffic flow analysis, and retail analytics.

## 3. Technology Stack
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) for high performance, async support, and automatic documentation.
- **AI & ML**:
  - **Multimodal LLM**: For video analysis and conversational summarization.
  - **Google Cloud Vision Intelligence API**: OCR and baseline object tracking.
  - **YOLO**: Self-hosted, high-precision object detection.
  - **LangChain**: Orchestration of AI components.
- **Frontend**: React (JSX) for a responsive, interactive user interface.

## 4. Current Status & Future Work
- **Current Status**: All three core features are implemented as individual modules. The backend exposes API endpoints, and the React frontend provides an interface for interaction.

### Future Work: Agentic Integration
- **Intelligent Request Routing**: Analyze user prompts to select the appropriate analysis tool automatically.
- **Synthesis of Results**: Chain tools for complex queries (e.g., track a vehicle then read its license plate).
- **Proactive Analysis**: Automatically generate summaries on upload and suggest follow-up questions.

The modular architecture ensures that integrating these modules into a unified AI agent is a straightforward engineering task.

## 5. Demo Recordings
Video recordings showcasing the implemented features can be found here:

[Feature Demo Videos](https://drive.google.com/drive/folders/10EwTWD9zNYIvYwJ2SKaKBmSWcFb0RWWi?usp=drive_link)


