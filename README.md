# 🌟 Solar System Explorer - Interactive 3D Educational App

An immersive, interactive 3D educational web application that allows children to explore our solar system. Built with Next.js 15, React Three Fiber, and Framer Motion for smooth animations and engaging user experience.

![Solar System Explorer](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-3D-green) ![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animation-purple)

## 🚀 Features

### ✨ Interactive 3D Solar System
- **Real-time 3D rendering** of all planets in our solar system
- **Orbital mechanics** with realistic planet rotation and revolution
- **Smooth camera controls** - drag to rotate, scroll to zoom, click to select
- **Dynamic lighting** with the Sun as the primary light source

### 🎨 Beautiful UI & Animations
- **Framer Motion animations** for smooth modal transitions
- **Child-friendly fonts** (Comic Neue & Nunito)
- **Space-themed gradient backgrounds** and particle effects
- **Responsive design** that works on all devices

### 📚 Educational Content
- **Detailed planet information** with amazing facts for each celestial body
- **Interactive modals** with planet descriptions, facts, and visual representations
- **Kid-friendly descriptions** that make learning fun and engaging
- **Visual feedback** with hover effects and selection highlights

### 🔧 Technical Excellence
- **Next.js 15** with App Router for optimal performance
- **TypeScript** for type safety and better development experience
- **Performance optimizations** including memoization and lazy loading
- **Accessibility features** with proper ARIA labels and keyboard navigation

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **3D Graphics:** React Three Fiber + Drei
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Comic Neue, Nunito)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd nextjs_tatasurya
```

2. **Install dependencies**
```bash
npm install
```

3. **Add planet textures (optional)**
   - Download high-quality planet texture images
   - Place them in `public/textures/` directory
   - Name them according to the pattern: `sun.jpg`, `earth.jpg`, `mars.jpg`, etc.
   - See `public/textures/README.md` for detailed requirements

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000` to start exploring!

## 🎯 How to Use

### Navigation
- **🖱️ Drag:** Rotate the camera around the solar system
- **🔍 Scroll:** Zoom in and out for better views
- **👆 Click:** Select any planet to learn about it
- **⌨️ Escape:** Close planet information modal

### Features
- **Planet Selection:** Click on any celestial body to see detailed information
- **Smooth Animation:** Watch planets rotate on their axes and orbit the Sun
- **Educational Facts:** Learn amazing facts about each planet
- **Immersive Experience:** Full-screen 3D environment with starfield background

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout with fonts
│   │   └── page.tsx           # Main application page
│   ├── components/            # React components
│   │   ├── CelestialBody.tsx  # 3D planet component
│   │   ├── SolarSystemScene.tsx # Main 3D scene
│   │   └── PlanetInfoModal.tsx # Information modal
│   └── data/
│       └── planetData.ts      # Planet information database
├── public/
│   └── textures/              # Planet texture images
│       └── README.md          # Texture requirements guide
└── package.json               # Dependencies and scripts
```

## 🎨 Customization

### Adding New Planets or Celestial Bodies
1. Add planet data to `src/data/planetData.ts`
2. Add corresponding texture image to `public/textures/`
3. The component will automatically render the new celestial body

### Modifying Animations
- Adjust orbit speeds in the planet data
- Modify animation parameters in `CelestialBody.tsx`
- Customize modal animations in `PlanetInfoModal.tsx`

### Styling Changes
- Update color schemes in Tailwind classes
- Modify fonts in `src/app/layout.tsx`
- Adjust spacing and layouts in component files

## 🔧 Performance Optimizations

The application includes several performance optimizations:

- **React.memo** for preventing unnecessary re-renders
- **useCallback** for event handler memoization
- **Canvas performance settings** with device pixel ratio optimization
- **Lazy loading** with Suspense for 3D assets
- **Efficient texture loading** with fallback colors
- **Proper cleanup** of event listeners and animations

## 🌟 Educational Value

This application is designed to:
- **Spark curiosity** about space and astronomy
- **Provide factual information** in an engaging format
- **Encourage exploration** through interactive discovery
- **Support different learning styles** with visual, textual, and interactive elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **NASA** for planetary data and inspiration
- **Three.js community** for amazing 3D web graphics
- **React Three Fiber** team for the excellent React integration
- **Next.js** team for the fantastic framework

## 🐛 Troubleshooting

### Common Issues

**Textures not loading:**
- Ensure texture files are placed in `public/textures/`
- Check file names match the pattern in `planetData.ts`
- The app will use fallback colors if textures fail to load

**Performance issues:**
- Try reducing the number of stars in the background
- Lower the sphere geometry resolution in `CelestialBody.tsx`
- Disable shadows in `SolarSystemScene.tsx` if needed

**3D scene not rendering:**
- Ensure WebGL is supported in your browser
- Check browser console for Three.js related errors
- Try refreshing the page

---

**Ready to explore the universe? 🚀 Start your cosmic journey now!**
