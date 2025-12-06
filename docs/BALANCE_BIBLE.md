# Balance-Bibel

## Übersicht

Dieses Dokument definiert alle Balance-Formeln, Caps und Stacking-Regeln für BiesyDefence.

---

## 1. Wave Scaling

### HP/Reward-Kopplung

```typescript
// Formel: getWaveScaling(waveIndex)
const phase = waveIndex + 1;
const hpBase =
  phase <= 5  ? 1 + 0.05 * phase :           // 1.05 - 1.25
  phase <= 10 ? 1.25 + 0.06 * (phase - 5) :  // 1.31 - 1.55
  phase <= 15 ? 1.55 + 0.07 * (phase - 10) : // 1.62 - 1.90
              : 1.9 + 0.08 * (phase - 15);    // 1.98+

const hpScale = clamp(hpBase, 1, 2.5);
const rewardScale = Math.max(1.0, hpScale); // Min-Reward-Floor
```

### Elite-Bonus

| Wave (Phase) | Bonus |
|--------------|-------|
| 9  | 1.2x |
| 14 | 1.2x |
| 19 | 1.25x |

### Speed Scaling

```typescript
const speedScale = clamp(1 + 0.02 * phase, 1, 1.45);
```

---

## 2. Modifier Caps

| Modifier | Cap | Stacking |
|----------|-----|----------|
| Slow | 0.7 (30% max slow) | Multiplicative |
| Armor Reduction | 0.8 (80% max) | Additive |
| Damage Mult | 3.0 (3x max) | Multiplicative |
| Vulnerability | 2.0 (2x max) | Additive |

---

## 3. Economy

### Limits

| Value | Limit |
|-------|-------|
| Max Money | 999,999,999 |
| Max Score | 999,999,999 |
| Max Lives | 999 |

### Tower Refund

```typescript
refundAmount = towerCost * GAME_CONFIG.economy.towerSellRefundPercent; // 70%
```

### Wave Bonus

```typescript
bonus = GAME_CONFIG.economy.waveBaseBonus + 
        waveIndex * GAME_CONFIG.economy.waveBonusPerWave;
// 50 + wave * 10
```

---

## 4. Tower Upgrades

### Upgrade Costs & Multipliers

| Tower | Level 2 Cost | Level 2 Mult | Level 3 Cost | Level 3 Mult |
|-------|-------------|--------------|-------------|--------------|
| Indica | 50 | 1.15x | 95 | 1.35x |
| Sativa | 45 | 1.10x | 85 | 1.30x |
| Support | 40 | 1.05x | 75 | 1.20x |
| Sniper | 70 | 1.15x | 120 | 1.35x |
| Flamethrower | 65 | 1.12x | 110 | 1.30x |
| Chain | 60 | 1.15x | 105 | 1.35x |

---

## 5. Enemy Resistances

### Resistance Types

- `impact`: Physical damage (default)
- `volley`: Rapid-fire/multi-hit
- `control`: Slow effects
- `dot`: Damage over time
- `pierce`: Piercing attacks
- `chain`: Chain lightning
- `burn`: Fire damage
- `freeze`: Ice damage

### Boss Resistances

| Boss | Resistances |
|------|-------------|
| carrier_boss | volley: 25%, control: 20% |
| alien_boss | volley: 25%, control: 20%, chain: 15% |
| bulwark | volley: 35%, dot: 50% |

---

## 6. Slow Caps

| Enemy Type | Slow Cap |
|------------|----------|
| runner | 0.7 |
| swift_runner | 0.8 |
| carrier_boss | 0.7 |
| stealth | 0.75 |
| alien_boss | 0.7 |

---

## 7. Telemetry Thresholds

| Metric | Warning Threshold |
|--------|-------------------|
| Overkill | >35% |
| Slow Uptime Low | <10% |
| Slow Uptime High | >85% |
| Wave Duration | >60s |
| HP/Reward Ratio | 0.05 - 0.2 |
| Boss Spawn Span | >15s |
