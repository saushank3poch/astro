# AI Agent Architecture - Astro Prediction Platform

**Last Updated**: 2025-12-19
**Status**: Design Document
**Version**: 1.0

---

## Executive Summary

The Astro platform uses a multi-agent AI system to generate astrological predictions for financial markets. Each specialized agent combines domain knowledge (astrology, divination, market analysis) with large language models (Claude 3.5 Sonnet, GPT-4) to produce entertaining yet insightful predictions.

**Core Principles**:
1. **Specialization**: Each agent handles one prediction type
2. **Composability**: Agents can consult each other
3. **Transparency**: Reasoning is always explained
4. **Entertainment First**: Mystical tone, actionable insights
5. **Cost Efficiency**: Smart caching, prompt optimization

---

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
│                    (Web, Mobile, API)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/WebSocket
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Node.js API Server                        │
│              (Express, TypeScript, Prisma)                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Prediction Orchestrator                     │   │
│  │  - Route requests to appropriate agent                │   │
│  │  - Manage user context & credits                      │   │
│  │  - Handle caching & rate limiting                     │   │
│  └────────────────────┬─────────────────────────────────┘   │
└─────────────────────┬─┴─────────────────────────────────────┘
                      │
                      │ HTTP
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                 Python ML Engine                           │
│                 (FastAPI, LangChain)                       │
│                                                             │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────┐  │
│  │  Divination   │  │     Macro     │  │Asset Timing  │  │
│  │    Agent      │  │   Strategy    │  │    Agent     │  │
│  │               │  │    Agent      │  │              │  │
│  └───────┬───────┘  └───────┬───────┘  └──────┬───────┘  │
│          │                  │                  │           │
│  ┌───────▼──────────────────▼──────────────────▼───────┐  │
│  │          Shared Agent Framework                      │  │
│  │  - Base Agent class                                  │  │
│  │  - LLM client (Claude, GPT-4)                        │  │
│  │  - Prompt templates                                  │  │
│  │  - Response formatting                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Domain Modules                              │  │
│  │                                                       │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │  │
│  │  │  Astrology │  │ Divination  │  │  Knowledge   │  │  │
│  │  │   Engine   │  │   Systems   │  │     Base     │  │  │
│  │  │            │  │             │  │    (RAG)     │  │  │
│  │  │ - Bazi     │  │ - Tarot     │  │ - Vector DB  │  │  │
│  │  │ - Ephemeris│  │ - I Ching   │  │ - Embeddings │  │  │
│  │  │ - Transits │  │             │  │ - Retrieval  │  │  │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ API Calls
                      │
┌─────────────────────▼─────────────────────────────────────┐
│                  External Services                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Anthropic  │  │    OpenAI    │  │   Pinecone   │    │
│  │    Claude    │  │    GPT-4     │  │  Vector DB   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Agent Catalog

### 1. DivinationAgent

**Purpose**: Provide mystical guidance for specific questions using Tarot or I Ching

**Input**:
```python
{
  "question": "Will Maple Finance help me earn $5000 by end of December?",
  "method": "tarot",  # or "iching"
  "spread_type": "three_card",  # or "celtic_cross"
  "context": {
    "asset": "MAPLE",
    "position": "long",
    "quantity": 10000,
    "entry_price": 0.50,
    "target_price": 1.00,
    "target_date": "2025-12-31"
  }
}
```

**Process**:
1. Draw cards or cast hexagram (seeded randomness based on timestamp + user_id)
2. Retrieve card/hexagram meanings from knowledge base
3. Construct financial context prompt
4. Send to LLM for interpretation
5. Extract favorability score, recommendations
6. Format response

**Output**:
```python
{
  "method": "tarot",
  "cards": [
    {
      "position": "past",
      "card": "The Fool",
      "orientation": "upright",
      "meaning": "New beginnings...",
      "interpretation": "Your journey with Maple Finance..."
    },
    # ... more cards
  ],
  "narrative": "The reading suggests...",
  "favorability_score": 7,
  "recommendations": [
    {
      "action": "hold",
      "reasoning": "The Star indicates patience will be rewarded",
      "timing": "next 30-60 days"
    }
  ],
  "confidence": 0.75
}
```

**LLM Model**: Claude 3.5 Sonnet (better at creative interpretation)

**System Prompt**:
```
You are an expert Tarot reader and financial astrologer specializing in crypto and traditional markets.

Your readings should:
- Connect card symbolism to market dynamics
- Tell a coherent narrative across the spread
- Provide specific, actionable guidance
- Balance mysticism with practical advice
- Acknowledge this is for entertainment purposes
- Assign a favorability score (1-10) based on the cards

Maintain an engaging, slightly mystical tone while being grounded in the question asked.
```

---

### 2. MacroStrategyAgent

**Purpose**: Predict asset class performance based on elemental cycles and planetary transits

**Input**:
```python
{
  "asset_class": "DeFi",
  "year": 2026,
  "timeframe": "annual",  # or "quarterly"
  "include_chinese": True,
  "include_western": True
}
```

**Process**:
1. Retrieve year element (2026 = Fire Horse)
2. Get asset class element mapping (DeFi = Water + Wood)
3. Calculate Five Elements harmony score
4. Retrieve Jupiter/Saturn positions for year
5. Analyze planetary transits relevant to asset class
6. Combine Chinese + Western scores
7. Generate quarterly breakdown
8. Extract investment themes via LLM

**Output**:
```python
{
  "asset_class": "DeFi",
  "year": 2026,
  "overall_score": 82,
  "favorability_score": 8,
  "chinese_analysis": {
    "year_element": {"element": "fire", "animal": "horse"},
    "harmony_score": 85,
    "interaction": "Fire produces Earth, neutral with Water",
    "favorable_sectors": ["Yield aggregators", "Cross-chain DEXs"]
  },
  "western_analysis": {
    "jupiter_position": "Libra",
    "saturn_position": "Pisces",
    "key_transits": [...],
    "planetary_score": 78
  },
  "quarterly_forecast": {
    "Q1": {"score": 7, "outlook": "Strong start..."},
    "Q2": {"score": 9, "outlook": "Peak period..."},
    "Q3": {"score": 6, "outlook": "Consolidation..."},
    "Q4": {"score": 8, "outlook": "Year-end rally..."}
  },
  "investment_themes": [
    "Yield optimization protocols",
    "Real-world asset tokenization"
  ],
  "risk_level": "medium"
}
```

**LLM Model**: Claude 3.5 Sonnet (nuanced market analysis)

**System Prompt**:
```
You are a financial astrologer specializing in macro market trends using Chinese Five Elements theory and Western planetary transits.

Given the elemental harmony analysis and planetary positions, provide:
1. A clear explanation of the elemental interactions
2. How the year element influences the asset class
3. Quarterly outlook with specific predictions
4. Investment themes aligned with astrological factors
5. Risk assessment

Your analysis should be professional yet mystical, educational yet entertaining.
Format your response as structured JSON.
```

---

### 3. AssetTimingAgent

**Purpose**: Identify optimal timing for buying/selling specific assets using birth chart transits

**Input**:
```python
{
  "asset_symbol": "BTC",
  "timeframe": "next_30_days",
  "action": "buy",  # or "sell", "hold"
  "user_id": "uuid"  # optional, for personalization
}
```

**Process**:
1. Retrieve asset birth chart from database
2. Calculate current planetary positions (ephemeris)
3. Find transits (current planets vs birth chart)
4. Score each transit by aspect type and planets involved
5. Identify favorable periods (high scores)
6. Identify challenging periods (low scores)
7. Calculate Chinese luck pillar for asset
8. Generate timing recommendations via LLM

**Output**:
```python
{
  "asset": "BTC",
  "timeframe": "next_30_days",
  "current_score": 65,
  "favorable_periods": [
    {
      "start_date": "2025-12-25",
      "end_date": "2025-12-28",
      "score": 85,
      "reason": "Jupiter trine natal Sun"
    }
  ],
  "challenging_periods": [
    {
      "start_date": "2026-01-03",
      "end_date": "2026-01-06",
      "score": 35,
      "reason": "Mars square natal Mars"
    }
  ],
  "peak_date": "2025-12-26",
  "worst_date": "2026-01-04",
  "key_aspects": [
    {
      "date": "2025-12-26",
      "transit_planet": "Jupiter",
      "natal_planet": "Sun",
      "aspect": "trine",
      "interpretation": "Major expansion energy"
    }
  ],
  "recommendations": [
    {
      "action": "buy",
      "timing": "December 25-28",
      "reasoning": "Jupiter transit provides optimal entry",
      "confidence": 0.82
    }
  ]
}
```

**LLM Model**: Claude 3.5 Sonnet (detailed astrological interpretation)

**System Prompt**:
```
You are an expert in financial astrology specializing in asset timing via transit analysis.

Given the birth chart transits and aspect data, provide:
1. Clear explanation of major transits
2. Why certain dates are favorable/unfavorable
3. Specific action recommendations (buy/sell/wait)
4. Confidence levels for each recommendation
5. Warnings about challenging aspects

Translate technical astrology into trading terms. Be specific about timing.
Format your response as structured JSON.
```

---

### 4. PersonalizationAgent (Future - Phase 4)

**Purpose**: Match users with compatible assets based on their birth charts

**Input**:
```python
{
  "user_id": "uuid",
  "asset_list": ["BTC", "ETH", "SOL", ...],
  "max_results": 10
}
```

**Process**:
1. Retrieve user birth chart
2. Extract favorable elements
3. For each asset, calculate compatibility:
   - Element harmony (Chinese)
   - Sun/Moon sign compatibility (Western)
   - Planetary aspects
4. Rank assets by compatibility score
5. Generate personalized explanations

**Output**:
```python
{
  "user_profile": {
    "favorable_elements": ["earth", "fire"],
    "sun_sign": "Taurus",
    "moon_sign": "Leo"
  },
  "compatible_assets": [
    {
      "symbol": "WALRUS",
      "compatibility_score": 92,
      "element_match": "earth",
      "reasoning": "Strong earth element alignment...",
      "recommendation": "Highly compatible for long-term holding"
    },
    # ... top 10
  ]
}
```

---

### 5. PolymarketAgent (Future - Phase 4)

**Purpose**: Predict Polymarket event outcomes using astrological analysis

**Input**:
```python
{
  "event_id": "polymarket_event_123",
  "event_title": "Will BTC reach $100k by March 2026?",
  "event_end_date": "2026-03-31",
  "outcomes": ["Yes", "No"]
}
```

**Process**:
1. Parse event and extract key dates
2. Extract mentioned assets (e.g., BTC)
3. Analyze planetary conditions on event date
4. Calculate asset birth chart transits
5. Combine astrological factors
6. Generate outcome probability

**Output**:
```python
{
  "event_id": "polymarket_event_123",
  "predicted_outcome": "Yes",
  "confidence": 0.68,
  "astrological_factors": [
    "Jupiter trine BTC natal Sun in March",
    "Year element supports metal/tech assets",
    "Historical correlation: 72% accuracy"
  ],
  "recommended_bet": "Yes at current odds",
  "risk_assessment": "medium"
}
```

---

### 6. ExplanationAgent (Future - Phase 4)

**Purpose**: Translate technical astrological concepts into user-friendly language

**Input**:
```python
{
  "prediction_type": "asset_timing",
  "technical_output": {...},  # Raw prediction from another agent
  "user_level": "beginner"  # or "intermediate", "advanced"
}
```

**Process**:
1. Analyze technical astrological output
2. Identify complex terms (e.g., "trine", "natal Sun")
3. Generate analogies and simplified explanations
4. Adjust tone based on user level
5. Add visual element suggestions for frontend

**Output**:
```python
{
  "simplified_summary": "Think of this as a green light period...",
  "key_takeaways": [
    "Best time to buy: December 25-28",
    "Avoid: January 3-6 (volatility expected)"
  ],
  "analogies": {
    "Jupiter trine": "Like having a strong tailwind for your investment"
  },
  "visual_suggestions": {
    "calendar_highlights": ["2025-12-25", "2025-12-26"],
    "gauge_value": 85,
    "color_theme": "green"
  }
}
```

---

## Base Agent Framework

All agents inherit from a common `BaseAgent` class:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any
import anthropic
import openai

class BaseAgent(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.llm_provider = config.get('llm_provider', 'anthropic')
        self.model = config.get('model', 'claude-3-5-sonnet-20241022')

        # Initialize LLM client
        if self.llm_provider == 'anthropic':
            self.llm = anthropic.Anthropic(api_key=config['anthropic_api_key'])
        elif self.llm_provider == 'openai':
            self.llm = openai.OpenAI(api_key=config['openai_api_key'])

        self.logger = config.get('logger')

    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main processing method - must be implemented by each agent
        """
        pass

    @abstractmethod
    def get_system_prompt(self) -> str:
        """
        Return the system prompt for this agent
        """
        pass

    async def call_llm(
        self,
        user_prompt: str,
        system_prompt: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Call LLM with prompt and return response
        """
        if system_prompt is None:
            system_prompt = self.get_system_prompt()

        try:
            if self.llm_provider == 'anthropic':
                response = self.llm.messages.create(
                    model=self.model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ]
                )
                return response.content[0].text

            elif self.llm_provider == 'openai':
                response = self.llm.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens
                )
                return response.choices[0].message.content

        except Exception as e:
            self.logger.error(f"LLM call failed: {e}")
            raise

    def parse_json_response(self, response: str) -> Dict[str, Any]:
        """
        Parse LLM JSON response with error handling
        """
        import json
        import re

        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```json\n(.*?)\n```', response, re.DOTALL)
        if json_match:
            response = json_match.group(1)

        try:
            return json.loads(response)
        except json.JSONDecodeError as e:
            self.logger.error(f"Failed to parse JSON: {e}")
            self.logger.error(f"Response: {response}")
            raise

    def validate_output(self, output: Dict[str, Any]) -> bool:
        """
        Validate agent output structure
        """
        required_fields = ['favorability_score', 'recommendations']
        for field in required_fields:
            if field not in output:
                self.logger.error(f"Missing required field: {field}")
                return False
        return True
```

---

## Prompt Engineering Strategy

### Principles

1. **Clear Role Definition**: Always specify the agent's expertise
2. **Structured Output**: Request JSON format for consistency
3. **Context Awareness**: Include all relevant financial context
4. **Tone Guidance**: Specify entertainment + professionalism balance
5. **Error Handling**: Provide fallback instructions

### Prompt Template Structure

```python
def build_prompt(context: Dict[str, Any]) -> str:
    """
    Standard prompt structure:
    1. Role definition
    2. Task description
    3. Input data
    4. Output format specification
    5. Constraints and guidelines
    """

    prompt = f"""
# Role
You are {context['agent_role']}.

# Task
{context['task_description']}

# Input Data
{json.dumps(context['input_data'], indent=2)}

# Output Format
Return a JSON object with the following structure:
{json.dumps(context['output_schema'], indent=2)}

# Guidelines
{context['guidelines']}

# Constraints
- Favorability score must be 1-10
- Confidence must be 0.0-1.0
- Recommendations must be specific and actionable
- Acknowledge this is for entertainment purposes
- Maintain a mystical yet professional tone

Now provide your analysis:
"""

    return prompt
```

### Example: DivinationAgent Tarot Prompt

```python
def build_tarot_prompt(question, cards, context):
    return f"""
# Role
You are an expert Tarot reader specializing in financial questions about crypto and traditional markets.

# Task
Interpret a 3-card Tarot spread for the following question.

# Question
"{question}"

# Financial Context
- Asset: {context.get('asset', 'N/A')}
- Position: {context.get('position', 'N/A')}
- Entry Price: ${context.get('entry_price', 'N/A')}
- Target Price: ${context.get('target_price', 'N/A')}
- Target Date: {context.get('target_date', 'N/A')}

# Cards Drawn
Position 1 (Past): {cards[0]['name']} - {cards[0]['orientation']}
Traditional Meaning: {cards[0]['meaning']}

Position 2 (Present): {cards[1]['name']} - {cards[1]['orientation']}
Traditional Meaning: {cards[1]['meaning']}

Position 3 (Future): {cards[2]['name']} - {cards[2]['orientation']}
Traditional Meaning: {cards[2]['meaning']}

# Your Task
Provide a reading that:
1. Interprets each card in the context of the financial question
2. Tells a coherent narrative across past → present → future
3. Gives specific, actionable guidance
4. Assigns a favorability score (1-10) based on the cards
5. Maintains an engaging, mystical tone

# Output Format (JSON)
{{
  "narrative": "A 3-5 sentence overall interpretation connecting all three cards...",
  "card_interpretations": [
    {{
      "position": "past",
      "interpretation": "How this card relates to the question's history..."
    }},
    {{
      "position": "present",
      "interpretation": "Current situation analysis..."
    }},
    {{
      "position": "future",
      "interpretation": "What the cards suggest for the future..."
    }}
  ],
  "favorability_score": 7,
  "key_insights": [
    "Bullet point 1",
    "Bullet point 2",
    "Bullet point 3"
  ],
  "recommendations": [
    {{
      "action": "hold",
      "reasoning": "The Star suggests patience will be rewarded",
      "timing": "next 30-60 days",
      "confidence": 0.75
    }}
  ],
  "warnings": [
    "The reversed card suggests caution with..."
  ]
}}

Important: This reading is for entertainment purposes only and should not be considered financial advice.

Now provide your Tarot reading:
"""
```

---

## RAG System (Knowledge Base)

### Purpose

Provide agents with domain knowledge without requiring extensive prompt context.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Knowledge Sources                        │
├─────────────────────────────────────────────────────────────┤
│  • Tarot card meanings (78 cards × upright/reversed)        │
│  • I Ching hexagrams (64 hexagrams × line meanings)         │
│  • Astrological aspect interpretations                      │
│  • Five Elements theory & interactions                      │
│  • Planetary symbolism & financial correlations             │
│  • Historical market-astrology correlations                 │
│  • Asset birth date database                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Ingestion & Embedding
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   Vector Database (Pinecone)                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Embedding Model: OpenAI text-embedding-3-small    │    │
│  │  Dimensions: 1536                                    │    │
│  │  Collections:                                        │    │
│  │    - tarot_meanings                                  │    │
│  │    - iching_hexagrams                                │    │
│  │    - astrological_aspects                            │    │
│  │    - element_theory                                  │    │
│  │    - historical_correlations                         │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Similarity Search
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Agent Query Layer                         │
│                                                               │
│  agent.query_knowledge(                                      │
│    query="What does Jupiter trine mean for crypto?",        │
│    collection="astrological_aspects",                        │
│    top_k=3                                                   │
│  )                                                           │
│                                                               │
│  Returns:                                                    │
│  [                                                           │
│    {                                                         │
│      "text": "Jupiter trine indicates...",                   │
│      "score": 0.92,                                          │
│      "metadata": {...}                                       │
│    },                                                        │
│    ...                                                       │
│  ]                                                           │
└─────────────────────────────────────────────────────────────┘
```

### Knowledge Base Structure

**Tarot Cards**:
```json
{
  "card_id": "major_0_fool",
  "name": "The Fool",
  "number": 0,
  "suit": "major_arcana",
  "upright_keywords": ["new beginnings", "innocence", "spontaneity", "free spirit"],
  "reversed_keywords": ["recklessness", "risk-taking", "naivety"],
  "upright_financial": "Represents the start of a new investment journey. Suggests taking calculated risks on emerging opportunities. Favorable for new market entries.",
  "reversed_financial": "Warns against impulsive decisions. Suggests excessive risk without proper research. Caution advised.",
  "symbolism": "A young person standing at a cliff's edge...",
  "element": "air",
  "astrology": "Uranus",
  "embedding": [0.123, -0.456, ...]  # Vector representation
}
```

**I Ching Hexagrams**:
```json
{
  "hexagram_id": "14",
  "chinese_name": "大有",
  "english_name": "Possession in Great Measure",
  "trigrams": {"upper": "fire", "lower": "heaven"},
  "judgement": "Possession in great measure. Supreme success.",
  "image": "Fire in heaven above: the image of POSSESSION IN GREAT MEASURE...",
  "financial_interpretation": "Indicates abundance and prosperity. Favorable for holdings and accumulation. Peak wealth period.",
  "changing_lines": {
    "line_1": "No relationship with what is harmful...",
    "line_2": "A big wagon for loading...",
    # ... lines 3-6
  },
  "element": "fire",
  "embedding": [0.789, -0.234, ...]
}
```

**Astrological Aspects**:
```json
{
  "aspect_id": "jupiter_trine_sun",
  "transit_planet": "Jupiter",
  "natal_planet": "Sun",
  "aspect_type": "trine",
  "angle": 120,
  "orb": 8,
  "nature": "beneficial",
  "traditional_meaning": "Expansion, growth, optimism, success",
  "financial_meaning": "Highly favorable for investments. Indicates growth period, positive market sentiment, successful ventures. Good timing for entering positions.",
  "historical_correlation": "72% of assets showed gains during Jupiter-Sun trines (backtested over 10 years)",
  "duration": "Typically 2-3 weeks of influence",
  "example": "When Jupiter trines BTC's natal Sun, historically coincides with bullish rallies.",
  "embedding": [0.456, -0.789, ...]
}
```

### Usage in Agents

```python
class DivinationAgent(BaseAgent):
    def __init__(self, config):
        super().__init__(config)
        self.knowledge_base = KnowledgeBase(config['pinecone_api_key'])

    async def perform_tarot_reading(self, question, cards, context):
        # 1. Retrieve detailed card meanings
        card_contexts = []
        for card in cards:
            card_meaning = self.knowledge_base.query(
                query=f"{card['name']} {card['orientation']} financial meaning",
                collection="tarot_meanings",
                filter={"card_id": card['id']},
                top_k=1
            )
            card_contexts.append(card_meaning[0])

        # 2. Retrieve similar past readings (for consistency)
        similar_readings = self.knowledge_base.query(
            query=question,
            collection="past_readings",
            top_k=3
        )

        # 3. Build enriched prompt
        prompt = self._build_tarot_prompt(
            question=question,
            cards=cards,
            card_contexts=card_contexts,
            similar_readings=similar_readings,
            financial_context=context
        )

        # 4. Call LLM
        response = await self.call_llm(prompt)

        return self.parse_json_response(response)
```

---

## Model Selection & Fallback

### Primary: Anthropic Claude 3.5 Sonnet

**Use Cases**:
- All divination interpretations (Tarot, I Ching)
- Macro market reasoning
- Asset timing explanations
- Personalized recommendations

**Strengths**:
- Superior creative interpretation
- Better at maintaining consistent mystical tone
- Excellent with nuanced financial context
- Strong reasoning capabilities

**Pricing**:
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

### Secondary: OpenAI GPT-4 Turbo

**Use Cases**:
- Fallback when Claude is unavailable
- Structured data extraction
- High-volume batch processing
- Cost optimization for free tier users

**Strengths**:
- Faster response times
- Better structured output
- JSON mode
- Function calling

**Pricing**:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

### Fallback Strategy

```python
class LLMClient:
    def __init__(self, config):
        self.primary = 'anthropic'
        self.fallback = 'openai'
        self.anthropic = anthropic.Anthropic(api_key=config['anthropic_key'])
        self.openai = openai.OpenAI(api_key=config['openai_key'])

    async def generate(self, prompt, system_prompt, **kwargs):
        try:
            # Try primary (Claude)
            return await self._call_anthropic(prompt, system_prompt, **kwargs)
        except anthropic.RateLimitError:
            # Fallback to OpenAI
            logger.warning("Claude rate limit hit, falling back to GPT-4")
            return await self._call_openai(prompt, system_prompt, **kwargs)
        except Exception as e:
            logger.error(f"Primary LLM failed: {e}")
            # Try fallback
            return await self._call_openai(prompt, system_prompt, **kwargs)
```

---

## Caching Strategy

### Prediction Caching

**Cache Macro Predictions**:
- Key: `macro:{asset_class}:{year}:{timeframe}`
- TTL: 7 days
- Reasoning: Macro predictions don't change daily

**Cache Asset Timing**:
- Key: `timing:{asset}:{date}:{timeframe}`
- TTL: 24 hours
- Reasoning: Transits change daily

**Don't Cache Divination**:
- Each reading is unique and personal
- Users expect fresh interpretations
- Low cache hit rate

### LLM Response Caching

```python
import hashlib
import redis

class CachedLLMClient:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def generate(self, prompt, system_prompt, **kwargs):
        # Create cache key from prompt hash
        cache_key = self._generate_cache_key(prompt, system_prompt)

        # Check cache
        cached = await self.redis.get(cache_key)
        if cached:
            logger.info("LLM response cache hit")
            return json.loads(cached)

        # Generate
        response = await self.llm.generate(prompt, system_prompt, **kwargs)

        # Store in cache
        await self.redis.setex(
            cache_key,
            3600,  # 1 hour
            json.dumps(response)
        )

        return response

    def _generate_cache_key(self, prompt, system_prompt):
        combined = f"{system_prompt}|||{prompt}"
        return f"llm:response:{hashlib.sha256(combined.encode()).hexdigest()}"
```

---

## Cost Optimization

### Estimated Costs

**Per Prediction**:
- Average input tokens: 2,000
- Average output tokens: 800
- Claude cost: ~$0.018
- Target revenue per prediction: $0.10-0.20
- Gross margin: 80-90%

**Monthly Projections**:
```
1,000 predictions/month:
- LLM cost: $18
- Infrastructure: $50
- Total: $68
- Revenue (at $0.15/pred): $150
- Profit: $82

10,000 predictions/month:
- LLM cost: $180
- Infrastructure: $200
- Total: $380
- Revenue: $1,500
- Profit: $1,120

100,000 predictions/month:
- LLM cost: $1,800
- Infrastructure: $800
- Total: $2,600
- Revenue: $15,000
- Profit: $12,400
```

### Optimization Strategies

1. **Prompt Compression**:
   - Remove unnecessary verbosity
   - Use abbreviations in system prompts
   - Target: 20% token reduction

2. **Tiered Models**:
   - Free tier: GPT-3.5 Turbo ($0.001/1k tokens)
   - Paid tier: Claude 3.5 Sonnet
   - Target: 50% cost reduction on free tier

3. **Batch Processing**:
   - Queue non-urgent predictions
   - Process in batches
   - Reduce API overhead

4. **Smart Caching**:
   - Cache macro predictions (30-40% hit rate)
   - Cache knowledge base queries
   - Target: 35% overall cost reduction

**Total Potential Savings**: 60-70% with all optimizations

---

## Monitoring & Quality Assurance

### Metrics to Track

**Performance**:
- Prediction generation time (target: <10s)
- LLM response time
- Cache hit rate
- API error rate

**Quality**:
- User satisfaction ratings (1-10)
- Prediction coherence (manual review)
- Favorability score distribution
- Recommendation actionability

**Cost**:
- Cost per prediction
- LLM API costs
- Infrastructure costs
- Margin per user

### Quality Control

```python
class PredictionValidator:
    def validate(self, prediction):
        """
        Validate prediction before returning to user
        """
        issues = []

        # Check required fields
        if 'favorability_score' not in prediction:
            issues.append("Missing favorability_score")

        # Validate score range
        if not (1 <= prediction.get('favorability_score', 0) <= 10):
            issues.append("Favorability score out of range")

        # Check recommendations exist
        if not prediction.get('recommendations'):
            issues.append("No recommendations provided")

        # Check for coherence (basic)
        if len(prediction.get('narrative', '')) < 50:
            issues.append("Narrative too short")

        # Flag for human review if issues found
        if issues:
            logger.warning(f"Prediction validation issues: {issues}")
            # Store for manual review
            self.flag_for_review(prediction, issues)
            # Don't block user, but track

        return len(issues) == 0
```

---

## Security & Safety

### Prompt Injection Prevention

```python
def sanitize_user_input(question: str) -> str:
    """
    Prevent prompt injection attacks
    """
    # Remove control characters
    question = ''.join(c for c in question if c.isprintable())

    # Limit length
    max_length = 500
    question = question[:max_length]

    # Remove potential injection patterns
    forbidden_patterns = [
        "ignore previous instructions",
        "system prompt",
        "you are now",
        "forget everything"
    ]

    question_lower = question.lower()
    for pattern in forbidden_patterns:
        if pattern in question_lower:
            logger.warning(f"Potential injection attempt: {question}")
            question = question.replace(pattern, "[REDACTED]")

    return question
```

### Content Filtering

```python
async def check_content_safety(prediction: dict) -> bool:
    """
    Ensure predictions don't contain harmful content
    """
    # Check for financial advice disclaimers
    if "financial advice" not in prediction.get('narrative', '').lower():
        # Add disclaimer
        prediction['narrative'] += "\n\nNote: This is for entertainment purposes only and not financial advice."

    # Check for extreme claims
    extreme_words = ['guaranteed', 'certain', 'definitely will', '100%']
    narrative = prediction.get('narrative', '').lower()

    for word in extreme_words:
        if word in narrative:
            logger.warning(f"Extreme claim detected: {word}")
            # Soften language
            prediction['narrative'] = prediction['narrative'].replace(
                word, "may" if word != "100%" else "high probability"
            )

    return True
```

---

## Deployment Architecture

### ML Engine Deployment

**Platform**: Railway / Render / AWS ECS

**Container**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Environment Variables**:
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
LOG_LEVEL=INFO
```

### Scaling Strategy

**Horizontal Scaling**:
- Run multiple ML engine instances
- Load balancer distributes requests
- Stateless design enables easy scaling

**Autoscaling Rules**:
- Scale up: CPU > 70% for 5 minutes
- Scale down: CPU < 30% for 15 minutes
- Min instances: 2
- Max instances: 10

---

## Testing Strategy

### Unit Tests

```python
import pytest
from agents.divination_agent import DivinationAgent

def test_tarot_reading_structure():
    agent = DivinationAgent(test_config)

    result = await agent.perform_tarot_reading(
        question="Will BTC reach $100k?",
        cards=[...],
        context={}
    )

    assert 'favorability_score' in result
    assert 1 <= result['favorability_score'] <= 10
    assert 'recommendations' in result
    assert len(result['recommendations']) > 0
```

### Integration Tests

```python
def test_end_to_end_prediction():
    # 1. Create prediction request
    response = client.post('/api/predictions/divination', json={
        "method": "tarot",
        "question": "Should I buy SOL now?"
    })

    # 2. Check response
    assert response.status_code == 200
    data = response.json()

    # 3. Validate structure
    assert 'prediction_id' in data
    assert 'favorability_score' in data
    assert 'cards' in data

    # 4. Check database
    prediction = db.predictions.find_one({"id": data['prediction_id']})
    assert prediction['status'] == 'completed'
```

---

## Future Enhancements

### Phase 4+ Improvements

1. **Multi-Agent Collaboration**:
   - Agents consult each other for consensus
   - "Second opinion" feature
   - Confidence boosting via agreement

2. **Reinforcement Learning**:
   - Track prediction accuracy over time
   - Adjust scoring algorithms based on outcomes
   - Fine-tune prompts automatically

3. **User Feedback Loop**:
   - Collect user ratings on predictions
   - Use feedback to improve prompts
   - Personalize agent behavior per user

4. **Advanced RAG**:
   - Ingest news articles for context
   - Real-time market data integration
   - Historical correlation database

5. **Voice Interface**:
   - Voice input for questions
   - Natural language conversation
   - Audio prediction narration

---

## Conclusion

The Astro AI Agent Architecture provides a flexible, scalable foundation for generating entertaining yet insightful astrological predictions. By combining domain expertise (astrology, divination) with state-of-the-art LLMs, we create a unique user experience that's both magical and actionable.

**Key Strengths**:
- Modular agent design
- Cost-efficient LLM usage
- Robust caching strategy
- Quality assurance built-in
- Entertainment-first approach

**Next Steps**:
1. Implement DivinationAgent (Week 7)
2. Build MacroStrategyAgent (Week 8)
3. Create AssetTimingAgent (Week 9)
4. Deploy ML engine to production
5. Monitor and iterate based on user feedback

With this architecture, we're ready to bring cosmic insights to financial markets! 🌟
