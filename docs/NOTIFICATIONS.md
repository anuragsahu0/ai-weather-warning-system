# ERROR 404 — Multi-Channel Notification Infrastructure

> **Team Brand**: `ERROR 404`  
> **Project**: AI-Driven Hyper-Local Early Warning System for Severe Weather Nowcasting

---

## 1. Supported Notification Channels

1. **`IN_APP`**: Real-time push stream to the Mission Control Command Deck with unread badge counters.
2. **`WEB_PUSH`**: W3C Push API / VAPID signed payload delivered to mobile and desktop browser notification centers.
3. **`EMAIL`**: Transactional SMTP multipart HTML/Text emergency bulletin with clear validity intervals.

---

## 2. Asynchronous Queue Architecture & Lifecycle

```
Alert Event Created
     ↓
Subscription Policy Evaluation (Location + Hazard + Risk Threshold)
     ↓
Deterministic SHA-256 Hashing (Idempotency Key Check)
     ↓
Queue Insertion (QUEUED)
     ↓
Background Worker Execution (PROCESSING)
     ↓
Channel Provider Dispatch (SENT)
     ↓
Receipt Verification (DELIVERED / READ)
     ↓
Failure Retries (Exponential Backoff: 1s, 2s, 4s)
     ↓
Dead Letter Transition (DEAD_LETTER if retries > 3)
```

---

## 3. Idempotent Deduplication Gateway

To prevent citizen alert panic spam during convective storms, every dispatch generates a deterministic SHA-256 hash:
$$\text{Key} = \text{SHA256}(\text{alertId} : \text{subscriptionId} : \text{riskLevel} : \text{channel})$$

If an identical key exists in the queue cache within its validity window, subsequent duplicates are skipped with reason `DUPLICATE_NOTIFICATION`.
