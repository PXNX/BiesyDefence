# BiesyDefence Installationsanleitung für Ubuntu 24.04.3 LTS

## Übersicht

Diese Anleitung führt Sie durch die vollständige Einrichtung der Entwicklungsumgebung für das BiesyDefence Projekt auf Ubuntu 24.04.3 LTS.

## Systemvoraussetzungen

### Projekt-Analyse
BiesyDefence ist ein modernes Tower Defense Spiel mit folgenden technischen Anforderungen:

- **Frontend**: React 18.3.1 mit TypeScript
- **Build-Tool**: Vite 5.4.0
- **Testing**: Jest mit Testing Library
- **Code-Qualität**: ESLint, Prettier, Husky
- **Node.js-Version**: Erfordert Node.js 18+ (laut package.json)

## Vollständige Installationsanleitung

### Schritt 1: System vorbereiten
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Grundlegende Entwicklungswerkzeuge installieren
sudo apt install -y curl git wget build-essential unzip
```

### Schritt 2: Node.js und npm installieren
```bash
# Node.js 18.x LTS über NodeSource Repository installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation überprüfen
node --version  # Erwartet: v18.x.x oder höher
npm --version   # Erwartet: 9.x.x oder höher

# Optional: npm aktualisieren
sudo npm install -g npm@latest
```

### Schritt 3: Git konfigurieren (falls noch nicht geschehen)
```bash
git config --global user.name "Ihr Name"
git config --global user.email "ihre.email@example.com"
```

### Schritt 4: Projekt einrichten
```bash
# Zum Projektverzeichnis navigieren
cd /home/User/Downloads/BiesyDefence

# Projekt-Abhängigkeiten installieren
npm install

# Überprüfen, ob alle Abhängigkeiten installiert wurden
npm list --depth=0
```

### Schritt 5: Entwicklungsumgebung vorbereiten
```bash
# Pre-commit-Hooks einrichten
npm run prepare

# TypeScript-Kompilierung testen
npm run type-check

# ESLint-Konfiguration testen
npm run lint
```

## Überprüfungs- und Test-Schritte

### Schritt 6: Projekt testen
```bash
# Entwicklungsserver starten
npm run dev

# In einem neuen Terminal:
# Tests durchführen
npm test

# Test-Coverage prüfen
npm run test:coverage

# Build-Prozess testen
npm run build

# Bundle-Analyse durchführen
npm run build:analyze
```

### Schritt 7: Leistungstests
```bash
# Performance-Benchmarks durchführen
npm run perf:benchmark

# Bundle-Größe prüfen
npm run size:check
```

## Benötigte Abhängigkeiten im Detail

### System-Abhängigkeiten
- `curl` - Für Downloads von Repositories
- `git` - Versionskontrolle
- `wget` - Alternative Download-Tool
- `build-essential` - Kompilierungswerkzeuge
- `unzip` - Archiv-Extraktion

### Node.js-Pakete (automatisch via npm install)

#### Runtime-Abhängigkeiten:
- `react` 18.3.1 - UI-Bibliothek
- `react-dom` 18.3.1 - React DOM Renderer

#### Entwicklungs-Abhängigkeiten:
- `typescript` 5.5.4 - TypeScript-Kompilierer
- `vite` 5.4.0 - Moderner Build-Tool
- `@vitejs/plugin-react` 4.1.0 - React-Plugin für Vite
- `@vitejs/plugin-legacy` 5.4.1 - Legacy-Browser-Support
- `jest` 29.7.0 - Testing-Framework
- `@testing-library/react` 14.1.2 - React Testing Utilities
- `@testing-library/jest-dom` 6.1.4 - DOM Testing Utilities
- `@testing-library/user-event` 14.5.1 - User Event Simulation
- `eslint` 8.57.0 - JavaScript/TypeScript Linter
- `@typescript-eslint/eslint-plugin` 8.46.4 - TypeScript ESLint Rules
- `@typescript-eslint/parser` 8.46.4 - TypeScript Parser für ESLint
- `prettier` 3.2.5 - Code Formatter
- `husky` 8.0.3 - Git Hooks
- `lint-staged` 15.1.0 - Pre-commit Linting

## Empfohlene Entwicklungsumgebung

### VS Code Erweiterungen:
- TypeScript and JavaScript Language Features
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens

### Browser für Entwicklung:
- Chrome/Chromium mit React Developer Tools
- Firefox mit React Developer Tools

### Optionale Tools:
```bash
# Für eine bessere Entwicklungserfahrung
sudo apt install -y visual-studio-code
# Oder VS Code über Snap:
sudo snap install code --classic

# Browser für Tests
sudo apt install -y firefox chromium-browser
```

## Troubleshooting

### Häufige Probleme und Lösungen:

1. **Node.js-Version zu alt:**
   ```bash
   # Aktuelle Node.js-Version installieren
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **npm-Berechtigungsprobleme:**
   ```bash
   # npm-Verzeichnisrechte korrigieren
   sudo chown -R $(whoami) ~/.npm
   sudo chown -R $(whoami) /usr/local/lib/node_modules
   ```

3. **Speicherprobleme während der Installation:**
   ```bash
   # npm-Cache leeren
   npm cache clean --force
   # Installation erneut versuchen
   npm install
   ```

4. **TypeScript-Kompilierungsfehler:**
   ```bash
   # TypeScript-Abhängigkeiten überprüfen
   npm install --save-dev typescript@latest
   # Konfiguration validieren
   npm run type-check
   ```

5. **Port 3000 bereits belegt:**
   ```bash
   # Prozess finden und beenden
   sudo lsof -i :3000
   kill -9 <PID>
   # Oder anderen Port verwenden
   npm run dev -- --port 3001
   ```

## Projekt-spezifische Besonderheiten

### Besondere Konfigurationen:
- **Vite**: Moderne Build-Tool-Konfiguration mit Legacy-Support
- **TypeScript**: Strikte Typenprüfung mit Pfad-Aliasen (@/*)
- **Testing**: Jest mit jsdom-Umgebung und React Testing Library
- **Code-Qualität**: Pre-commit-Hooks mit Husky und lint-staged

### Performance-Anforderungen:
- Ziel: 60 FPS während des Spiels
- Bundle-Größe: <500KB JavaScript, <50KB CSS
- Memory-Nutzung: <50MB während erweiterter Sitzungen

### Nützliche npm-Skripte:
```bash
npm run dev          # Entwicklungsserver starten
npm run build        # Produktions-Build
npm run preview      # Build-Vorschau
npm run test         # Tests ausführen
npm run lint         # Code-Linting
npm run format       # Code-Formatierung
npm run type-check   # TypeScript-Prüfung
```

## Nach der Installation

Nach erfolgreicher Installation sollten Sie in der Lage sein:

1. Den Entwicklungsserver mit `npm run dev` zu starten
2. Auf http://localhost:3000 zuzugreifen
3. Tests mit `npm test` auszuführen
4. Den Build-Prozess mit `npm run build` zu testen

Bei Problemen überprüfen Sie die Konsolenausgaben und stellen Sie sicher, dass alle Abhängigkeiten korrekt installiert wurden.