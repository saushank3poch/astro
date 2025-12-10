-- Astro Prediction Platform - Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255), -- NULL for OAuth users

    -- Birth Information
    birth_date DATE,
    birth_time TIME,
    birth_location JSONB, -- {lat: number, lng: number, city: string, country: string}
    birth_timezone VARCHAR(50),

    -- Subscription
    subscription_tier VARCHAR(50) DEFAULT 'free', -- free, basic, pro
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, past_due, cancelled
    subscription_expires_at TIMESTAMP,
    subscription_provider VARCHAR(50), -- stripe, apple, google, crypto

    -- Platform
    platform VARCHAR(20) DEFAULT 'web', -- web, ios, android

    -- Tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,

    -- Settings
    language VARCHAR(10) DEFAULT 'en', -- en, zh
    astrology_system VARCHAR(20) DEFAULT 'both', -- chinese, western, both
    notifications_enabled BOOLEAN DEFAULT true
);

CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, apple, facebook
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_user_id)
);

-- ============================================================================
-- ASTROLOGICAL PROFILES
-- ============================================================================

CREATE TABLE user_astrological_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    -- Chinese Astrology
    chinese_zodiac VARCHAR(20), -- rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig
    chinese_element VARCHAR(20), -- metal, wood, water, fire, earth
    bazi_chart JSONB, -- Four Pillars: {year: {stem, branch}, month: {stem, branch}, day: {stem, branch}, hour: {stem, branch}}
    favorable_elements JSONB, -- {primary: 'earth', secondary: 'fire', tertiary: 'metal'}
    unfavorable_elements JSONB, -- {primary: 'water', secondary: 'wood'}
    lucky_numbers INTEGER[],
    lucky_colors VARCHAR(50)[],

    -- Western Astrology
    sun_sign VARCHAR(20),
    moon_sign VARCHAR(20),
    rising_sign VARCHAR(20),
    birth_chart JSONB, -- Full natal chart with all planetary positions
    dominant_elements JSONB, -- {fire: 30, earth: 25, air: 25, water: 20}
    dominant_modality VARCHAR(20), -- cardinal, fixed, mutable
    chart_patterns VARCHAR(50)[], -- grand_trine, t_square, stellium, etc.

    -- Calculated at
    calculated_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ASSETS & TICKERS
-- ============================================================================

CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Basic Info
    symbol VARCHAR(50) UNIQUE NOT NULL, -- BTC, ETH, AAPL, etc.
    name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- crypto, stock, commodity, index
    category VARCHAR(100), -- DeFi, RWA, Layer1, meme, tech_stock, etc.
    exchange VARCHAR(100),

    -- Birth Information
    birth_date DATE,
    birth_time TIME,
    birth_location JSONB,
    birth_date_source VARCHAR(255), -- "Genesis block", "IPO date", "Token launch"
    birth_date_confidence VARCHAR(20), -- high, medium, low, unknown
    alternative_birth_dates JSONB, -- [{date, source, confidence}]

    -- Chinese Astrology
    primary_element VARCHAR(20), -- metal, wood, water, fire, earth
    secondary_element VARCHAR(20),
    chinese_zodiac VARCHAR(20),
    bazi_chart JSONB,
    element_reasoning TEXT, -- Why this element was assigned

    -- Western Astrology
    sun_sign VARCHAR(20),
    dominant_planet VARCHAR(20), -- Mars, Venus, Jupiter, etc.
    planetary_rulers VARCHAR(20)[], -- Multiple planets for complex assets
    birth_chart JSONB,

    -- Market Data (for reference)
    market_cap DECIMAL,
    current_price DECIMAL,
    price_currency VARCHAR(10) DEFAULT 'USD',

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_researched BOOLEAN DEFAULT false, -- Has birth date been properly researched?
    needs_review BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    researched_at TIMESTAMP,
    researched_by UUID REFERENCES users(id)
);

CREATE INDEX idx_assets_symbol ON assets(symbol);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_element ON assets(primary_element);

-- ============================================================================
-- PREDICTIONS
-- ============================================================================

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Prediction Type
    prediction_type VARCHAR(50) NOT NULL, -- macro, birth_date, divination, compatibility, polymarket
    method VARCHAR(50), -- chinese, western, tarot, iching, combined

    -- Query Details
    question TEXT,
    target_asset_id UUID REFERENCES assets(id),
    target_asset_class VARCHAR(50), -- US_stocks, HK_stocks, crypto, DeFi, RWA
    timeframe VARCHAR(50), -- short_term (days), medium_term (weeks), long_term (months)
    specific_date DATE, -- For timing predictions

    -- User Context (for personalized predictions)
    user_birth_chart_snapshot JSONB, -- Snapshot of user's chart at time of prediction

    -- Prediction Results
    prediction_result JSONB, -- Structured prediction data (varies by type)
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    favorability_score INTEGER, -- 1-10
    favorable_period_start DATE,
    favorable_period_end DATE,

    -- AI Agent Details
    primary_agent VARCHAR(100), -- Which agent generated this
    supporting_agents JSONB, -- Other agents consulted
    reasoning TEXT, -- Human-readable explanation
    technical_analysis JSONB, -- Detailed astrological calculations
    recommendations JSONB, -- Actionable recommendations

    -- Divination Specific
    divination_method VARCHAR(50), -- tarot_three_card, tarot_celtic_cross, iching
    divination_result JSONB, -- {cards: [...], interpretation: "..."}

    -- Validation & Tracking
    actual_outcome VARCHAR(50), -- favorable, unfavorable, neutral, too_early
    outcome_recorded_at TIMESTAMP,
    accuracy_score DECIMAL(3,2), -- How accurate was this prediction?
    user_feedback_rating INTEGER, -- 1-5 stars
    user_feedback_text TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,

    -- Timing
    created_at TIMESTAMP DEFAULT NOW(),
    processing_started_at TIMESTAMP,
    completed_at TIMESTAMP,

    -- Credits
    credits_used INTEGER DEFAULT 1
);

CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_type ON predictions(prediction_type);
CREATE INDEX idx_predictions_asset ON predictions(target_asset_id);
CREATE INDEX idx_predictions_created ON predictions(created_at DESC);
CREATE INDEX idx_predictions_status ON predictions(status);

-- ============================================================================
-- MACRO PREDICTIONS (Asset Class Level)
-- ============================================================================

CREATE TABLE macro_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Time Period
    period_type VARCHAR(50), -- year, quarter, month
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER, -- 1, 2, 3, 4
    month INTEGER, -- 1-12

    -- Chinese Calendar
    chinese_year_element VARCHAR(20), -- 2026 = fire
    chinese_year_animal VARCHAR(20), -- 2026 = horse
    chinese_year_stem VARCHAR(20),
    chinese_year_branch VARCHAR(20),

    -- Western Astrology
    major_transits JSONB, -- Key planetary movements
    dominant_planetary_energy VARCHAR(50),

    -- Predictions by Asset Class
    predictions JSONB, -- {US_stocks: {score: 7, reasoning: "..."}, crypto: {...}, ...}

    -- Overall Analysis
    overall_market_energy VARCHAR(50), -- bullish, bearish, neutral, volatile
    best_performing_classes VARCHAR(50)[],
    worst_performing_classes VARCHAR(50)[],
    reasoning TEXT,
    recommendations TEXT,

    -- Validation
    actual_performance JSONB, -- Filled in after period ends
    accuracy_score DECIMAL(3,2),

    -- Metadata
    generated_by VARCHAR(100) DEFAULT 'MacroStrategyAgent',
    created_at TIMESTAMP DEFAULT NOW(),
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP
);

CREATE INDEX idx_macro_predictions_year ON macro_predictions(year);
CREATE INDEX idx_macro_predictions_period ON macro_predictions(period_start, period_end);

-- ============================================================================
-- USER-ASSET COMPATIBILITY
-- ============================================================================

CREATE TABLE user_asset_compatibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,

    -- Compatibility Scores
    overall_compatibility_score INTEGER, -- 1-10
    element_compatibility_score INTEGER, -- 1-10
    planetary_compatibility_score INTEGER, -- 1-10
    timing_compatibility_score INTEGER, -- Current timing alignment

    -- Detailed Analysis
    element_harmony JSONB, -- {user_elements: {...}, asset_elements: {...}, harmony: {...}}
    planetary_harmony JSONB,
    favorable_aspects JSONB,
    challenging_aspects JSONB,

    -- Recommendations
    recommendation_level VARCHAR(50), -- highly_favorable, favorable, neutral, unfavorable, avoid
    reasoning TEXT,
    best_entry_periods JSONB, -- [{start, end, score}]
    warning_periods JSONB,

    -- Personalized Insights
    why_good_for_user TEXT,
    why_challenging_for_user TEXT,
    tips TEXT,

    -- Metadata
    calculated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- Recalculate after this date

    UNIQUE(user_id, asset_id)
);

CREATE INDEX idx_compatibility_user ON user_asset_compatibility(user_id);
CREATE INDEX idx_compatibility_score ON user_asset_compatibility(overall_compatibility_score DESC);

-- ============================================================================
-- POLYMARKET INTEGRATION
-- ============================================================================

CREATE TABLE polymarket_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Polymarket Data
    polymarket_id VARCHAR(255) UNIQUE NOT NULL,
    polymarket_slug VARCHAR(255),
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),

    -- Timing
    start_date TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    resolution_date TIMESTAMP,

    -- Outcomes
    outcomes JSONB NOT NULL, -- [{id, name, description}]
    current_odds JSONB, -- {outcome_id: probability}
    volume DECIMAL,
    liquidity DECIMAL,

    -- Astrological Analysis
    astrological_prediction JSONB, -- {predicted_outcome, confidence, reasoning}
    favorable_outcome_id VARCHAR(255),
    favorable_outcome_name TEXT,
    confidence_score DECIMAL(3,2),
    astrological_factors JSONB, -- Key astrological factors influencing prediction

    -- Related Assets
    related_asset_ids UUID[], -- Assets that might be affected by this event

    -- Validation
    actual_outcome_id VARCHAR(255),
    actual_outcome_name TEXT,
    prediction_correct BOOLEAN,
    resolved_at TIMESTAMP,

    -- Analysis Tracking
    last_analyzed_at TIMESTAMP,
    analysis_count INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_polymarket_events_active ON polymarket_events(is_active, end_date);
CREATE INDEX idx_polymarket_events_category ON polymarket_events(category);
CREATE INDEX idx_polymarket_events_end_date ON polymarket_events(end_date);

-- ============================================================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Transaction Details
    amount DECIMAL NOT NULL,
    currency VARCHAR(20) NOT NULL, -- SOL, ETH, USDC, USDT, USD
    payment_method VARCHAR(50) NOT NULL, -- solana, ethereum, base, apple_iap, google_iap, stripe

    -- Crypto Specific
    transaction_hash VARCHAR(255), -- Blockchain transaction hash
    from_wallet VARCHAR(255),
    to_wallet VARCHAR(255),
    blockchain VARCHAR(50), -- solana, ethereum, base
    confirmation_count INTEGER,

    -- IAP Specific
    receipt_data TEXT,
    app_store_transaction_id VARCHAR(255),
    original_transaction_id VARCHAR(255),
    product_id VARCHAR(255),

    -- Fulfillment
    credits_granted INTEGER, -- Number of prediction credits
    subscription_days_granted INTEGER, -- Days added to subscription
    subscription_tier_granted VARCHAR(50),

    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirming, completed, failed, refunded
    failure_reason TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    refunded_at TIMESTAMP,

    -- Revenue tracking
    usd_value DECIMAL, -- Converted value in USD
    platform_fee DECIMAL,
    net_revenue DECIMAL
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);

CREATE TABLE user_credits (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    credits_balance INTEGER DEFAULT 0,
    credits_used_lifetime INTEGER DEFAULT 0,
    credits_purchased_lifetime INTEGER DEFAULT 0,
    last_credit_purchase_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- USAGE TRACKING
-- ============================================================================

CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,

    -- Action tracking
    action VARCHAR(50) NOT NULL, -- prediction_requested, result_viewed, shared, feedback_given

    -- Credits
    credits_used INTEGER DEFAULT 0,
    credits_remaining INTEGER,

    -- Context
    platform VARCHAR(20), -- web, ios, android
    device_info JSONB,
    ip_address INET,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at DESC);

-- ============================================================================
-- ASTROLOGICAL DATA & KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE ephemeris_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL,

    -- Planetary positions
    planetary_positions JSONB NOT NULL, -- {sun: {longitude, latitude, ...}, moon: {...}, ...}

    -- House cusps (for location-specific calculations)
    location_hash VARCHAR(64), -- Hash of lat/lng for caching
    house_cusps JSONB,

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(date, time, timezone, location_hash)
);

CREATE TABLE tarot_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_number INTEGER UNIQUE NOT NULL, -- 0-77
    name VARCHAR(100) NOT NULL,
    suit VARCHAR(20), -- major_arcana, wands, cups, swords, pentacles
    arcana VARCHAR(20), -- major, minor

    -- Interpretations
    upright_meaning TEXT,
    reversed_meaning TEXT,
    upright_financial TEXT, -- Financial context interpretation
    reversed_financial TEXT,

    -- Keywords
    upright_keywords VARCHAR(100)[],
    reversed_keywords VARCHAR(100)[],

    -- Imagery
    symbolism TEXT,
    image_url VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE iching_hexagrams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hexagram_number INTEGER UNIQUE NOT NULL, -- 1-64
    binary_sequence VARCHAR(6) NOT NULL, -- e.g., "111111" for hexagram 1
    chinese_name VARCHAR(50) NOT NULL,
    english_name VARCHAR(100) NOT NULL,

    -- Interpretations
    judgement TEXT NOT NULL,
    image TEXT NOT NULL,
    general_meaning TEXT,
    financial_interpretation TEXT,

    -- Lines (1-6, bottom to top)
    line_interpretations JSONB, -- {1: {changing: "...", stable: "..."}, ...}

    -- Attributes
    trigram_above VARCHAR(50),
    trigram_below VARCHAR(50),
    element_above VARCHAR(20),
    element_below VARCHAR(20),

    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & ANALYTICS
-- ============================================================================

CREATE TABLE prediction_accuracy_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Prediction type breakdown
    prediction_type VARCHAR(50),
    method VARCHAR(50),

    -- Metrics
    total_predictions INTEGER,
    correct_predictions INTEGER,
    incorrect_predictions INTEGER,
    pending_predictions INTEGER,
    accuracy_rate DECIMAL(5,2), -- Percentage

    -- Score distribution
    avg_confidence_score DECIMAL(3,2),
    avg_user_satisfaction DECIMAL(3,2),

    calculated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(period_start, period_end, prediction_type, method)
);

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO system_settings (key, value, description) VALUES
    ('credits_per_prediction', '{"macro": 1, "birth_date": 2, "divination": 1, "compatibility": 1, "polymarket": 1}', 'Credits required for each prediction type'),
    ('free_tier_monthly_limit', '3', 'Number of free predictions per month'),
    ('basic_tier_monthly_limit', '50', 'Number of predictions for basic tier'),
    ('pro_tier_monthly_limit', '-1', 'Number of predictions for pro tier (-1 = unlimited)'),
    ('crypto_payment_wallets', '{"solana": "YOUR_WALLET_ADDRESS", "ethereum": "YOUR_WALLET_ADDRESS"}', 'Wallet addresses for accepting payments'),
    ('maintenance_mode', 'false', 'Enable maintenance mode'),
    ('feature_flags', '{"polymarket": true, "divination": true, "compatibility": true}', 'Feature toggles');

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_astrological_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Credit deduction on prediction creation
CREATE OR REPLACE FUNCTION deduct_credits_on_prediction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE user_credits
        SET
            credits_balance = credits_balance - NEW.credits_used,
            credits_used_lifetime = credits_used_lifetime + NEW.credits_used,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER deduct_credits AFTER UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION deduct_credits_on_prediction();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User dashboard summary
CREATE VIEW user_dashboard_summary AS
SELECT
    u.id as user_id,
    u.username,
    u.subscription_tier,
    uc.credits_balance,
    COUNT(DISTINCT p.id) as total_predictions,
    COUNT(DISTINCT p.id) FILTER (WHERE p.created_at > NOW() - INTERVAL '30 days') as predictions_this_month,
    AVG(p.user_feedback_rating) FILTER (WHERE p.user_feedback_rating IS NOT NULL) as avg_feedback_rating,
    COUNT(DISTINCT uac.id) FILTER (WHERE uac.overall_compatibility_score >= 7) as favorable_assets_count
FROM users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
LEFT JOIN predictions p ON u.id = p.user_id
LEFT JOIN user_asset_compatibility uac ON u.id = uac.user_id
GROUP BY u.id, u.username, u.subscription_tier, uc.credits_balance;

-- Prediction accuracy by type
CREATE VIEW prediction_accuracy_by_type AS
SELECT
    prediction_type,
    method,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE actual_outcome = 'favorable' AND favorability_score >= 7) as correct_favorable,
    COUNT(*) FILTER (WHERE actual_outcome = 'unfavorable' AND favorability_score <= 4) as correct_unfavorable,
    ROUND(AVG(confidence_score)::numeric, 2) as avg_confidence,
    ROUND(AVG(user_feedback_rating)::numeric, 2) as avg_user_rating
FROM predictions
WHERE actual_outcome IS NOT NULL
GROUP BY prediction_type, method;

-- ============================================================================
-- SAMPLE DATA (for development)
-- ============================================================================

-- Insert sample tarot cards (Major Arcana only for brevity)
INSERT INTO tarot_cards (card_number, name, suit, arcana, upright_meaning, reversed_meaning, upright_financial, reversed_financial, upright_keywords, reversed_keywords) VALUES
(0, 'The Fool', 'major_arcana', 'major', 'New beginnings, innocence, spontaneity, free spirit', 'Recklessness, taken advantage of, inconsideration', 'New investment opportunities, taking calculated risks', 'Poor financial decisions, overlooking risks', ARRAY['new beginnings', 'innocence', 'freedom'], ARRAY['recklessness', 'naivety']),
(1, 'The Magician', 'major_arcana', 'major', 'Manifestation, resourcefulness, power, inspired action', 'Manipulation, poor planning, untapped talents', 'Skillful financial management, manifesting wealth', 'Deception in deals, wasted potential', ARRAY['manifestation', 'power', 'action'], ARRAY['manipulation', 'trickery']),
(2, 'The High Priestess', 'major_arcana', 'major', 'Intuition, sacred knowledge, divine feminine, subconscious', 'Secrets, disconnected from intuition, withdrawal', 'Trust your gut on investments, hidden information', 'Ignoring red flags, lack of research', ARRAY['intuition', 'mystery', 'knowledge'], ARRAY['secrets', 'withdrawal']);

-- Insert sample I Ching hexagrams
INSERT INTO iching_hexagrams (hexagram_number, binary_sequence, chinese_name, english_name, judgement, image, general_meaning, financial_interpretation, trigram_above, trigram_below, element_above, element_below) VALUES
(1, '111111', '乾', 'The Creative', 'The Creative works sublime success, Furthering through perseverance.', 'The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.', 'Pure yang energy, powerful creative force, leadership, initiative', 'Strong bull market energy, leadership pays off, initiate new ventures', 'Heaven', 'Heaven', 'Metal', 'Metal'),
(2, '000000', '坤', 'The Receptive', 'The Receptive brings about sublime success, Furthering through the perseverance of a mare.', 'The earth''s condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world.', 'Pure yin energy, receptivity, yielding, support', 'Defensive position, preserve capital, follow market trends', 'Earth', 'Earth', 'Earth', 'Earth'),
(14, '111101', '大有', 'Possession in Great Measure', 'Supreme success.', 'Fire in heaven above: Possession in Great Measure. Thus the superior man curbs evil and furthers good.', 'Great abundance, prosperity, success through virtue', 'Strong accumulation period, hold quality assets, wealth building phase', 'Heaven', 'Fire', 'Metal', 'Fire');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Composite indexes for common queries
CREATE INDEX idx_predictions_user_created ON predictions(user_id, created_at DESC);
CREATE INDEX idx_predictions_user_type ON predictions(user_id, prediction_type);
CREATE INDEX idx_compatibility_user_score ON user_asset_compatibility(user_id, overall_compatibility_score DESC);
CREATE INDEX idx_usage_logs_user_created ON usage_logs(user_id, created_at DESC);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- Full text search indexes (if needed)
CREATE INDEX idx_assets_name_search ON assets USING gin(to_tsvector('english', name));
CREATE INDEX idx_polymarket_events_title_search ON polymarket_events USING gin(to_tsvector('english', title));

-- ============================================================================
-- PERMISSIONS (adjust based on your user roles)
-- ============================================================================

-- Create application user (replace with your actual credentials)
-- CREATE USER astro_app WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE astro_db TO astro_app;
-- GRANT USAGE ON SCHEMA public TO astro_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO astro_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO astro_app;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to cleanup old ephemeris cache (run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_ephemeris_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ephemeris_cache WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Function to expire old compatibility calculations
CREATE OR REPLACE FUNCTION expire_old_compatibility()
RETURNS void AS $$
BEGIN
    DELETE FROM user_asset_compatibility WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
USAGE:
1. Create database: CREATE DATABASE astro_db;
2. Connect to database: \c astro_db
3. Run this schema file: \i schema.sql

MAINTENANCE:
- Run cleanup_old_ephemeris_cache() monthly
- Run expire_old_compatibility() weekly
- Update prediction_accuracy_tracking regularly
- Monitor table sizes and add partitioning if needed

SCALING CONSIDERATIONS:
- Consider partitioning predictions table by created_at (monthly partitions)
- Consider partitioning usage_logs by created_at (monthly partitions)
- Add read replicas for heavy read queries
- Use connection pooling (PgBouncer)
- Consider moving cold data to archive tables

BACKUPS:
- Daily full backups
- Point-in-time recovery enabled
- Test restore procedure monthly
*/
