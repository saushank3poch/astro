# Web3 Wallet Authentication Guide

## Overview

The Astro platform supports multiple authentication methods with seamless account linking:

**Authentication Methods:**
1. **Wallet (Web3)**: Solana (Phantom, Solflare) + Ethereum (MetaMask, Coinbase Wallet, WalletConnect)
2. **Email/Password**: Traditional authentication
3. **OAuth**: Google, Apple, Twitter/X

**Account Linking:**
- Users can link multiple authentication methods to a single account
- Crypto users can sign in with wallet, then add email/Twitter
- Email users can add wallet addresses later
- One unified user ID across all auth methods

---

## Wallet Authentication Flow

### 1. Sign-In/Sign-Up with Wallet

#### Step 1: Request Nonce

**Endpoint:** `POST /auth/wallet/nonce`

**Request:**
```json
{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana"
}
```

**Response (200):**
```json
{
  "nonce": "a1b2c3d4e5f6",
  "message": "Sign this message to authenticate with Astro:\n\nNonce: a1b2c3d4e5f6\nTimestamp: 2025-12-10T10:00:00Z\n\nThis request will not trigger a blockchain transaction or cost any gas fees.",
  "expiresAt": "2025-12-10T10:05:00Z"
}
```

**Purpose:**
- Generate a unique nonce (number used once) for the wallet
- Create a message for the user to sign
- Prevent replay attacks

#### Step 2: User Signs Message

**Client-Side (Phantom Example):**
```typescript
import { Connection, PublicKey } from '@solana/web3.js';

const provider = window.phantom?.solana;

const encodedMessage = new TextEncoder().encode(message);
const signedMessage = await provider.signMessage(encodedMessage, "utf8");

// signedMessage contains signature bytes
```

**Client-Side (MetaMask Example):**
```typescript
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, walletAddress]
});
```

#### Step 3: Verify Signature & Authenticate

**Endpoint:** `POST /auth/wallet/verify`

**Request:**
```json
{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana",
  "signature": "5k2j...xyz",
  "nonce": "a1b2c3d4e5f6"
}
```

**Response (200) - Existing User:**
```json
{
  "user": {
    "id": "user-uuid",
    "username": "cryptouser",
    "email": null,
    "twitterHandle": null,
    "primaryAuthMethod": "wallet",
    "wallets": [
      {
        "address": "7gxF...abc",
        "blockchain": "solana",
        "isPrimary": true,
        "label": "Main Wallet"
      }
    ],
    "subscriptionTier": "free"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  },
  "isNewUser": false
}
```

**Response (201) - New User:**
```json
{
  "user": {
    "id": "user-uuid",
    "username": null,
    "email": null,
    "twitterHandle": null,
    "primaryAuthMethod": "wallet",
    "wallets": [
      {
        "address": "7gxF...abc",
        "blockchain": "solana",
        "isPrimary": true
      }
    ],
    "subscriptionTier": "free",
    "onboardingRequired": true
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  },
  "isNewUser": true,
  "nextSteps": [
    "Set username",
    "Add email (optional)",
    "Add Twitter (optional)",
    "Complete birth chart"
  ]
}
```

---

## Account Linking

### Scenario 1: Wallet User Adds Email

**Step 1: Request Email Verification**

**Endpoint:** `POST /account/link/email`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "linkingRequestId": "request-uuid",
  "email": "user@example.com",
  "status": "pending",
  "message": "Verification code sent to user@example.com",
  "expiresAt": "2025-12-10T10:15:00Z"
}
```

**Backend Actions:**
- Send verification email with 6-digit code
- Create linking request in database

**Step 2: Verify Email Code**

**Endpoint:** `POST /account/link/email/verify`

**Request:**
```json
{
  "linkingRequestId": "request-uuid",
  "verificationCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "wallets": [...],
    "updatedAt": "2025-12-10T10:05:00Z"
  }
}
```

### Scenario 2: Wallet User Adds Twitter/X

**Step 1: Initiate Twitter OAuth**

**Endpoint:** `GET /account/link/twitter`

**Response (302):**
Redirects to Twitter OAuth flow

**Query Parameters:**
```
https://twitter.com/i/oauth2/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://app.astro.com/auth/twitter/callback&
  scope=tweet.read users.read&
  state=user-uuid-encrypted&
  code_challenge=...&
  code_challenge_method=S256
```

**Step 2: Handle Callback**

**Endpoint:** `GET /auth/twitter/callback`

**Query Parameters:**
- `code`: OAuth authorization code
- `state`: Encrypted user ID

**Response (302):**
Redirects to app with success message

**Backend Actions:**
- Exchange code for access token
- Fetch Twitter profile (username, user_id)
- Link to user account
- Store in oauth_connections table

**Step 3: Confirm Linking**

User is redirected to app, which calls:

**Endpoint:** `GET /auth/me`

**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "username": "cryptouser",
  "twitterHandle": "@astrouser",
  "twitterUserId": "123456789",
  "primaryAuthMethod": "wallet",
  "wallets": [...],
  "linkedAccounts": [
    {
      "type": "email",
      "identifier": "user@example.com",
      "verified": true
    },
    {
      "type": "twitter",
      "identifier": "@astrouser",
      "verified": true
    }
  ]
}
```

### Scenario 3: Email User Adds Wallet

**Step 1: Request Wallet Linking Nonce**

**Endpoint:** `POST /account/link/wallet/nonce`

**Request:**
```json
{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana"
}
```

**Response (200):**
```json
{
  "nonce": "x9y8z7",
  "message": "Link this wallet to your Astro account:\n\nNonce: x9y8z7\nTimestamp: 2025-12-10T10:00:00Z\nAccount: user@example.com",
  "expiresAt": "2025-12-10T10:05:00Z"
}
```

**Step 2: Verify Signature & Link**

**Endpoint:** `POST /account/link/wallet/verify`

**Request:**
```json
{
  "walletAddress": "7gxF...abc",
  "blockchain": "solana",
  "signature": "5k2j...xyz",
  "nonce": "x9y8z7",
  "isPrimary": true,
  "label": "My Trading Wallet"
}
```

**Response (200):**
```json
{
  "success": true,
  "wallet": {
    "id": "wallet-uuid",
    "address": "7gxF...abc",
    "blockchain": "solana",
    "isPrimary": true,
    "label": "My Trading Wallet",
    "verifiedAt": "2025-12-10T10:05:00Z"
  },
  "user": {
    "id": "user-uuid",
    "wallets": [
      {
        "address": "7gxF...abc",
        "blockchain": "solana",
        "isPrimary": true,
        "label": "My Trading Wallet"
      }
    ]
  }
}
```

### Scenario 4: Wallet User Adds Additional Wallets

Users can link multiple wallets (e.g., Solana wallet + Ethereum wallet).

**Endpoint:** `POST /account/link/wallet/verify`

Same as Scenario 3, but user is already authenticated.

**Response (200):**
```json
{
  "success": true,
  "wallet": {
    "address": "0xABC...123",
    "blockchain": "ethereum",
    "isPrimary": false,
    "label": "MetaMask"
  },
  "user": {
    "wallets": [
      {
        "address": "7gxF...abc",
        "blockchain": "solana",
        "isPrimary": true,
        "label": "Main Wallet"
      },
      {
        "address": "0xABC...123",
        "blockchain": "ethereum",
        "isPrimary": false,
        "label": "MetaMask"
      }
    ]
  }
}
```

---

## Account Management

### Get Linked Accounts

**Endpoint:** `GET /account/linked`

**Response (200):**
```json
{
  "userId": "user-uuid",
  "primaryAuthMethod": "wallet",
  "linkedMethods": {
    "email": {
      "verified": true,
      "value": "user@example.com",
      "linkedAt": "2025-12-10T10:00:00Z"
    },
    "twitter": {
      "verified": true,
      "handle": "@astrouser",
      "userId": "123456789",
      "linkedAt": "2025-12-10T10:05:00Z"
    },
    "wallets": [
      {
        "id": "wallet-uuid-1",
        "address": "7gxF...abc",
        "blockchain": "solana",
        "walletType": "phantom",
        "isPrimary": true,
        "label": "Main Wallet",
        "domainName": "astrouser.sol",
        "linkedAt": "2025-12-01T00:00:00Z",
        "lastUsedAt": "2025-12-10T09:00:00Z"
      },
      {
        "id": "wallet-uuid-2",
        "address": "0xABC...123",
        "blockchain": "ethereum",
        "walletType": "metamask",
        "isPrimary": false,
        "label": "MetaMask",
        "domainName": "astrouser.eth",
        "linkedAt": "2025-12-05T00:00:00Z",
        "lastUsedAt": "2025-12-08T14:00:00Z"
      }
    ],
    "google": null,
    "apple": null
  }
}
```

### Unlink Account Method

**Endpoint:** `DELETE /account/unlink/:type/:id`

**Parameters:**
- `type`: email, twitter, wallet, google, apple
- `id`: For wallets, the wallet_connection_id; for others, not needed

**Example:** `DELETE /account/unlink/wallet/wallet-uuid-2`

**Response (200):**
```json
{
  "success": true,
  "message": "Wallet 0xABC...123 has been unlinked",
  "remainingMethods": {
    "email": true,
    "wallets": 1
  }
}
```

**Error (400) - Cannot Unlink Last Method:**
```json
{
  "error": {
    "code": "LAST_AUTH_METHOD",
    "message": "Cannot unlink the last authentication method. Please add another method first."
  }
}
```

### Set Primary Wallet

**Endpoint:** `PATCH /account/wallet/:walletId/primary`

**Response (200):**
```json
{
  "success": true,
  "primaryWallet": {
    "id": "wallet-uuid-2",
    "address": "0xABC...123",
    "blockchain": "ethereum"
  }
}
```

### Update Wallet Label

**Endpoint:** `PATCH /account/wallet/:walletId`

**Request:**
```json
{
  "label": "Trading Account"
}
```

**Response (200):**
```json
{
  "id": "wallet-uuid-1",
  "address": "7gxF...abc",
  "blockchain": "solana",
  "label": "Trading Account",
  "updatedAt": "2025-12-10T10:10:00Z"
}
```

---

## Security Considerations

### Signature Verification

**Solana:**
```typescript
import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKey: string
): boolean {
  const messageBytes = new TextEncoder().encode(message);
  const publicKeyBytes = new PublicKey(publicKey).toBytes();

  return nacl.sign.detached.verify(
    messageBytes,
    signature,
    publicKeyBytes
  );
}
```

**Ethereum:**
```typescript
import { ethers } from 'ethers';

function verifySignature(
  message: string,
  signature: string,
  expectedAddress: string
): boolean {
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
}
```

### Nonce Management

- **One-time use**: Each nonce can only be used once
- **Time-limited**: Nonces expire after 5 minutes
- **Unique per wallet**: One active nonce per wallet at a time
- **Cleanup**: Expired nonces are cleaned up daily

### Message Format

Standard message format for signing:

```
Sign this message to authenticate with Astro:

Nonce: {random_string}
Timestamp: {iso_timestamp}
Action: {sign_in|link_wallet}

This request will not trigger a blockchain transaction or cost any gas fees.
```

### Rate Limiting

- **Nonce requests**: 10 per wallet per hour
- **Verification attempts**: 5 per nonce (then nonce is invalidated)
- **Linking requests**: 3 per user per hour

---

## Client-Side Implementation Examples

### React + Phantom (Solana)

```typescript
import { useState } from 'react';

function WalletLogin() {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithPhantom = async () => {
    setIsLoading(true);

    try {
      // 1. Connect wallet
      const provider = window.phantom?.solana;
      const resp = await provider.connect();
      const walletAddress = resp.publicKey.toString();

      // 2. Request nonce
      const nonceRes = await fetch('/api/auth/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          blockchain: 'solana'
        })
      });
      const { nonce, message } = await nonceRes.json();

      // 3. Sign message
      const encodedMessage = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encodedMessage, "utf8");

      // 4. Verify signature
      const verifyRes = await fetch('/api/auth/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          blockchain: 'solana',
          signature: Buffer.from(signature).toString('base64'),
          nonce
        })
      });

      const { user, tokens } = await verifyRes.json();

      // 5. Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);

      // 6. Redirect
      if (user.onboardingRequired) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Wallet sign-in failed:', error);
      alert('Failed to sign in with wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={signInWithPhantom} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Sign In with Phantom'}
    </button>
  );
}
```

### React + MetaMask (Ethereum)

```typescript
async function signInWithMetaMask() {
  // 1. Request accounts
  const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
  const walletAddress = accounts[0];

  // 2. Request nonce
  const nonceRes = await fetch('/api/auth/wallet/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      blockchain: 'ethereum'
    })
  });
  const { nonce, message } = await nonceRes.json();

  // 3. Sign message
  const signature = await ethereum.request({
    method: 'personal_sign',
    params: [message, walletAddress]
  });

  // 4. Verify signature
  const verifyRes = await fetch('/api/auth/wallet/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      walletAddress,
      blockchain: 'ethereum',
      signature,
      nonce
    })
  });

  const { user, tokens } = await verifyRes.json();

  // Store tokens and redirect...
}
```

### React Native + WalletConnect

```typescript
import { useWalletConnect } from '@walletconnect/react-native-dapp';

function MobileWalletAuth() {
  const connector = useWalletConnect();

  const signInWithWallet = async () => {
    if (!connector.connected) {
      await connector.connect();
    }

    const walletAddress = connector.accounts[0];

    // Same flow as web...
  };

  return (
    <Button
      title={connector.connected ? 'Sign In' : 'Connect Wallet'}
      onPress={signInWithWallet}
    />
  );
}
```

---

## User Experience Flow Examples

### Flow 1: Crypto-Native User

```
1. User visits site
2. Clicks "Connect Wallet"
3. Selects Phantom
4. Approves connection in Phantom
5. Signs authentication message
6. Automatically logged in
7. Dashboard shows: "Complete your profile"
   - Add email (optional)
   - Add Twitter (optional)
   - Set username
   - Complete birth chart
```

### Flow 2: Email User Discovers Crypto Payments

```
1. User signs up with email
2. Uses platform with email login
3. Discovers: "Connect wallet to pay with crypto"
4. Clicks "Add Wallet"
5. Connects Phantom
6. Signs linking message
7. Now can:
   - Login with email OR wallet
   - Pay with crypto
   - Receive crypto predictions
```

### Flow 3: Multi-Wallet User

```
1. User has Phantom (Solana) as primary
2. Wants to add MetaMask (Ethereum)
3. Goes to Settings > Linked Accounts
4. Clicks "Add Wallet"
5. Selects Ethereum
6. Connects MetaMask
7. Signs linking message
8. Now has:
   - Solana wallet (primary)
   - Ethereum wallet (secondary)
9. Can login with either
10. Can pay with SOL or ETH
```

---

## ENS / SNS Domain Resolution

If user has ENS (Ethereum Name Service) or SNS (Solana Name Service):

**Example:**
- Wallet: `0xABC...123`
- ENS: `astrouser.eth`

**Display in UI:**
```
astrouser.eth
(0xABC...123)
```

**Resolution:**
Backend resolves ENS/SNS on wallet connection and stores in `domain_name` field.

---

## Error Codes

| Code | Description |
|------|-------------|
| WALLET_NOT_FOUND | Wallet address not found |
| INVALID_SIGNATURE | Signature verification failed |
| NONCE_EXPIRED | Nonce has expired (>5 min) |
| NONCE_USED | Nonce already used |
| WALLET_ALREADY_LINKED | Wallet linked to another account |
| EMAIL_ALREADY_LINKED | Email linked to another account |
| VERIFICATION_CODE_INVALID | Invalid verification code |
| VERIFICATION_CODE_EXPIRED | Code expired (>15 min) |
| LAST_AUTH_METHOD | Cannot unlink last auth method |
| RATE_LIMIT_EXCEEDED | Too many requests |

---

## Best Practices

### For Frontend Developers

1. **Always check wallet provider availability:**
   ```typescript
   if (!window.phantom?.solana?.isPhantom) {
     alert('Please install Phantom wallet');
     return;
   }
   ```

2. **Handle wallet disconnection:**
   ```typescript
   provider.on('disconnect', () => {
     // Clear local storage
     // Redirect to login
   });
   ```

3. **Show clear messaging:**
   - "Sign this message to prove you own this wallet"
   - "This will not cost any gas fees"
   - "Your signature is used for authentication only"

4. **Provide fallback:**
   - If wallet sign fails, offer email signup
   - Don't force wallet-only authentication

### For Backend Developers

1. **Validate all signatures server-side:**
   - Never trust client-provided verification
   - Always verify cryptographic signatures

2. **Implement rate limiting:**
   - Prevent nonce spam
   - Limit verification attempts

3. **Cleanup expired nonces:**
   - Run daily cron job
   - Delete nonces older than 24 hours

4. **Log security events:**
   - Failed signature verifications
   - Multiple failed attempts
   - Unusual patterns

---

**Document Version**: 1.0
**Last Updated**: 2025-12-10
**Maintained By**: Auth Team
