# 🌾 ChaiTrade - Privacy-Preserving Community MSME Invoice Financing

> **Building Credit, One Invoice at a Time**

ChaiTrade solves the ₹20-25 lakh crore credit gap for 63 million Indian MSMEs by enabling community-powered invoice financing with Zero-Knowledge proof privacy on Avalanche Blockchain.

---

## 🎯 The Problem We Solve

- **63M Indian MSMEs** face severe credit gap
- MSMEs deliver goods worth lakhs but wait **90-180 days** for payment
- Employees need salaries **TODAY**, not in 90 days
- **Banks reject them** - lack formal history, inconsistent income
- They die waiting for payment that's already owed

---

## ✨ Our Solution

**Community-Powered Invoice Financing with ZK Privacy**

1. **MSME uploads invoice** (PDF/image)
2. **AI extracts** invoice details
3. **Generates ZK proof** of creditworthiness (without revealing actual score)
4. **Community investors** fund the invoice
5. **MSME gets 80%** immediately
6. **When buyer pays** → Investors get returns

### What Makes ChaiTrade Different?

✅ **Zero-Knowledge Privacy** - Prove score > 700 WITHOUT revealing exact score  
✅ **Instant Funding** - Get 80% of invoice value in <2 minutes  
✅ **Community Powered** - Neighbors help neighbors, not corporate banks  
✅ **On-Chain Credibility** - Build portable credit history on blockchain  
✅ **Low Rates** - 18% (vs 24% from banks)  
✅ **Regulatory Approved** - RBI approved blockchain invoice financing (Aug 2024)  

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│  Frontend (Next.js + Web3)          │
│  ├─ MSME Dashboard                  │
│  └─ Investor Portal                 │
└──────────────┬──────────────────────┘
               ▼
┌─────────────────────────────────────┐
│  Smart Contracts (Avalanche Fuji)   │
│  ├─ InvoiceNFT (ERC-721)            │
│  ├─ ZKCreditOracle                  │
│  ├─ FundingPool (Escrow)            │
│  └─ MockUSDC (Testing)              │
└──────────┬─────────────────┬────────┘
           ▼                 ▼
    ┌─────────────┐   ┌──────────────┐
    │ Supabase DB │   │ Pinata IPFS  │
    └─────────────┘   └──────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Rust (for Circom)
- Git

### Setup (5 mins)

```bash
# 1. Clone
git clone https://github.com/yourusername/chaitrade.git
cd chaitrade

# 2. Smart Contracts
cd contracts
npm install
npm run compile
npm run deploy  # To Avalanche Fuji

# 3. Frontend
cd ../frontend
npm install
npm run dev  # Open http://localhost:3000

# 4. ZK Circuits
cd ../zk
./scripts/compile.sh
```

See **DEPLOYMENT_GUIDE.md** for detailed setup instructions.

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Avalanche Fuji (C-Chain) |
| **Smart Contracts** | Solidity 0.8.20, OpenZeppelin |
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Web3 Integration** | Wagmi v2, Viem, RainbowKit, ethers.js |
| **Database** | Supabase (PostgreSQL) |
| **File Storage** | Pinata (IPFS) |
| **Privacy Layer** | Circom + SnarkJS (Groth16 proofs) |
| **UI Design** | Sage Green + Charcoal color palette |

---

## 🏛️ Smart Contracts

### InvoiceNFT.sol
- ERC-721 standard for invoice representation
- Stores: amount, buyer, due date, IPFS link
- Tracks lifecycle: Listed → Funding → Funded → Paid

### ZKCreditOracle.sol
- **Zero-Knowledge Proof verification**
- MSME commits credit score hash
- Verifies ZK proof: "Score > 700" (without revealing actual score)
- Tiered credit system (Basic/Standard/Premium)

### FundingPool.sol
- **Smart escrow for investor funds**
- Creates funding rounds (campaigns)
- Tracks investor contributions
- Distributes returns on payment

### MockUSDC.sol
- Test USDC on Fuji testnet
- Faucet for free test tokens

---

## 🔐 Zero-Knowledge Privacy

**Credit Score Range Proof Circuit**

```circom
// Proves: creditScore > minThreshold WITHOUT revealing score
Input (private):
  - creditScore: 750
  - salt: random value

Input (public):
  - commitment: Poseidon(750, salt)
  - minThreshold: 700

Output:
  - isValid: 1 (since 750 > 700)
```

**On-chain Verification:**
```solidity
creditOracle.verifyScoreProof(proof, commitment, 700);
// ✅ Verified! MSME is creditworthy without revealing score.
```

---

## 🎨 Design System

**Color Palette** (Sage Green + Charcoal)

```
🟢 Sage Green 500: #3d8b68 (Primary action)
⬛ Charcoal:       #1a1a1a (Background)
⬜ Off-White:      #f9fafb (Text)
🟤 Medium Gray:    #4a4a4a (Borders)
```

**Component Library**
- Buttons (Primary, Secondary)
- Cards (Elevated, Outlined)
- Inputs (Text, Number)
- Badges (Success, Warning, Error)
- Progress Bars
- Spinners

See `frontend/src/app/globals.css` for implementation.

---

## 📁 Project Structure

```
chaitrade/
├── contracts/              # Smart Contracts
│   ├── contracts/
│   │   ├── InvoiceNFT.sol
│   │   ├── ZKCreditOracle.sol
│   │   ├── FundingPool.sol
│   │   ├── mocks/
│   │   │   ├── MockUSDC.sol
│   │   │   └── Groth16Verifier.sol
│   │   └── interfaces/
│   │       └── IVerifier.sol
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── demo.ts
│   ├── test/
│   │   └── ChaiTrade.test.ts
│   └── hardhat.config.ts
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── invoice/
│   │   │   │   └── InvoiceUpload.tsx
│   │   │   └── funding/
│   │   │       ├── FundingProgress.tsx
│   │   │       └── InvestmentForm.tsx
│   │   ├── lib/
│   │   │   ├── wagmi.ts
│   │   │   ├── contracts/
│   │   │   ├── zk/
│   │   │   ├── pinata/
│   │   │   ├── ai/
│   │   │   └── supabase/
│   │   └── providers/
│   │       └── Web3Provider.tsx
│   └── public/zk/
│       └── (ZK circuit files)
│
├── zk/                    # ZK Circuits
│   ├── circuits/
│   │   └── credit_score_range.circom
│   └── scripts/
│       └── compile.sh
│
├── supabase/             # Database Schema
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── ChaiTrade_Complete_Specification.md
└── DEPLOYMENT_GUIDE.md
```

---

## 🔄 Data Flow

**Invoice Funding Flow:**

```
1. MSME uploads invoice PDF
   ↓
2. AI (OCR) extracts: amount, buyer, due date
   ↓
3. File uploaded to Pinata IPFS → CID
   ↓
4. Calculate credit score (off-chain)
   ↓
5. Generate ZK proof (browser) → commitment
   ↓
6. Mint Invoice NFT on Avalanche
   ↓
7. Commit ZK proof to ZKCreditOracle
   ↓
8. If creditworthy → List for funding
   ↓
9. Investors see: ✅ Verified (score > 700) + amount + terms
   ↓
10. Investors fund (USDC deposits)
    ↓
11. When 80% raised → 80% to MSME, 20% escrowed
    ↓
12. Buyer pays → Distribution:
    - 20% escrow to MSME
    - Principal + interest to investors (proportional)
    ↓
13. Update on-chain credit score
```

---

## 📊 Database Schema

**Core Tables:**
- `msmes` - Microenterprises
- `invoices` - Invoice NFTs
- `investors` - Investor profiles
- `investments` - Funding records
- `credit_events` - Score updates
- `zk_commitments` - ZK proofs
- `payment_receipts` - Settlement records

**Security:**
- Row-Level Security (RLS) enabled
- Users see only their own data
- Public read for invoices

See `supabase/migrations/001_initial_schema.sql`

---

## 🎯 Demo Script

Run a complete demo:

```bash
cd contracts
npm run demo
```

**Demo Flow (5 min):**
1. ✅ MSME uploads invoice (₹50k)
2. ✅ AI extracts details
3. ✅ Generate ZK proof of creditworthiness
4. ✅ 3 investors fund: ₹10k + ₹10k + ₹10k = ₹40k
5. ✅ Simulate buyer payment
6. ✅ Distribute returns (18% interest)
7. ✅ Show on-chain credit score update

---

## 🧪 Testing

```bash
cd contracts

# Run tests
npm run test

# Run demo
npm run demo

# Deploy to Fuji
npm run deploy
```

---

## 🌐 Live Networks

### Avalanche Fuji Testnet
- **RPC**: https://api.avax-test.network/ext/bc/C/rpc
- **ChainID**: 43113
- **Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/

### Supabase
- Create project: https://supabase.com
- Execute schema: Copy `supabase/migrations/001_initial_schema.sql`

### Pinata (IPFS)
- Signup: https://pinata.cloud
- Get API key

### WalletConnect
- Get project ID: https://cloud.walletconnect.com

---

## 🔐 Security

✅ **Smart Contracts**
- ReentrancyGuard on all transfers
- Input validation
- Time locks on critical functions

✅ **Frontend**
- HTTPS enforced
- Wallet authentication via RainbowKit
- No private keys in code

✅ **Database**
- Row-Level Security policies
- Encrypted sensitive fields (future)

⚠️ **Audit Status**
- MVP phase - formal audit pending
- For production: Audited version required

---

## 📈 Future Roadmap

### Phase 2 (Post-MVP)
- [ ] Formal smart contract audit
- [ ] Real credit scoring (GST data, bank statements)
- [ ] Governance token (DAO voting)
- [ ] Investor dashboard with analytics
- [ ] Payment automation (Razorpay integration)

### Phase 3
- [ ] Multi-chain (Polygon, BSC)
- [ ] Avalanche subnet
- [ ] Mobile app
- [ ] Kyoto Protocol carbon credits

### Phase 4
- [ ] Global expansion
- [ ] Institutional capital
- [ ] Credit card equivalent (CAITRADE token)

---

## 🤝 Contributing

We welcome contributions! This is a hackathon project designed for 48-hour builds.

```bash
# Setup dev environment
npm install

# Create feature branch
git checkout -b feat/your-feature

# Make changes
# Write tests
# Submit PR
```

---

## 📞 Support & Resources

- **Full Specification**: See `ChaiTrade_Complete_Specification.md`
- **Setup Guide**: See `DEPLOYMENT_GUIDE.md`
- **Smart Contracts**: See `contracts/` comments
- **ZK Circuits**: See `zk/README.md`

---

## 📜 License

MIT License - See LICENSE file

---

## ⭐ Show Your Support

If you find ChaiTrade valuable, please star this repo! Your support encourages further development.

---

## 🙏 Acknowledgments

- Built for EIBS 2.0 Hackathon
- Inspired by 63M MSMEs waiting for payment
- Powered by Avalanche, Supabase, and community spirit

---

**ChaiTrade: Empowering MSMEs Through Community Finance 🌾**

*"Not with banks. With neighbors helping neighbors."*

---

## 📊 Stats

- **Smart Contracts**: 4 (650+ lines of Solidity)
- **Frontend Components**: 10+ (React/TypeScript)
- **Database Tables**: 7 (with RLS policies)
- **ZK Circuit**: Credit score range proof
- **Build Time**: 48 hours
- **Target Impact**: ₹20L crore MSME credit gap

---

Last Updated: January 3, 2026

**Status**: ✅ MVP Complete | Ready for Hackathon Demo
