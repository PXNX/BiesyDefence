# Balancing_Logic – Ist-Stand & Nächstes

## Ist-Stand nach Umsetzung
- 20-Wave-Schleife: `config/waves.ts` generiert 20 Runden mit Phasen (Einstieg → Varianz → Konter → Druck → Endspiel) inkl. Elites/Boss (`bulwark`, `carrier_boss` mit Swarm-Deaths).
- Gegner-Roster & Skalierung: Neue Typen (`swarm`, `armored_pest`, `swift_runner`, `bulwark`, `carrier_boss`) mit Resistenzfeldern, Slow-Caps und auswachsenden HP/Speed/Reward-Skalern je Wave + Difficulty-Multiplikatoren (`MapManager`). On-Death-Spawn für Carrier.
- Schaden/Resists: DamageTypes (`impact`, `volley`, `control`, `dot`) + Resistances/Vulnerability in `core/types.ts`, angewendet via `utils/combat.ts` in Tower-/Projectile-/Enemy-Systemen. Slow berücksichtigt Resist/Caps.
- Türme: Profile neu gewichtet (`constants.ts`): Indica mehr Impact-Schaden, Sativa mit Splash-Volley, Support mit Slow+DoT+Vulnerability. Upgrade-Kosten angepasst (`TowerUpgradeSystem.ts`), Level-Felder am Tower vorbereitet.
- Economy: Kill-Streak-Bonus (bis +25%) auf Rewards, Reset bei Lebensverlust; Rewards skaliert per Wave/Difficulty. Start-Ressourcen unverändert, KillStreak in State validiert.
- On-Death-Spawn: GameController spawnt zusätzliche Gegner laut `enemy.stats.onDeathSpawn` (z.B. Boss → Swarm).
- Build ist wieder grün (tsc + vite). Demo/Localization-Exports gefixt, Logger-Tests bereinigt, Rendering-Offscreen-Typen und Path-Texture-Key ergänzt.
- Targeting-Fallback: Tower-Zielwahl fällt bei Spatial-Grid-Desync auf direkte Distanzsuche zurück, damit Türme zuverlässig feuern.

## Noch offen / nächste Schritte
- Upgrade-Bedienung: UI/Controller bietet noch keinen Kauf/Upgrade-Flow für Tower-Level 2/3 – Hook in HUD + Controller einbauen, Kosten aus `TowerUpgradeSystem` nutzen.
- UI/Feedback: Keine Resistenz-/Tag-Icons im Renderer; SpawnTicker zeigt keine nächste Gegnermischung/Elite-Telegraph. Visuals für neue Gegnertypen noch generisch.
- Balance-Feinschliff: Zahlen für Splash-Radius, DoT, Streak-Bonus, Bulwark/Carrier HP und Reward-Caps im Spiel testen und ggf. anpassen; Boss-Spawn kann Waves verlängern.
- Tests/Simulation: Keine automatisierten Balance-Tests; nötig sind Unit-Checks (Resist-Berechnung, Slow-Cap, Streak) und Autoplay-Simulation über 20 Waves (pro Difficulty) zum Metrik-Vergleich.
- Map-Integration: Wave-Stärke berücksichtigt Difficulty, aber keine Map-spezifischen Modifier (z.B. kürzere Wege) – optional weitere Multiplikatoren per MapConfig.

## Bekannte Risiken/Schwächen
- Streak-Bonus kann Snowball erzeugen, wenn keine Leaks passieren; Cap bei +25%, aber weiter beobachten.
- On-Death-Spawn erhöht Entity-Zahl innerhalb einer Wave – Performance ok, aber Spawn-Reihenfolge könnte Taktungen verschieben.
- Renderer nutzt neue Farben/Stats, aber keine eigenen Silhouetten für Swarm/Bulwark/Boss → visuelle Lesbarkeit eingeschränkt.
- Upgrades bleiben theoretisch (Level-Feld, Kosten vorhanden), aber ohne UI-Trigger erhalten Türme nur Level 1.
