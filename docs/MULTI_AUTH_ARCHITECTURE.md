# Multi-Authentication Architecture

## Overview

The Astro platform supports a flexible, user-centric authentication system that allows users to:

1. **Sign in with any method**: Wallet, Email, Twitter, Google, Apple
2. **Link multiple methods**: Add additional authentication methods after signup
3. **Unified identity**: One user account, multiple ways to access it

This approach caters to both crypto-native users (wallet-first) and mainstream users (email-first), while allowing seamless transitions between authentication methods.

---

## Supported Authentication Methods

| Method | Primary Use Case | User Type |
|--------|-----------------|-----------|
| **Wallet (Solana)** | Crypto-native users, Phantom users | Web3 |
| **Wallet (Ethereum)** | Ethereum ecosystem users | Web3 |
| **Email/Password** | Traditional signup | Mainstream |
| **Twitter/X OAuth** | Social signup, viral growth | Mainstream |
| **Google OAuth** | Quick signup | Mainstream |
| **Apple OAuth** | iOS users, privacy-focused | Mainstream |

---

## User Journeys

### Journey 1: Crypto-Native User (Wallet-First)

```
1. User visits site
2. Clicks "Connect Wallet"
3. Signs authentication message
4. ✓ Logged in (no email required)
5. Optional: Add email later for notifications
6. Optional: Add Twitter for social features
```

**User Table:**
```json
{
  "id": "user-123",
  "email": null,
  "username": null,
  "primaryAuthMethod": "wallet",
  "emailVerified": false,
  "twitterHandle": null
}
```

**Wallet Connections:**
```json
[
  {
    "walletAddress": "7gxF...abc",
    "blockchain": "solana",
    "isPrimary": true,
    "label": "Main Wallet"
  }
]
```

### Journey 2: Email User Discovers Crypto

```
1. User signs up with email
2. Uses platform normally
3. Discovers crypto payment option
4. Clicks "Add Wallet" in settings
5. Connects Phantom wallet
6. ✓ Can now:
   - Login with email OR wallet
   - Pay with crypto
   - Use wallet for predictions
```

**User Table (Before):**
```json
{
  "id": "user-456",
  "email": "user@example.com",
  "primaryAuthMethod": "email",
  "emailVerified": true
}
```

**User Table (After):**
```json
{
  "id": "user-456",
  "email": "user@example.com",
  "primaryAuthMethod": "email",
  "emailVerified": true
}
```

**Wallet Connections (After):**
```json
[
  {
    "walletAddress": "7gxF...abc",
    "blockchain": "solana",
    "isPrimary": true,
    "linkedAt": "2025-12-10T10:30:00Z"
  }
]
```

### Journey 3: Twitter User Adds Everything

```
1. User signs in with Twitter
2. Later adds email for better recovery
3. Later adds Solana wallet for crypto payments
4. Later adds Ethereum wallet for NFTs
5. ✓ One account, 4 auth methods:
   - Twitter (primary)
   - Email (verified)
   - Solana wallet
   - Ethereum wallet
```

**User Table:**
```json
{
  "id": "user-789",
  "email": "user@example.com",
  "twitterHandle": "@cryptoastro",
  "twitterUserId": "123456789",
  "primaryAuthMethod": "twitter",
  "emailVerified": true
}
```

**OAuth Connections:**
```json
[
  {
    "provider": "twitter",
    "providerUserId": "123456789",
    "providerUsername": "@cryptoastro"
  }
]
```

**Wallet Connections:**
```json
[
  {
    "walletAddress": "7gxF...abc",
    "blockchain": "solana",
    "isPrimary": true,
    "label": "Main Wallet"
  },
  {
    "walletAddress": "0xDEF...456",
    "blockchain": "ethereum",
    "isPrimary": false,
    "label": "NFT Wallet"
  }
]
```

---

## Database Architecture

### Users Table (Core Identity)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,

    -- Optional fields (support wallet-first signup)
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),

    -- Authentication tracking
    primary_auth_method VARCHAR(50) NOT NULL, -- wallet, email, twitter, etc.
    email_verified BOOLEAN DEFAULT false,

    -- Social connections
    twitter_handle VARCHAR(100),
    twitter_user_id VARCHAR(100),

    -- Other fields...
);
```

**Key Design Decisions:**
- ✓ Email is optional (for wallet users)
- ✓ Password is optional (for OAuth/wallet users)
- ✓ Primary auth method tracked for analytics
- ✓ One user ID for all authentication methods

### Wallet Connections Table

```sql
CREATE TABLE wallet_connections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    wallet_address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(50) NOT NULL, -- solana, ethereum, base
    wallet_type VARCHAR(50), -- phantom, metamask, etc.

    is_primary BOOLEAN DEFAULT false,
    verified_at TIMESTAMP NOT NULL,
    label VARCHAR(100),
    domain_name VARCHAR(255), -- ENS/SNS

    UNIQUE(wallet_address, blockchain)
);
```

**Key Design Decisions:**
- ✓ One wallet can only belong to one user
- ✓ Users can have multiple wallets (Solana + Ethereum)
- ✓ Primary wallet designation for default payment method
- ✓ Support for ENS (example.eth) and SNS (example.sol)

### OAuth Connections Table

```sql
CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    provider VARCHAR(50) NOT NULL, -- google, apple, twitter
    provider_user_id VARCHAR(255) NOT NULL,
    provider_username VARCHAR(255),

    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP,

    UNIQUE(provider, provider_user_id)
);
```

**Key Design Decisions:**
- ✓ One OAuth account can only belong to one user
- ✓ Users can link multiple OAuth providers
- ✓ Tokens stored for API access (Twitter API for posts, etc.)

### Wallet Nonces Table (Security)

```sql
CREATE TABLE wallet_nonces (
    id UUID PRIMARY KEY,

    wallet_address VARCHAR(255) NOT NULL,
    blockchain VARCHAR(50) NOT NULL,
    nonce VARCHAR(64) NOT NULL,
    message TEXT NOT NULL,

    used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NOT NULL,

    UNIQUE(wallet_address, blockchain, nonce)
);
```

**Key Design Decisions:**
- ✓ One-time use nonces (prevent replay attacks)
- ✓ Time-limited (5 minute expiration)
- ✓ Cleaned up after use or expiration

### Account Linking Requests Table

```sql
CREATE TABLE account_linking_requests (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),

    link_type VARCHAR(50) NOT NULL, -- email, twitter, wallet
    link_identifier VARCHAR(255) NOT NULL,
    verification_code VARCHAR(10),
    verification_token VARCHAR(255),

    status VARCHAR(50) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL
);
```

**Key Design Decisions:**
- ✓ Track pending linking requests
- ✓ Email verification codes (6 digits)
- ✓ Secure tokens for OAuth callbacks
- ✓ Expiration for security

---

## Authentication Flows

### Flow 1: Wallet Sign-In (New User)

```
┌─────────────────┐
│  User clicks    │
│ "Connect Wallet"│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend: Detect wallet provider    │
│ (Phantom, MetaMask, etc.)           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /auth/wallet/nonce             │
│ { walletAddress, blockchain }       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend: Generate nonce             │
│ Return message to sign              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend: Request signature         │
│ provider.signMessage(message)       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /auth/wallet/verify            │
│ { walletAddress, signature, nonce } │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ 1. Verify signature                 │
│ 2. Check if wallet exists in DB     │
│ 3. NOT FOUND → Create new user      │
│ 4. Create wallet_connection         │
│ 5. Generate JWT tokens              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Return: { user, tokens, isNewUser } │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Frontend: Store tokens              │
│ Redirect to onboarding or dashboard │
└─────────────────────────────────────┘
```

### Flow 2: Wallet Sign-In (Existing User)

```
Same as Flow 1, except:

Step: Check if wallet exists in DB
  ↓
FOUND → Load existing user
  ↓
Generate JWT tokens
  ↓
Return: { user, tokens, isNewUser: false }
  ↓
Redirect to dashboard
```

### Flow 3: Email User Links Wallet

```
┌─────────────────┐
│ User logged in  │
│ with email      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User goes to Settings > Add Wallet  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /account/link/wallet/nonce     │
│ (Authenticated request)             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend: Generate nonce             │
│ Message: "Link wallet to user@..."  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User signs message in wallet        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /account/link/wallet/verify    │
│ { walletAddress, signature, nonce } │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ 1. Verify signature                 │
│ 2. Check wallet not linked to other │
│ 3. Create wallet_connection         │
│ 4. Link to current user             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Success: Wallet linked              │
│ User can now login with wallet      │
└─────────────────────────────────────┘
```

### Flow 4: Wallet User Links Email

```
┌─────────────────┐
│ User logged in  │
│ with wallet     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User goes to Settings > Add Email   │
│ Enters: user@example.com            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /account/link/email            │
│ { email }                           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ 1. Check email not already linked   │
│ 2. Generate 6-digit code            │
│ 3. Send verification email          │
│ 4. Create linking_request           │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ User receives email with code       │
│ Enters code: 123456                 │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ POST /account/link/email/verify     │
│ { linkingRequestId, code }          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend:                            │
│ 1. Verify code matches              │
│ 2. Update user.email                │
│ 3. Set email_verified = true        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Success: Email linked               │
│ User can now login with email       │
└─────────────────────────────────────┘
```

---

## Security Considerations

### 1. Wallet Signature Verification

**Why we verify signatures:**
- Proves user owns the private key
- No password needed
- Blockchain-native authentication
- Cannot be forged or replayed

**Implementation:**
```typescript
// Solana
function verifySignature(message: string, signature: Uint8Array, publicKey: string): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const pubKeyBytes = new PublicKey(publicKey).toBytes();
  return nacl.sign.detached.verify(messageBytes, signature, pubKeyBytes);
}

// Ethereum
function verifySignature(message: string, signature: string, address: string): boolean {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === address.toLowerCase();
}
```

### 2. Nonce Management

**Prevents replay attacks:**
- Each nonce used only once
- Time-limited (5 minutes)
- Random, unpredictable
- Cleaned up after use

**Example attack prevented:**
```
Attacker intercepts signature → tries to replay
Backend checks nonce → already used
Request rejected ✓
```

### 3. Account Linking Validation

**Prevents account takeover:**
```
User A (wallet: 0xABC) tries to link email: victim@example.com
Backend checks: email already linked to User B
Request rejected ✓
```

**Prevents wallet theft:**
```
User A (email: attacker@...) tries to link wallet: 0xDEF (owned by User B)
Backend checks: wallet already linked to User B
Request rejected ✓
```

### 4. Rate Limiting

**Per authentication method:**
- Nonce requests: 10/hour per wallet
- Verification attempts: 5 per nonce
- Email linking: 3/hour per user
- OAuth redirects: 10/hour per user

---

## User Experience Benefits

### For Crypto Users
✓ **No email required** - Sign in instantly with wallet
✓ **Privacy-focused** - Minimal personal info collected
✓ **Native experience** - Familiar wallet authentication
✓ **Multi-chain support** - Use Solana OR Ethereum

### For Mainstream Users
✓ **Familiar signup** - Email/Google/Apple/Twitter
✓ **No wallet needed** - Can use platform without crypto
✓ **Easy crypto onboarding** - Add wallet when ready
✓ **Account recovery** - Email fallback if wallet lost

### For All Users
✓ **Flexible authentication** - Login with any linked method
✓ **Account consolidation** - One identity, multiple methods
✓ **Secure by default** - Cryptographic verification
✓ **Future-proof** - Easy to add new auth methods

---

## Analytics & Insights

Track user authentication patterns:

```sql
-- Primary auth method distribution
SELECT primary_auth_method, COUNT(*)
FROM users
GROUP BY primary_auth_method;

-- wallet: 45%
-- email: 30%
-- google: 15%
-- twitter: 10%

-- Multi-auth adoption
SELECT
  COUNT(*) FILTER (WHERE has_wallet AND has_email) as wallet_email,
  COUNT(*) FILTER (WHERE has_wallet AND has_twitter) as wallet_twitter,
  COUNT(*) FILTER (WHERE has_email AND has_twitter) as email_twitter
FROM user_auth_summary;

-- Wallet distribution by blockchain
SELECT blockchain, COUNT(*)
FROM wallet_connections
GROUP BY blockchain;

-- solana: 60%
-- ethereum: 35%
-- base: 5%
```

---

## Future Enhancements

### Phase 2: Additional Auth Methods
- **Farcaster** - Decentralized social protocol
- **Lens Protocol** - Web3 social graph
- **Discord** - Community-driven signup
- **Passkeys** - WebAuthn for passwordless

### Phase 3: Advanced Features
- **Social recovery** - Friends can help recover account
- **Multi-sig accounts** - Require multiple wallets to approve
- **Session keys** - Limited-scope keys for dapps
- **Account abstraction** - Smart contract wallets

### Phase 4: Cross-Platform Identity
- **Verifiable credentials** - Portable identity proofs
- **DID integration** - Decentralized identifiers
- **Cross-chain identity** - Same identity across chains
- **Privacy-preserving auth** - Zero-knowledge proofs

---

## Implementation Checklist

### Backend
- [ ] Implement wallet signature verification (Solana + Ethereum)
- [ ] Create nonce generation and validation system
- [ ] Build account linking request management
- [ ] Add rate limiting per auth method
- [ ] Implement nonce cleanup cron job
- [ ] Add comprehensive logging for security events

### Frontend (Web)
- [ ] Integrate Phantom wallet SDK
- [ ] Integrate MetaMask / WalletConnect
- [ ] Build wallet connection UI
- [ ] Create account linking settings page
- [ ] Add email verification flow
- [ ] Implement Twitter OAuth flow
- [ ] Build multi-auth dashboard

### Frontend (Mobile)
- [ ] Integrate WalletConnect v2
- [ ] Build mobile wallet connection flow
- [ ] Add biometric authentication option
- [ ] Create account linking screens
- [ ] Implement deep linking for OAuth

### Testing
- [ ] Unit tests for signature verification
- [ ] Integration tests for all auth flows
- [ ] E2E tests for account linking
- [ ] Security testing (replay attacks, rate limits)
- [ ] Cross-browser testing (wallet extensions)

### Documentation
- [x] API documentation
- [x] Web3 authentication guide
- [x] Architecture documentation
- [ ] User-facing help docs
- [ ] Video tutorials

---

**Document Version**: 1.0
**Last Updated**: 2025-12-10
**Maintained By**: Auth Team
