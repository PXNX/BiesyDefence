# ToDo – Upgrade-System Roadmap (Kingdom-Rush-inspiriert)
Fokus: verzweigbare Tower-Upgrades (Kernstufen + Spezialisierungen), UI-Panel am Tower, Balancing/Assets/Tests. Reihenfolge ist grob priorisiert; erledige Blöcke pro Story.

## 1) Design & Data-Model
- Definiere Upgrade-Pfade je Tower (Kern L1→L2→L3 + 2 Branches mit 2–3 Perks, Branch-L3 exklusiv). Effekte grob:
  - Indica: Rupture (Splash/Vulnerability) vs. Penetrator (Pierce/Armor-Shred).
  - Sativa: Shrapnel (mehr Pellets/Spread) vs. Focus (weniger Pellets, höherer DMG/Mark).
  - Support: Cryo (mehr Slow/Freeze-Pulse) vs. Toxin (höherer DoT/Spread on death).
  - Sniper: Pierce (mehr Durchschläge/Spall AoE) vs. Weakpoint (Crit/Execution/Armor-Ignore).
  - Flamethrower: Napalm (Burn-Dauer + Boden-DoT) vs. Pressure (kurzer Cone, hoher DMG, Bursts).
  - Chain: Storm (mehr Jumps, Stun-Chance) vs. Arc (weniger Jumps, höherer DMG + Splash).
- Kostenkurve festlegen: L2 ~1.5× Kaufpreis (+25–35% DPS/Utility), L3 ~2.3× (+50–60% + Signature-Effekt). Perks je Branch 2–3 Slots à 15–25% Kaufpreis; Branch-L3 exklusiv.
- Datenstruktur ergänzen (`config/constants` o. separates `upgrades.ts`): Perk-Definitionen (id, name, cost, prereqs, effects, iconKey, desc).

## 2) Core Logic & Persistence
- State erweitern: Tower speichert gewählte Branch/Perks/Level; Snapshot/HUD übernehmen.
- Apply-Effekte implementieren:
  - Stat-Multipliers (damage/range/fireRate/splash/chainJumps/falloff/crit) + neue Behaviours (On-kill frag, Mark/Vulnerability, Freeze-Pulse, Stun roll, DoT spread, Pfützen-DoT, Execution).
  - Exklusivität: Branch-A/B-L3 schließen sich aus; einmalig wählbar.
- Economy: Kauf/Upgrade-Kosten abbuchen; Refund/Respec vorerst nein (oder Debug only).
- Save/Load: Persistente Upgrade-Pfade (SaveManager, Version bump).
- Telemetrie: Shots/Kills/DPS per Tower-Level/Perk erfassen; Overkill/Crit/CC-Uptime tracken.

## 3) UI/UX – Upgrade Panel (KR-Style)
- Interaktion: Tower-Klick öffnet Panel (anchor near tower oder feste Dock rechts). ESC/Click-out schließt.
- Layout:
  - Header: Tower-Name, Level, Stats alt→neu (Damage/FireRate/Range/Splash/Slow/ChainJumps) mit Pfeilen.
  - Kern-Upgrade-Button (L2/L3) + Preis.
  - Zwei Branch-Spalten mit Perk-Kacheln (Icons, Kurztext, Preis, Lock/Aktiv-Status, Hover-Tooltip mit Zahlen).
  - CTA-Buttons: Kaufen (aktiv wenn Geld reicht), Branch-Lock-Indicator.
- UX-Details: Tastatur-Hotkeys (1/2/3 Kern, Q/W Branch-A, E/R Branch-B), Fokus-Ring, Fehlermeldungen (Geld), Tooltip mit Zahlen/Synergie.
- Integration: TowerIconBar selektiert Tower; Panel nutzt GameController-API (upgradeTower, buyPerk).

## 4) Assets & Visual Feedback
- Icons (SVG/PNG 64px) für Perks/Branches (siehe Assets_Grafics.md).
- UI-Rahmen/Buttons im KR-Stil: Panel-Frame, Branch-Linien, Lock/Affordable States, Hover/Active Glow.
- VFX/Decals für neue Effekte: Napalm-Pfütze, Storm-Stun-Spark, Arc-Splash-Ring, Cryo-Freeze-Ring, Toxin-Spread-Puff, Weakpoint-Marker, Execution-Blip, Shrapnel-Mini-Explosion.
- Branch-Cosmetics (optional Overlays pro Tower): Scope (Sniper), Toxin-Tank (Support), Coil-Farbe (Chain), Nozzle/Pressure-Gauge (Flame), Fragment-Tip (Sativa), Armor-Shred decal (Indica).

## 5) Balancing & Tests
- Zahlen-Feintuning: Startwerte pro Perk, Resist-Interaktion prüfen (burn/dot/volley/impact/pierce/control/chain).
- Simulation: Headless Runs mit festen Seeds (alle Towers mit und ohne Branches) → DPS/$, Time-to-kill, CC-Uptime.
- Unit/E2E:
  - Upgrade application (stats, exclusivity), Save/Load roundtrip.
  - UI Snapshot/Interaction (panel open/close, lock states).
  - Telemetrie enthält neue Perk-Felder (crit, stun, burn puddle ticks).

## 6) Stretch/Polish
- Respec/Refund UI (optional).
- Tutorial hint: erstes Upgrade highlighten.
- Achievements: „Branch Mastery“, „Perfect Tier 3“, „No-Branch Run“.
