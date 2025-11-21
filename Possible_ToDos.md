# Possible ToDos (Gameplay Prototype Roadmap)

Kompakte Sammlung an Aufgaben/Ideen, um den Prototyp spaßig, logisch, abwechslungsreich und auf 3–5 Stunden Spielzeit auszubauen.

## Kern-Gameflow & Progression
- Klarer Loop: Bauen → Welle starten → Belohnung → shop/buffs; sichtbare Zwischenziele (z.B. alle 5 Wellen Mini-Belohnung oder Modifikatorwahl).
- Difficulty-Rampen: Früh easy, Midgame Checks (Anti-Armor, Anti-Speed), Endgame Boss-Checks; optionale Schwierigkeitsstufen/Mutatoren.
- Meta-Progress: Daily/Weekly Modifier, Score-Chase mit Leaderboard-Seed, optional permanente kosmetische Freischaltungen (kein Pay2Win).
- Pacing-Tools: Schneller Skip zur nächsten Welle, Auto-Wave-Option, Schadens- und Einkommenstelemetrie pro Welle.

## Map & Level-Design
- Mehr Wege-Layouts (Engpässe vs. offene Flächen), Variationen bei GRID/PATH_Knoten; mindestens 3–5 Karten für Replay-Wert.
- Terrain-Features: High-Ground (Reichweitenbonus), Slow-Zonen, Blocker, Einbahn-Pfade, Doppelt-Start/Mehrfach-Endpunkte.
- Randomisierte Seeds pro Karte (kleine Abweichungen im Pfad oder Deko), aber mit festen „Challenge“-Seeds für Leaderboards.
- Sichtbare Build-Bounds: klare Out-of-Bounds-Markierung, Start/End-Portale mit Animation.

## Gegner-Ökonomie & Wellen
- Aktuell: pest, runner, armored_pest, swift_runner, swarm, bulwark, carrier_boss. Ergänzen Lücken:
  - „Stealth/Phasing“ (teilweise immun bis aufgedeckt), „Regenerator“, „Splitter“-Varianten, „Healer/Buffer“, „Shield Bubble“ (nimmt Treffer auf), „Flying“ (anderer Pfad/Immunitäten).
- Boss-Design: Welle 10/15/20 mit Mechanik (z.B. Schild, Adds, Phasen mit Speedburst).
- Wellen-Dramaturgie: Themensets (Swarm-Flood, Armor-Check, Speed-Check, Mixed-Attrition), Klarheit per Telemetrie (Popups: „Armor-Focus incoming“).
- Resist/Tag-System erweitern: explizite Tooltips, damit Konter-Wahl klar ist.

## Tower-System & Upgrades
- Aktuell: Indica (Impact+Vulnerability), Sativa (Volley+Splash), Support (Slow+Vuln+Dot). Ausbau:
  - Neue Archetypen: Kettenblitz (springt), Sniper/Longshot (Pierce, langsamer), Flamethrower (Kegel-DoT), Mine/Trap (Einmalig, billig), Aura/Buff (Reichweite/AS), Barrage/Mörser (Langer Cooldown, hoher AoE), Beam (kontinuierlicher Schaden).
  - Spezial-Konters: Anti-Air, Anti-Armor (Penetration), Anti-Speed (Root/Net), Anti-Swarm (Cone/Pierce).
- Upgrade-Pfade: 2–3 Tiers pro Turm mit Verzweigungen (z.B. Splash vs. Single-Target, Utility vs. DPS). Sichtbare Stat-Delta und Kosten/Nutzen-Anzeige.
- Synergien: Debuff-Stapeln limitieren/kommunizieren (Slow-Cap, Vuln-Cap), Kombos (z.B. Support erhöht Crit-Chance anderer).
- Wirtschaft: Mehr Preis-Progression, Interest/Bonus bei perfekter Welle, Risiko/Belohnung (Start-Welle früh = Bonus-Geld).

## UI/UX
- Hover/Placement: Deutlichere Platzierungs-Validierung (rot/grün, Textfeedback), Reichweitenring mit Opacity-Animation.
- Tooltips: Feingranulare Stats (DPS, Range, FireRate, Splash, Effekte, Caps), Resist-Infos pro Gegner im HUD/Bestiary.
- Build/Upgrade Panel: Schnellvergleich aktuell vs. nach Upgrade; Hotkeys für Towerwahl (1/2/3/4…), „R“ für Rotate/Facing falls relevant.
- Wave Intel: Vorab-Anzeige nächster Welle (Typen, Resists, Mengen), „Prep Phase“ Countdown, Replay-Last-Wave-Stats.
- HUD-Klarheit: Deutliche Money/Live/Wave-Info, Pausenmenü mit Settings (Sound, Schnellvorlauf, Farbschwäche-Modus).
- UX-Polish: Drag-to-Pan/Scroll-Zoom (bestehende Funktionen checken) mit weichen Grenzen, Snap-to-Grid anzeigen.

## VFX/SFX/Feedback
- Projektil- und Impact-VFX je DamageType (Impact = Staub, Volley = Splitter, Control = Slow-Glow).
- Trefferfeedback: Hitmarker/Numbers (optional togglbar), kurze Stun- oder Slow-Shader auf Gegnern.
- Tower-Bau/Upgrade Effekte: Einsetz-Animation, Auflevel-Flash.
- Gegner: Spawn-Portaleffekte, Death-Pops (Farbe nach Typ/Armor), Boss-Phase-Telegraphie.
- Audio: Shot-SFX je Tower, Treffer-SFX je Resist/Armor, Music-States (Build vs. Wave vs. Boss).

## Systeme & Balance
- Telemetrie: DPS pro Tower, Damage Breakdown nach Typ, Enemy-HP-Overkill; hilft Balancing.
- Caps & Resist-Klarheit: Kommunizieren von Slow-Cap/Resists, diminishing returns visuell.
- Economy-Balance: Kosten-Scaling pro Upgrade, Income pro Wave anpassen, Anti-Snowball-Mechanik (z.B. abnehmender Interest).
- Difficulty Modes: Easy/Normal/Hard mit Multiplikatoren (HP, Speed, Reward) und Modifikatoren (keine Pause, Permadeath-Tower?).

## Content-Dauer (3–5h Ziel)
- Mindestens 3 Karten × 20–25 Wellen je Karte mit 2–3 Bossen.
- 6–8 Tower-Archetypen mit je 2–3 Upgradepfaden → Build-Vielfalt.
- 8–12 Gegnertypen inkl. Spezialmechaniken, damit jede 3.–5. Welle neue Checks bringt.
- Wiederspielwert über Mutatoren (Random Start-Geld, Schnellere Gegner, „Kein Slow“-Run) und Leaderboard-Seeds.

## Tech/Performance/QA
- Performance: Objektpools (bereits vorhanden?) weiter nutzen; Batch-Draws; simpler LOD für viele Projektile/Swarm.
- Input-Konsistenz: Maus/Touch Calibration (bereits Fix umgesetzt), Zoom-Clamp & Camera Overscroll feinjustieren.
- Tests: Wellen-Snapshot-Tests (Counts/Intervals), Damage/Resist Regressionstests, Save/Load (wenn eingeführt).
- Debug-Overlays: Toggle für Range, Hitboxes, Path; Live FPS + Entity Counts (schon tlw. im Snapshot, in UI anzeigen).

## Kürzere Quick-Wins
- Reichweiten-/Validierungsringe polieren; bessere Platzierungs- und Upgrade-Tooltips.
- Wave-Vorschau HUD und „Start nächste Welle“ Button prominenter.
- Zusätzlicher Gegner (z.B. „Regenerator“ & „Stealth“) und ein neuer Tower (z.B. Kettenblitz) für unmittelbare Varianz.
- Ein Boss mit Phasen-Schild + Add-Spawn als Endwelle der aktuellen Map.
