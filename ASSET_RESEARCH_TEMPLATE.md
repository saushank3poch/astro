# Asset Birth Date Research Template

This document provides a standardized process for researching and documenting asset "birth dates" for astrological analysis.

---

## 🎯 Research Objectives

For each asset, we need to determine:
1. ✅ **Birth Date** (most important)
2. ✅ **Birth Time** (if available)
3. ✅ **Birth Location** (if applicable)
4. ✅ **Confidence Level** (how certain we are)
5. ✅ **Source** (where we found this information)
6. ✅ **Alternative Dates** (other potential birth dates to consider)

---

## 📊 Asset Categories

### Cryptocurrency Assets

**Primary Birth Date Options (in order of preference):**

1. **Genesis Block Timestamp** (HIGHEST CONFIDENCE)
   - The exact timestamp when the blockchain launched
   - Example: Bitcoin - January 3, 2009, 18:15:05 UTC
   - Sources: Block explorers, official documentation

2. **Token Launch Date** (HIGH CONFIDENCE)
   - When the token first became tradeable
   - For ERC-20 tokens: Contract deployment date
   - For DEX launches: First liquidity pool creation
   - Sources: Etherscan, BSCScan, Solscan, CoinGecko

3. **Mainnet Launch** (HIGH CONFIDENCE)
   - When the project launched its own blockchain
   - Example: Ethereum - July 30, 2015
   - Sources: Official announcements, blockchain explorers

4. **Whitepaper Release** (MEDIUM CONFIDENCE)
   - Date of concept introduction
   - Less preferred than actual launch
   - Example: Bitcoin whitepaper - October 31, 2008
   - Use only if no launch date available

5. **ICO/IDO Date** (LOW-MEDIUM CONFIDENCE)
   - Initial coin offering date
   - Not the same as actual launch
   - Use as alternative date only

**Birth Time Considerations:**
- Genesis blocks have exact timestamps ✅
- Token launches usually have block timestamps ✅
- Use UTC timezone for all crypto assets

**Birth Location:**
- Most crypto assets are "global" - no specific location
- For company-backed tokens: Use company HQ location
- For protocol launches: Use founder/team location if known
- Otherwise: Mark as "Global" or "Unknown"

### Stock Assets

**Primary Birth Date Options (in order of preference):**

1. **IPO Date** (HIGHEST CONFIDENCE)
   - Initial Public Offering date
   - The day shares first traded on public exchange
   - Example: Apple - December 12, 1980
   - Sources: Company investor relations, SEC filings, exchange websites

2. **Direct Listing Date** (HIGH CONFIDENCE)
   - For companies that went public via direct listing
   - Example: Spotify - April 3, 2018
   - Sources: Exchange announcements

3. **SPAC Merger Completion** (HIGH CONFIDENCE)
   - For companies that went public via SPAC
   - Use the date the merger completed, not announcement
   - Sources: SEC Form 8-K

4. **Company Incorporation Date** (MEDIUM CONFIDENCE)
   - Legal formation date
   - Less preferred than IPO
   - Use only if IPO date unavailable

**Birth Time Considerations:**
- Stock exchanges have opening bell times
- NYSE: 9:30 AM EST
- NASDAQ: 9:30 AM EST
- Use market open time as default if exact time unknown
- Some companies ring opening bell at specific time (check press releases)

**Birth Location:**
- Primary exchange location:
  - NYSE/NASDAQ: New York City (40.7128° N, 74.0060° W)
  - London Stock Exchange: London, UK
  - Tokyo Stock Exchange: Tokyo, Japan
  - Hong Kong Stock Exchange: Hong Kong
- Alternative: Company headquarters location

---

## 📝 Research Process

### Step 1: Identify the Asset

**Asset Information Needed:**
- Symbol/Ticker (e.g., BTC, AAPL)
- Full name (e.g., Bitcoin, Apple Inc.)
- Asset type (crypto, stock, commodity, etc.)
- Category (Layer1, DeFi, Tech Stock, etc.)

### Step 2: Primary Source Research

**For Crypto:**
1. Check CoinGecko.com or CoinMarketCap.com "About" section
2. Check official project website and documentation
3. Check blockchain explorer for genesis block or contract deployment
4. Search for official launch announcements (Medium, Twitter, blog)
5. Check GitHub repository for first commit or release notes

**For Stocks:**
1. Check company investor relations website
2. Search SEC Edgar database for S-1 filing
3. Check exchange websites (NYSE, NASDAQ)
4. Search financial news sites (Bloomberg, Reuters, CNBC)
5. Check company Wikipedia page (verify with primary sources)

### Step 3: Verify with Secondary Sources

- Cross-reference with at least 2-3 independent sources
- Check for conflicting information
- Document any discrepancies

### Step 4: Determine Confidence Level

**High Confidence:**
- Multiple reliable sources agree
- Exact timestamp available
- Official documentation confirms
- No conflicting information

**Medium Confidence:**
- 1-2 sources found
- Date confirmed but time unclear
- Minor discrepancies between sources
- Alternative dates exist but primary is most likely

**Low Confidence:**
- Only 1 source found
- Conflicting information from different sources
- Date is approximate or estimated
- Relies on secondary indicators

**Unknown:**
- No reliable information found
- Will need to use category-based element assignment

### Step 5: Document Alternative Dates

If multiple potential birth dates exist, document them all:
- Whitepaper release vs. mainnet launch
- Testnet vs. mainnet
- Private sale vs. public launch
- Incorporation vs. IPO

### Step 6: Format for Database Entry

Use the template below (copy and fill in).

---

## 📋 Asset Research Entry Template

```typescript
{
  // Basic Information
  symbol: 'BTC',
  name: 'Bitcoin',
  asset_type: 'crypto',
  category: 'Layer1',
  exchange: 'Multiple (originated on Bitcoin network)',

  // Birth Date Information
  birth_date: '2009-01-03',
  birth_time: '18:15:05',
  birth_timezone: 'UTC',
  birth_location: {
    lat: 0,
    lng: 0,
    city: 'Unknown',
    country: 'Global'
  },

  // Confidence & Source
  birth_date_source: 'Genesis Block #0 timestamp',
  birth_date_confidence: 'high',

  // Alternative Dates (optional)
  alternative_birth_dates: [
    {
      date: '2008-10-31',
      time: null,
      source: 'Bitcoin Whitepaper Release',
      confidence: 'medium',
      reasoning: 'Conceptual birth vs. actual launch'
    }
  ],

  // Research Notes
  research_notes: 'Genesis block contains message: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"',
  researched_by: 'researcher_name',
  researched_at: '2025-12-18',

  // Sources (URLs)
  sources: [
    'https://blockchain.info/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
    'https://bitcoin.org/bitcoin.pdf',
    'https://en.bitcoin.it/wiki/Genesis_block'
  ]
}
```

---

## 🔍 Example: Researched Assets

### Example 1: Bitcoin (High Confidence)

```typescript
{
  symbol: 'BTC',
  name: 'Bitcoin',
  asset_type: 'crypto',
  category: 'Layer1',
  birth_date: '2009-01-03',
  birth_time: '18:15:05',
  birth_timezone: 'UTC',
  birth_location: { lat: 0, lng: 0, city: 'Unknown', country: 'Global' },
  birth_date_source: 'Genesis Block #0',
  birth_date_confidence: 'high',
  sources: ['https://blockchain.info/block/000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f']
}
```

### Example 2: Ethereum (High Confidence)

```typescript
{
  symbol: 'ETH',
  name: 'Ethereum',
  asset_type: 'crypto',
  category: 'Layer1',
  birth_date: '2015-07-30',
  birth_time: '15:26:13',
  birth_timezone: 'UTC',
  birth_location: { lat: 0, lng: 0, city: 'Unknown', country: 'Global' },
  birth_date_source: 'Genesis Block',
  birth_date_confidence: 'high',
  sources: ['https://etherscan.io/block/0']
}
```

### Example 3: Apple Inc. (High Confidence)

```typescript
{
  symbol: 'AAPL',
  name: 'Apple Inc.',
  asset_type: 'stock',
  category: 'Tech',
  exchange: 'NASDAQ',
  birth_date: '1980-12-12',
  birth_time: '09:30:00',
  birth_timezone: 'America/New_York',
  birth_location: { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' },
  birth_date_source: 'IPO on NASDAQ',
  birth_date_confidence: 'high',
  alternative_birth_dates: [
    {
      date: '1976-04-01',
      source: 'Company Incorporation',
      confidence: 'medium'
    }
  ],
  sources: [
    'https://investor.apple.com',
    'https://www.nasdaq.com/market-activity/stocks/aapl'
  ]
}
```

### Example 4: Solana (High Confidence)

```typescript
{
  symbol: 'SOL',
  name: 'Solana',
  asset_type: 'crypto',
  category: 'Layer1',
  birth_date: '2020-03-16',
  birth_time: '00:00:00',
  birth_timezone: 'UTC',
  birth_location: { lat: 37.7749, lng: -122.4194, city: 'San Francisco', country: 'USA' },
  birth_date_source: 'Mainnet Beta Launch',
  birth_date_confidence: 'high',
  research_notes: 'Founded by Anatoly Yakovenko in San Francisco',
  sources: [
    'https://solana.com',
    'https://solanabeach.io/block/0'
  ]
}
```

### Example 5: Unknown Time Example

```typescript
{
  symbol: 'LINK',
  name: 'Chainlink',
  asset_type: 'crypto',
  category: 'Oracle',
  birth_date: '2017-09-19',
  birth_time: null, // Time not found
  birth_timezone: 'UTC',
  birth_location: { lat: 0, lng: 0, city: 'Unknown', country: 'Global' },
  birth_date_source: 'ICO Date',
  birth_date_confidence: 'medium',
  research_notes: 'Exact launch time unclear, using ICO date as proxy',
  sources: ['https://blog.chain.link/chainlink-ico/']
}
```

---

## 🎯 Priority Asset List

### Top 25 Crypto Assets (Start Here)

**Layer 1 Blockchains:**
1. ☐ Bitcoin (BTC)
2. ☐ Ethereum (ETH)
3. ☐ Solana (SOL)
4. ☐ Cardano (ADA)
5. ☐ Avalanche (AVAX)
6. ☐ Polkadot (DOT)
7. ☐ Polygon (MATIC)
8. ☐ Cosmos (ATOM)
9. ☐ Algorand (ALGO)
10. ☐ Near Protocol (NEAR)

**DeFi & Finance:**
11. ☐ Chainlink (LINK)
12. ☐ Uniswap (UNI)
13. ☐ Aave (AAVE)
14. ☐ Maker (MKR)
15. ☐ Curve (CRV)

**Exchange Tokens:**
16. ☐ Binance Coin (BNB)
17. ☐ Cronos (CRO)
18. ☐ FTX Token (FTT) - Note: Defunct, for historical analysis

**Stablecoins:**
19. ☐ USDC
20. ☐ USDT
21. ☐ DAI

**Others:**
22. ☐ Dogecoin (DOGE)
23. ☐ Shiba Inu (SHIB)
24. ☐ Litecoin (LTC)
25. ☐ XRP (Ripple)

### Top 25 US Stocks (Start Here)

**Technology:**
1. ☐ Apple (AAPL)
2. ☐ Microsoft (MSFT)
3. ☐ Amazon (AMZN)
4. ☐ Alphabet/Google (GOOGL)
5. ☐ Meta/Facebook (META)
6. ☐ Tesla (TSLA)
7. ☐ NVIDIA (NVDA)
8. ☐ Netflix (NFLX)
9. ☐ Adobe (ADBE)
10. ☐ Salesforce (CRM)

**Finance:**
11. ☐ JPMorgan Chase (JPM)
12. ☐ Bank of America (BAC)
13. ☐ Visa (V)
14. ☐ Mastercard (MA)
15. ☐ Goldman Sachs (GS)

**Healthcare:**
16. ☐ Johnson & Johnson (JNJ)
17. ☐ UnitedHealth (UNH)
18. ☐ Pfizer (PFE)
19. ☐ AbbVie (ABBV)

**Consumer:**
20. ☐ Coca-Cola (KO)
21. ☐ Walmart (WMT)
22. ☐ Procter & Gamble (PG)
23. ☐ Nike (NKE)
24. ☐ Starbucks (SBUX)
25. ☐ McDonald's (MCD)

---

## 🛠️ Useful Resources

### Crypto Research Sources

**Blockchain Explorers:**
- Bitcoin: https://blockchain.info, https://blockchair.com
- Ethereum: https://etherscan.io
- Solana: https://solscan.io, https://solanabeach.io
- BSC: https://bscscan.com
- Polygon: https://polygonscan.com

**Data Aggregators:**
- CoinGecko: https://coingecko.com (check "Info" tab)
- CoinMarketCap: https://coinmarketcap.com (check "About" section)
- Messari: https://messari.io (detailed project profiles)

**Official Sources:**
- Project websites and documentation
- GitHub repositories (check first commit/release)
- Official Medium/blog announcements
- Twitter archives (for launch announcements)

### Stock Research Sources

**Official Sources:**
- SEC Edgar: https://sec.gov/edgar/searchedgar/companysearch.html
- Company investor relations websites
- Exchange websites: NYSE.com, NASDAQ.com

**Financial Data:**
- Yahoo Finance: https://finance.yahoo.com
- Bloomberg: https://bloomberg.com
- Reuters: https://reuters.com
- MarketWatch: https://marketwatch.com

**Historical Data:**
- IPOScoop: https://iposcoop.com
- Wikipedia (verify with primary sources)
- Company annual reports

---

## 📊 Research Tracking Spreadsheet

Create a spreadsheet with these columns:

| Symbol | Name | Type | Category | Birth Date | Birth Time | Location | Confidence | Source | Status | Researcher | Notes |
|--------|------|------|----------|------------|------------|----------|------------|--------|--------|------------|-------|
| BTC | Bitcoin | crypto | Layer1 | 2009-01-03 | 18:15:05 | Global | high | Genesis Block | ✅ Complete | John | - |
| AAPL | Apple Inc. | stock | Tech | 1980-12-12 | 09:30:00 | NYC | high | IPO | ✅ Complete | Sarah | - |
| ETH | Ethereum | crypto | Layer1 | 2015-07-30 | 15:26:13 | Global | high | Genesis Block | ✅ Complete | John | - |

**Status Options:**
- 📝 Not Started
- 🔍 Researching
- ⏳ Pending Verification
- ✅ Complete
- ❓ Needs Review

---

## 🚨 Common Pitfalls & Tips

### Pitfall 1: Confusing Announcement with Launch
❌ **Wrong:** Using the date a project was announced
✅ **Right:** Using the date the token/stock became tradeable

### Pitfall 2: Using Testnet Launch
❌ **Wrong:** Using testnet launch date for crypto
✅ **Right:** Using mainnet launch date (unless testnet IS the main chain)

### Pitfall 3: Ignoring Timezones
❌ **Wrong:** Converting UTC to local time without noting it
✅ **Right:** Always store in UTC or note the timezone clearly

### Pitfall 4: No Source Documentation
❌ **Wrong:** "I found it somewhere online"
✅ **Right:** Provide exact URL and archive link if possible

### Pitfall 5: Relying on Single Source
❌ **Wrong:** Using only Wikipedia or one blog post
✅ **Right:** Cross-reference with 2-3 independent sources

### Tips for Efficient Research:
1. **Batch by category** - Research all Layer1 blockchains together
2. **Use templates** - Copy-paste the entry template to speed up
3. **Document as you go** - Don't try to remember sources later
4. **Flag uncertainties** - If unsure, mark it and move on
5. **Set time limits** - If can't find in 15 minutes, mark as "unknown" and continue

---

## ✅ Quality Checklist

Before submitting an asset entry, verify:

- [ ] Symbol and name are correct
- [ ] Asset type and category are assigned
- [ ] Birth date is in YYYY-MM-DD format
- [ ] Birth time is in HH:MM:SS format (if available) or null
- [ ] Timezone is specified
- [ ] Location coordinates are correct (or marked Unknown/Global)
- [ ] Confidence level is assigned and justified
- [ ] At least 1 source URL is provided
- [ ] Alternative dates documented (if applicable)
- [ ] Research notes explain any ambiguities
- [ ] Cross-referenced with 2+ sources (for high confidence)

---

## 📈 Progress Tracking

**Target:** 50-100 assets researched and entered

**Current Status:**
- Crypto assets researched: 0 / 50
- Stock assets researched: 0 / 50
- High confidence: 0
- Medium confidence: 0
- Low confidence: 0
- Unknown: 0

**Estimated Time:**
- ~15-20 minutes per asset (with sources)
- ~2 hours per 10 assets
- ~20 hours for 100 assets (with breaks)

**Batch Progress:**
- [ ] Batch 1: Top 10 crypto (BTC, ETH, SOL, BNB, etc.)
- [ ] Batch 2: Top 10 stocks (AAPL, MSFT, GOOGL, etc.)
- [ ] Batch 3: Next 10 crypto
- [ ] Batch 4: Next 10 stocks
- [ ] Batch 5: Remainder

---

## 🤝 Team Coordination

**If multiple researchers:**

1. **Divide by category**
   - Researcher A: Crypto Layer1 + DeFi
   - Researcher B: Crypto other + Stocks tech
   - Researcher C: Stocks finance/consumer/healthcare

2. **Use shared spreadsheet** (Google Sheets)
   - Real-time updates
   - Avoid duplicate work
   - Easy to review progress

3. **Daily standup** (5 minutes)
   - What I researched yesterday
   - What I'll research today
   - Any blockers or questions

4. **Quality review process**
   - Peer review: Each researcher reviews another's work
   - Final review: Backend developer validates data structure
   - Spot check: 20% random sample deep-dive verification

---

## 📞 Need Help?

**If you encounter:**
- **Conflicting sources**: Document both, mark confidence as "medium", flag for review
- **No sources found**: Mark as "unknown", use category-based assignment instead
- **Unclear if date is correct**: Mark confidence as "low", provide reasoning
- **Technical questions**: Ask backend developer
- **Astrology questions**: Save for consultant review

**Questions to ask before spending too much time:**
1. Is this asset important enough? (Top 100 by market cap?)
2. Can we proceed without exact birth time? (Yes, we can)
3. Should we skip and move on? (If stuck >30 min)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-18
**Owner:** Phase 2 Research Team

**Ready to start? Pick an asset from the Priority List and fill out the template!**
