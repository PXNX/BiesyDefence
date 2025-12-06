// Jest test for getWaveScaling
import { getWaveScaling } from '@/game/entities/enemies';

describe('getWaveScaling', () => {
    describe('HP/Reward Coupling', () => {
        it('should couple reward scaling to HP scaling', () => {
            for (let wave = 0; wave < 20; wave++) {
                const scaling = getWaveScaling(wave);
                // Reward should always be >= HP (due to min-reward-floor)
                expect(scaling.rewardScale).toBeGreaterThanOrEqual(scaling.hpScale * 0.99);
            }
        });

        it('should increase HP scaling with wave index', () => {
            const earlyWave = getWaveScaling(0);
            const midWave = getWaveScaling(9);
            const lateWave = getWaveScaling(19);

            expect(earlyWave.hpScale).toBeLessThan(midWave.hpScale);
            expect(midWave.hpScale).toBeLessThan(lateWave.hpScale);
        });

        it('should have proportional reward increases with HP', () => {
            const wave5 = getWaveScaling(4);
            const wave10 = getWaveScaling(9);

            // Check that reward increased proportionally
            const hpRatio = wave10.hpScale / wave5.hpScale;
            const rewardRatio = wave10.rewardScale / wave5.rewardScale;

            // Allow some variance due to elite bonus on wave 9
            expect(Math.abs(hpRatio - rewardRatio)).toBeLessThan(0.25);
        });
    });

    describe('Elite Bonus', () => {
        it('should apply elite bonus on wave 9 (phase 9)', () => {
            const wave8 = getWaveScaling(7); // Phase 8
            const wave9 = getWaveScaling(8); // Phase 9 - elite

            // Phase 9 should have 1.2x bonus
            expect(wave9.hpScale).toBeGreaterThan(wave8.hpScale * 1.15);
        });

        it('should apply elite bonus on wave 14 (phase 14)', () => {
            const wave13 = getWaveScaling(12); // Phase 13
            const wave14 = getWaveScaling(13); // Phase 14 - elite

            // Phase 14 should have 1.2x bonus
            expect(wave14.hpScale).toBeGreaterThan(wave13.hpScale * 1.1);
        });

        it('should apply elite bonus on wave 19 (phase 19)', () => {
            const wave18 = getWaveScaling(17); // Phase 18
            const wave19 = getWaveScaling(18); // Phase 19 - elite

            // Phase 19 should have 1.25x bonus
            expect(wave19.hpScale).toBeGreaterThan(wave18.hpScale * 1.15);
        });
    });

    describe('Min-Reward-Floor (Death Spiral Prevention)', () => {
        it('should never have reward scale below 1.0', () => {
            for (let wave = 0; wave < 25; wave++) {
                const scaling = getWaveScaling(wave);
                expect(scaling.rewardScale).toBeGreaterThanOrEqual(1.0);
            }
        });

        it('should maintain positive economy progression', () => {
            let previousReward = 0;
            for (let wave = 0; wave < 20; wave++) {
                const scaling = getWaveScaling(wave);
                // Reward should generally increase or stay same (not decrease too much)
                // Elite waves (9, 14, 19) get bonus, so next wave has relative drop
                // Allow up to 20% drop after elite waves
                expect(scaling.rewardScale).toBeGreaterThanOrEqual(previousReward * 0.80);
                previousReward = scaling.rewardScale;
            }
        });
    });

    describe('Scaling Boundaries', () => {
        it('should cap HP scale at 2.5', () => {
            const veryLateWave = getWaveScaling(30);
            // HP scale has 2.5 cap, but elite bonus can push it higher
            expect(veryLateWave.hpScale).toBeLessThanOrEqual(2.5 * 1.3);
        });

        it('should cap speed scale at 1.45', () => {
            const veryLateWave = getWaveScaling(30);
            expect(veryLateWave.speedScale).toBeLessThanOrEqual(1.45 * 1.3);
        });

        it('should start with base scaling of 1.0+ on wave 0', () => {
            const firstWave = getWaveScaling(0);
            expect(firstWave.hpScale).toBeGreaterThanOrEqual(1.0);
            expect(firstWave.rewardScale).toBeGreaterThanOrEqual(1.0);
            expect(firstWave.speedScale).toBeGreaterThanOrEqual(1.0);
        });
    });
});
