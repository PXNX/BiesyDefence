import { createEntityId } from '@/game/utils/id'

export type ModifierType =
    | 'slow'
    | 'dot'
    | 'armor_reduction'
    | 'damage_mult'
    | 'speed_mult'
    | 'range_mult'
    | 'fire_rate_mult'
    | 'vulnerability'
    | 'burn'

export type StackingRule = 'replace' | 'additive' | 'multiplicative' | 'max'

export interface Modifier {
    id: string
    sourceId: string
    targetId: string
    type: ModifierType
    value: number
    duration: number
    remainingTime: number
    stacking: StackingRule
    tickInterval?: number // For DoT
    timeSinceLastTick?: number // For DoT
}

export interface ModifierConfig {
    type: ModifierType
    value: number
    duration: number
    stacking: StackingRule
    tickInterval?: number
}

// Caps configuration
export const MODIFIER_CAPS: Partial<Record<ModifierType, { min?: number; max?: number }>> = {
    slow: { max: 0.7 }, // Max 70% slow
    armor_reduction: { max: 0.8 }, // Max 80% armor reduction
    damage_mult: { max: 3.0 }, // Max 300% damage multiplier
    vulnerability: { max: 2.0 }, // Max 200% vulnerability
}

export interface ModifierEvent {
    targetId: string
    type: ModifierType
    value: number
    sourceId: string
}

export class ModifierManager {
    private modifiers: Map<string, Modifier[]> = new Map()

    constructor() { }

    /**
     * Add a modifier to a target
     */
    addModifier(targetId: string, sourceId: string, config: ModifierConfig): string {
        const id = createEntityId('mod')
        const modifier: Modifier = {
            id,
            sourceId,
            targetId,
            type: config.type,
            value: config.value,
            duration: config.duration,
            remainingTime: config.duration,
            stacking: config.stacking,
            tickInterval: config.tickInterval,
            timeSinceLastTick: 0
        }

        if (!this.modifiers.has(targetId)) {
            this.modifiers.set(targetId, [])
        }

        const targetModifiers = this.modifiers.get(targetId)!

        // Handle 'replace' stacking rule (replace existing modifier from same source and type)
        // Note: 'replace' usually implies we don't want multiple instances from same source.
        // But 'stacking' rule in calculation is different from insertion rule.
        // Let's assume for now we always add, and 'replace' logic is handled during calculation OR
        // we enforce uniqueness here.
        // Common behavior: If source applies same effect, refresh duration.

        const existingIndex = targetModifiers.findIndex(
            m => m.sourceId === sourceId && m.type === config.type
        )

        if (existingIndex !== -1) {
            // Refresh existing
            targetModifiers[existingIndex].remainingTime = config.duration
            targetModifiers[existingIndex].value = config.value // Update value if changed
            return targetModifiers[existingIndex].id
        } else {
            targetModifiers.push(modifier)
            return id
        }
    }

    /**
     * Remove a specific modifier
     */
    removeModifier(targetId: string, modifierId: string): boolean {
        const targetModifiers = this.modifiers.get(targetId)
        if (!targetModifiers) return false

        const index = targetModifiers.findIndex(m => m.id === modifierId)
        if (index !== -1) {
            targetModifiers.splice(index, 1)
            if (targetModifiers.length === 0) {
                this.modifiers.delete(targetId)
            }
            return true
        }
        return false
    }

    /**
     * Update all modifiers (handle duration and ticks)
     * Returns list of events (e.g. DoT ticks)
     */
    update(deltaSeconds: number): ModifierEvent[] {
        const events: ModifierEvent[] = []

        for (const [targetId, mods] of this.modifiers.entries()) {
            for (let i = mods.length - 1; i >= 0; i--) {
                const mod = mods[i]
                mod.remainingTime -= deltaSeconds

                // Handle DoT ticks
                if (mod.tickInterval && mod.tickInterval > 0) {
                    mod.timeSinceLastTick = (mod.timeSinceLastTick || 0) + deltaSeconds
                    if (mod.timeSinceLastTick >= mod.tickInterval) {
                        events.push({
                            targetId,
                            type: mod.type,
                            value: mod.value, // This would be damage per tick
                            sourceId: mod.sourceId
                        })
                        mod.timeSinceLastTick -= mod.tickInterval
                    }
                }

                if (mod.remainingTime <= 0) {
                    mods.splice(i, 1)
                }
            }

            if (mods.length === 0) {
                this.modifiers.delete(targetId)
            }
        }

        return events
    }

    /**
     * Get all modifiers for a target
     */
    getModifiers(targetId: string, type?: ModifierType): Modifier[] {
        const mods = this.modifiers.get(targetId) || []
        if (type) {
            return mods.filter(m => m.type === type)
        }
        return mods
    }

    /**
     * Calculate effective value for a specific modifier type on a target
     */
    calculateEffectiveValue(targetId: string, type: ModifierType, baseValue: number = 0): number {
        const mods = this.getModifiers(targetId, type)
        if (mods.length === 0) return baseValue

        let result = baseValue

        // Group by stacking rule
        // This is a simplified implementation. Real world might be more complex.
        // Assumption:
        // 'max': Take the highest value among all 'max' modifiers.
        // 'additive': Sum all values.
        // 'multiplicative': Multiply all values.
        // 'replace': (Handled at insertion, so effectively only one exists per source, but multiple sources can exist)

        // We need to define how different stacking rules interact with EACH OTHER.
        // Usually: Base * (1 + Sum(Additive)) * Product(Multiplicative)
        // 'Max' usually applies to the final result or overrides others?
        // Let's assume 'max' is for things like Slow where you take the strongest slow.

        // Specific logic per type might be needed, but let's try a generic approach based on the 'stacking' property of the modifiers.

        // For Slow (usually 'max'):
        // If ANY modifier is 'max', we might just take the max of those and ignore others? Or mix?
        // Let's stick to the requested rules:
        // "Stacking-Regeln: replace, additive, multiplicative, max"

        // Let's process in this order:
        // 1. Max (if present, might override or be the base)
        // 2. Additive
        // 3. Multiplicative

        let maxVal = 0
        let hasMax = false
        let addTotal = 0
        let multTotal = 1

        for (const mod of mods) {
            switch (mod.stacking) {
                case 'max':
                    maxVal = Math.max(maxVal, mod.value)
                    hasMax = true
                    break
                case 'additive':
                    addTotal += mod.value
                    break
                case 'multiplicative':
                    multTotal *= mod.value
                    break
                case 'replace':
                    // 'replace' is handled at insertion (one per source). 
                    // If we have multiple sources with 'replace', how do they stack?
                    // Usually 'replace' implies it doesn't stack, so maybe it acts like 'max'?
                    // Or maybe it's just a unique debuff.
                    // Let's treat 'replace' as 'max' for calculation purposes if not specified otherwise.
                    maxVal = Math.max(maxVal, mod.value)
                    hasMax = true
                    break
            }
        }

        // Apply logic
        // If we have 'max' modifiers, they set a baseline floor or override?
        // For Slow: usually MAX slow is applied.
        // For Damage: usually Additive + Multiplicative.

        // Let's define behavior based on the TYPE of modifier, as stacking rules are often type-dependent.
        // But the requirement says "Stacking-Regeln: ...", implying the modifier itself carries the rule.

        if (hasMax) {
            // If 'max' is used, it usually dominates.
            // But what if we have max AND additive?
            // E.g. Slow 50% (Max) + Slow 10% (Additive)?
            // Let's assume: Result = Max(MaxValues) + Sum(Additive) * Product(Multiplicative)
            // This is a reasonable generic formula.
            result = maxVal
        }

        // If baseValue is provided (e.g. speed 100), we treat it as the starting point.
        // If baseValue is 0 (e.g. for "Slow %"), we start from 0.

        // Case 1: Stat modification (Speed, Damage) -> Base * Multipliers
        // Case 2: Effect application (Slow) -> 0 + Values

        // Let's refine based on usage.
        // Slow: Value is 0.3 (30%). We want effective slow.
        // If multiple slows: Max(0.3, 0.5) = 0.5.
        // If additive slow: 0.3 + 0.1 = 0.4.

        if (type === 'slow') {
            // Slows are usually 'max' or 'diminishing returns'.
            // Let's use the calculated maxVal and addTotal.
            // Effective Slow = Max(MaxValues) + Sum(Additive)
            // Multiplicative slow? (1 - 0.3) * (1 - 0.2) ... maybe too complex for now.
            result = hasMax ? maxVal : 0
            result += addTotal
            // Multiplicative for slow usually means reducing the REMAINING speed.
            // Let's ignore multiplicative for slow for now unless needed.
        } else if (type === 'damage_mult' || type === 'speed_mult' || type === 'range_mult' || type === 'fire_rate_mult') {
            // Multipliers.
            // Base is usually 1.0 (100%).
            // Additive: 1.0 + 0.2 + 0.1 = 1.3
            // Multiplicative: 1.0 * 1.2 * 1.1 = 1.32
            // Max: Max(1.5, 1.2) = 1.5

            // Formula: (Base + Sum(Additive)) * Product(Multiplicative)
            // If Max is present, use Max as Base?

            let currentBase = hasMax ? maxVal : (baseValue || 1)
            // If baseValue was passed (e.g. 50 damage), we use that.
            // If not (0), we assume 1.0 for multipliers? No, if base is 0, result is 0.
            // But here we are calculating the MULTIPLIER itself, or the FINAL value?
            // "calculateEffectiveValue" -> implies final value.

            // If we are calculating the multiplier to apply:
            // Base = 1.
            // Result = (1 + Additive) * Multiplicative.
            // If Max is present, maybe Result = Max(Max, (1+Add)*Mult)?

            // Let's stick to a simple consistent formula:
            // Value = (Base + Additive) * Multiplicative
            // If hasMax, Value = Math.max(Value, MaxVal)

            result = (baseValue + addTotal) * multTotal
            if (hasMax) {
                result = Math.max(result, maxVal)
            }
        } else {
            // Default (e.g. Armor Reduction, Vulnerability)
            // Treat as additive by default
            result = baseValue + addTotal
            if (hasMax) {
                result = Math.max(result, maxVal)
            }
            if (multTotal !== 1) {
                result *= multTotal
            }
        }

        // Apply Caps
        const cap = MODIFIER_CAPS[type]
        if (cap) {
            if (cap.max !== undefined) {
                result = Math.min(result, cap.max)
            }
            if (cap.min !== undefined) {
                result = Math.max(result, cap.min)
            }
        }

        return result
    }

    /**
     * Clear all modifiers for a target
     */
    clearModifiers(targetId: string) {
        this.modifiers.delete(targetId)
    }

    /**
     * Return a shallow snapshot of all active modifiers keyed by target id.
     * Used by UI/state store to visualize active effects without mutating internal state.
     */
    getSnapshot(): Record<string, Modifier[]> {
        const snapshot: Record<string, Modifier[]> = {}
        for (const [targetId, mods] of this.modifiers.entries()) {
            snapshot[targetId] = mods.map((m) => ({ ...m }))
        }
        return snapshot
    }
}
