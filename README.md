# BiesyDefence

A modern Tower Defense game built with Three.js and TypeScript, inspired by Factorio's factory-building mechanics.

## Features

- **2.5D Top-Down Perspective**: Immersive 3D graphics with strategic top-down gameplay
- **Modern Tech Stack**: Built with TypeScript, Vite, and Three.js
- **Factorio-inspired Mechanics**: Resource management and factory-like tower systems
- **Browser-based**: Play directly in your browser, no downloads required
- **Responsive Design**: Works on desktop and tablet devices

## Tech Stack

- **Language**: TypeScript
- **Build Tool**: Vite
- **Rendering**: Three.js
- **Code Quality**: ESLint + Prettier
- **Package Manager**: npm

## Project Structure

```
BiesyDefence/
├── src/
│   ├── game/                 # Core game logic
│   │   ├── core/            # Game loop and state management
│   │   ├── world/           # Map and level generation
│   │   ├── entities/        # Towers, enemies, projectiles
│   │   ├── systems/         # Wave, pathfinding, combat systems
│   │   └── config/          # Game balancing and constants
│   ├── graphics/            # Three.js rendering
│   │   ├── rendering/       # Renderer and scene management
│   │   ├── materials/       # Material configurations
│   │   └── postprocessing/  # Visual effects
│   └── ui/                  # HUD and interface elements
├── public/                  # Static assets
│   ├── textures/
│   ├── sprites/
│   ├── fonts/
│   └── audio/
└── ...
```

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies using the setup script:

```bash
# Using the provided setup script (Windows without admin rights)
./setup_env.bat npm install

# Or if Node.js is available globally
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Code quality checks
npm run lint
npm run format
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Legacy browser support is included via the `@vitejs/plugin-legacy` plugin.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Development Notes

- The game uses a modular architecture for easy expansion
- Three.js provides the 3D rendering capabilities
- TypeScript ensures type safety and better development experience
- Vite enables fast development and building
- ESLint and Prettier maintain code quality