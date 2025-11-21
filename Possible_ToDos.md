# TowerDefence Roadmap (konsolidiert)

Kurzer Kompass aus beiden bisherigen Listen plus Best Practices. Fokus: UI-Sichtbarkeit, spielbarer Loop, klare Konter, skalierbarer Content. Prioritaeten sind sequenziell gedacht; jede Stufe enthaelt DoD-Hinweise. Status-Tracking: Checkboxes geben Umsetzungsstand an (derzeit alles geplant, keine Runtime-Aenderungen erfolgt).

## P0 - unblock core gameplay (Woche 1) [Status: fertig]
- [x] Upgrade-UI freischalten: Tower-Panel mit zwei Pfaden, Kosten/Stat-Deltas, Konter-Hinweisen; Hotkey `U`/Context-Button.
  - Umsetzung: TowerDetails zeigen Upgrade-Pfad mit Stat-Deltas/Kosten + Hotkey-Hinweis; U-Hotkey bleibt, ControlPanel-Button entfernt.
- [x] Wave-Preview: naechste 2-3 Wellen mit Typ-Icons, Mengen, Resists/Tags; Warnhinweise "Armor/Speed/Swarm incoming".
  - Umsetzung: Snapshot liefert 3-Wellen-Preview inkl. Tags/Warnings; UI-Panel in Sidebar.
- [x] Platzierungs-/Range-Feedback: gruene/rote Validierung, pulsierende Range-Ringe, Snap-zu-Grid, klares Out-of-Bounds.
  - Umsetzung: Canvas-Highlight bleibt mit gueltig/ungueltig Farbcodes und Range-Ring; Snap/Bounds aus Input/Renderer beibehalten.
- [x] Gegner-Identitaet (Silhouetten/Farbcodes): visuelle Differenzierung aller existierenden 7 Typen; Shield/Speed/Swarm klar erkennbar.
  - Umsetzung: Tag-Badges/Colors erweitert (stealth/regenerator/splitter) im Renderer.
- [x] Basic Telemetrie: Last-Wave-Stats (Schaden nach Tower/Typ, Income), HUD klar fuer Money/Lives/Wave/FPS klein.
  - Umsetzung: Snapshot enthaelt lastWaveSummary (kills/leaks/reward/score) + HUD-Pills; FPS/Money/Lives/Wave bleiben sichtbar.
- [x] QoL: Auto-Wave-Option + schneller Skip, konsistente Kamera (Drag-Pan, Scroll-Zoom-Clamp).
  - Umsetzung: Auto-Wave-Toggle & Next-Button in GameControlPanel; Kamera-Handling unveraendert stabil.

## P1 - Infoschaerfe und fruehe Varianz (Wochen 2-3) [Status: fertig]
- [x] Neue Gegner: Stealth (Detection-Gate), Regenerator (Burst-Check), optional Splitter (AoE-Check); Tooltips aktualisieren.
  - Umsetzung: Profile + Tags/Resists/On-Death/Regeneration, Waves aktualisiert; Intel-Panel zeigt Werte.
- [x] Tooltips/Bestiary: Tower mit DPS und effektiver DPS vs. Resist, Range, FireRate, Effekte/Caps; Gegner mit HP/Speed/Resists und empfohlenen Kontern.
  - Umsetzung: TowerDetails mit Stat-Deltas/DPS, EnemyIntelPanel mit HP/Speed/Resists/Tags der naechsten Welle.
- [x] Treffer-Feedback: Hitmarker und Schadenszahlen togglbar, Status-Icons (slow/burn/freeze/vuln), Projektil-Trails per Damage-Typ.
  - Umsetzung: Hitmarker + Damage-Text Toggle bleibt im Backend (zukuenftiges Popup), Button aus HUD entfernt; Status-Badges fuer Tags; Trails via bestehende Partikel.
- [x] Wellen-Inszenierung: thematische Checks (Armor/Speed/Swarm/Boss-Phasen) mit kurzen Popups.
  - Umsetzung: Live-Announcement ergaenzt Wave-Warnungen aus Preview.
- [x] Wirtschaft/Tempo: Perfect-Wave-Bonus, leichter Interest/Fruehstarter-Bonus; Pause/Speed 0.5x/1x/2x/3x.
  - Umsetzung: No-Leak-Bonus + 5% Interest pro Abschluss; Speed-Steps per HUD + Hotkey N fuer Next-Wave; Auto-Wave-Backend bleibt, UI-Toggle entfernt.

## P2 - strategische Vielfalt (Wochen 4-6) [Status: fertig]
- [x] Neue Tower: Sniper (pierce, long-range ST), Flamethrower (cone DoT), Chain (jump arc). Assets/Icons-Pfade angelegt, Balancegroessen gesetzt.
- [x] Kartenvielfalt: 2 neue Layouts registriert (Canyon Split, Tri Route Delta) mit unterschiedlichen Path-Formen.
- [x] Erweiterte Kampfmechaniken: Damage-Types erweitert (pierce/chain/burn/freeze); Chain-Jumps mit Falloff, Burn-DoT, Pierce-Hard-Hit.
- [x] Tower-Upgrade-Visierung: Renderer zeigt Upgrade-Halo je Level; Upgrade-Pfade fuer neue Tuerme vorhanden.
- [ ] Balance/Tests: Noch offen – Snapshot-Tests und Balance-Regression fehlen; Telemetrie fuer DPS/$/Overkill weiterhin Erweiterungskandidat.

## P3 – Langzeitbindung (Woche 7+)
- Achievements und Seeded Challenge-Runs (Leaderboards spaeter), Daily/Weekly Modifier.
- Meta-Progress (kosmetisch/Loadout) nur wenn Kern-Balance stabil.
- Performance-Optimierung: Advanced culling/LOD, Asset-Optimierung; Profiling unter Content-Last.

## UI/UX Leitplanken
- HUD kompakt halten; Info-Overlays kontextuell (Hover/Prep-Phase), keine Dauer-Wand.
- Hotkeys: 1-5 Towerwahl, U Upgrade, R Rotate falls relevant, Space Start/Pause.
- Accessibility: Entsaettigte Farboption/Colorblind, togglebare Hitmarker/Numbers, Scroll-Zoom-Sensitivitaet.
- Top-Right Cleanup: Auto-Wave/Skip/Hit-FX/Upgrade Buttons aus dem HUD entfernt, nur Speed/Pause/Mute bleiben; Hit-FX Toggle bleibt im Backend fuer spaeteres Audio-/FX-Popup erhalten.

## Gameplay/Logik Leitplanken
- Konterklarheit: Resist/Tag-System im Tooltip; jede neue Einheit bringt eine neue Frage (Armor/Speed/Swarm/Stealth/Air) mit passender Antwort im Arsenal.
- Risiko/Belohnung: Auto-Wave und Fruehstarter-Bonus nicht zu hart stapeln; Interest soft-cap.
- Debuff-Caps offen kommunizieren (Slow/Vuln); diminishing returns sichtbar machen.

## Definition of Done pro Meilenstein
- P0: Upgrade-Loop bedienbar, Wave-Preview vorhanden, Gegner optisch unterscheidbar, Telemetrie sichtbar, 60 FPS bei bestehenden Wellen.
- P1: Neue Gegner integriert und lesbar, Tooltips komplett, Trefferfeedback togglbar, Wellen-Popups aktiv, Wirtschaft-Features getestet.
- P2: Mindestens 2 neue Tower und 2 neue Karten live, Terrain-Feature aktiv, neue Damage-Types in UI erklaert, Balance-Regressions gruen.
- P3: Mindestens 10 Achievements und 1 Daily/Weekly Seed, Performance-Profiling unter Content-Volllast, Leaderboard-Rahmen definiert.
