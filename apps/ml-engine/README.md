# Astro ML Engine

Python-based AI/ML microservice for astrological predictions.

## Features

- Multi-agent AI system (LangChain)
- Astrological calculations (Swiss Ephemeris)
- RAG system (Pinecone vector DB)
- Tarot and I Ching engines
- Birth chart calculations
- Prediction generation
- FastAPI REST endpoints
- WebSocket support

## Tech Stack

- Python 3.11+
- FastAPI
- LangChain
- Anthropic Claude / OpenAI GPT-4
- Pinecone (vector DB)
- Swiss Ephemeris
- NumPy / Pandas (calculations)
- Pydantic (validation)

## Getting Started

```bash
cd apps/ml-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs on [http://localhost:8000](http://localhost:8000)

## Environment Variables

Create `apps/ml-engine/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
```

## Project Structure

```
ml-engine/
├── main.py              # FastAPI app entry
├── agents/              # AI agents
│   ├── base.py
│   ├── macro_strategy.py
│   ├── asset_timing.py
│   ├── divination.py
│   ├── personalization.py
│   ├── polymarket.py
│   └── explanation.py
├── astrology/           # Astrological calculations
│   ├── chinese/
│   │   ├── bazi.py
│   │   ├── elements.py
│   │   └── zodiac.py
│   ├── western/
│   │   ├── natal_chart.py
│   │   ├── transits.py
│   │   └── aspects.py
│   └── ephemeris/
│       └── calculations.py
├── divination/          # Divination systems
│   ├── tarot/
│   │   ├── deck.py
│   │   ├── spreads.py
│   │   └── interpretations.py
│   └── iching/
│       ├── hexagrams.py
│       ├── casting.py
│       └── interpretations.py
├── rag/                 # RAG system
│   ├── knowledge_base.py
│   ├── embeddings.py
│   └── retrieval.py
├── models/              # Pydantic models
├── services/            # Business logic
├── utils/               # Utilities
└── tests/               # Tests
```

## API Endpoints

### Agents
- `POST /api/agents/macro` - Macro prediction
- `POST /api/agents/asset-timing` - Asset timing
- `POST /api/agents/divination` - Divination reading
- `POST /api/agents/compatibility` - User-asset match
- `POST /api/agents/polymarket` - Event prediction

### Astrology
- `POST /api/astrology/birth-chart` - Calculate birth chart
- `POST /api/astrology/bazi` - Calculate Bazi chart
- `POST /api/astrology/transits` - Calculate transits
- `POST /api/astrology/compatibility` - Element compatibility

### Divination
- `POST /api/divination/tarot` - Tarot reading
- `POST /api/divination/iching` - I Ching reading

### Knowledge Base
- `POST /api/rag/query` - Query knowledge base
- `POST /api/rag/ingest` - Ingest documents

## AI Agents

### MacroStrategyAgent
Analyzes asset class performance based on:
- Chinese year element cycles
- Western planetary transits
- Historical backtesting
- Element harmony calculations

### AssetTimingAgent
Provides timing predictions for individual assets:
- Birth chart analysis
- Current transits
- Favorable/challenging aspects
- Chinese luck pillar cycles

### DivinationAgent
Performs divination readings:
- Tarot spreads (3-card, Celtic Cross)
- I Ching hexagram casting
- Financial context interpretation
- Actionable guidance

### PersonalizationAgent
Matches users with compatible assets:
- Element harmony analysis
- Planetary compatibility
- Personalized recommendations
- Timing suggestions

### PolymarketAgent
Predicts event outcomes:
- Event analysis
- Outcome probabilities
- Astrological factors
- Confidence scoring

### ExplanationAgent
Translates predictions to user-friendly language:
- Simplification
- Entertainment tone
- Skill level adaptation
- Visual element generation

## Astrological Calculations

### Chinese Astrology
```python
from astrology.chinese import calculate_bazi, get_favorable_elements

bazi = calculate_bazi(
    year=1990,
    month=5,
    day=15,
    hour=14,
    minute=30
)
# Returns: {year: {stem, branch}, month: {stem, branch}, ...}

elements = get_favorable_elements(bazi)
# Returns: {primary: 'earth', secondary: 'fire'}
```

### Western Astrology
```python
from astrology.western import calculate_natal_chart, find_transits

chart = calculate_natal_chart(
    year=1990,
    month=5,
    day=15,
    hour=14,
    minute=30,
    lat=40.7128,
    lng=-74.0060
)
# Returns: {sun: {...}, moon: {...}, planets: {...}, houses: {...}}

transits = find_transits(chart, target_date="2025-12-31")
# Returns: [{type: 'trine', planet1: 'Jupiter', ...}, ...]
```

### Divination
```python
from divination.tarot import TarotDeck, three_card_spread
from divination.iching import cast_hexagram

# Tarot
deck = TarotDeck()
reading = three_card_spread(deck, question="Will BTC reach $100k?")

# I Ching
hexagram = cast_hexagram(question="Should I buy now?")
```

## Development

```bash
# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run server
uvicorn main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=.

# Lint
flake8 .
black .
mypy .

# Type checking
mypy .
```

## Testing

```bash
pytest tests/                    # All tests
pytest tests/test_agents.py      # Specific file
pytest -v                        # Verbose
pytest --cov=. --cov-report=html # Coverage report
```

## Deployment

```bash
# Build Docker image
docker build -t astro-ml-engine .

# Run container
docker run -p 8000:8000 --env-file .env astro-ml-engine

# Deploy to Railway/Render
# Configure via railway.json or render.yaml
```

## Swiss Ephemeris

This project uses Swiss Ephemeris for accurate planetary calculations.

```python
from astrology.ephemeris import get_planetary_positions

positions = get_planetary_positions(
    year=2025,
    month=12,
    day=31,
    hour=12,
    minute=0,
    lat=40.7128,
    lng=-74.0060
)
```

## API Documentation

Interactive API docs available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
