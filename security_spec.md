# Firestore Security Specification and Test Cases (TDD)

## 1. Data Invariants

1. **User Ownership**: A user account document under `/users/{userId}` must only be readable and writable by the user themselves (`request.auth.uid == userId`) or an admin user.
2. **Deposit Verification**: Deposits must only be approved/rejected by authenticated administrators who exist in the system. Investors cannot approve their own deposits.
3. **Withdrawal Reservation Integrity**: Investors can submit withdrawals but cannot bypass authorization status fields without administrator clearance. They can only transition `approved` to `completed` upon claiming.
4. **Investment Security**: Investors can activate new pools (held in pending approval status) and claim active yield. They cannot unilaterally toggle the status of an investment path directly to 'active'.
5. **No Cross-User Leakage**: Users can only query the collection lists where `resource.data.userId == request.auth.uid`.

---

## 2. The "Dirty Dozen" Poison Payloads

1. **Payload 01: Self-Admin Elevation**
   * Path: `/users/attacker_uid`
   * Action: `create` or `update`
   * Attempt: Set `isAdmin: true` or change `isAdmin` directly on a standard profile.
   * Expected: `PERMISSION_DENIED`

2. **Payload 02: PII Profile Hijacking**
   * Path: `/users/victim_uid`
   * Action: `get` or `update`
   * Attempt: Read another user's wallet balances or telephone identifiers.
   * Expected: `PERMISSION_DENIED`

3. **Payload 03: Direct Unapproved Deposit Clearance**
   * Path: `/deposits/malicious_dep`
   * Action: `create` with `status: "approved"` bypassing admin clearance.
   * Expected: `PERMISSION_DENIED`

4. **Payload 04: Admin Role Spoofing**
   * Action: Write document under `/users/attacker_uid` with a mock high balance.
   * Attempt: Read all system wide withdrawals without genuine clearance.
   * Expected: `PERMISSION_DENIED`

5. **Payload 05: Unbounded Field Flood (Denial of Wallet)**
   * Path: `/deposits/flood_id`
   * Action: `create`
   * Attempt: Inject a 2MB base64 string in `refNumber` to exhaust storage space.
   * Expected: `PERMISSION_DENIED`

6. **Payload 06: Investment Status Bypassing**
   * Path: `/investments/cheat_inv`
   * Action: `create` with `status: "active"` to start earning yield immediately without seed deposit approval.
   * Expected: `PERMISSION_DENIED`

7. **Payload 07: Temporal Spoofing (Future Dating)**
   * Path: `/investments/cheat_inv`
   * Action: `create` with custom client timestamp `createdAt` from 20 days ago to trigger immediate complete payout cycle.
   * Expected: `PERMISSION_DENIED`

8. **Payload 08: Withdraw Refund Hijack**
   * Path: `/withdrawals/cheat_wdr`
   * Action: `update` status field to `rejected` or `approved` on other users' tickets.
   * Expected: `PERMISSION_DENIED`

9. **Payload 09: Impersonation of OwnerId**
   * Path: `/investments/fraud_inv`
   * Action: `create` or `update` with `userId` set to a victim's uid while signed in as attacker.
   * Expected: `PERMISSION_DENIED`

10. **Payload 10: Invalid Type Poisoning**
    * Path: `/deposits/cheat_dep`
    * Action: `create` with `amount: "One Hundred"` (string instead of float).
    * Expected: `PERMISSION_DENIED`

11. **Payload 11: Claim Yield Inflation**
    * Path: `/investments/cheat_inv`
    * Action: `update` to arbitrarily increase `accruedAmount` value directly.
    * Expected: `PERMISSION_DENIED`

12. **Payload 12: Invalid Path Variable Infiltration**
    * Path: `/users/some-garbage-id-with-length-exceeding-128-chars-and-containing-special-symbols-&*#$@!`
    * Action: `create` or `write`
    * Attempt: Infiltrate invalid special symbols.
    * Expected: `PERMISSION_DENIED`
