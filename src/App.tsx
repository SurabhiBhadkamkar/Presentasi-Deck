import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkles, Phone, ArrowRight, MoveLeft, Info } from "lucide-react";

// Generate points for SVG Starburst shapes
const generateStarburstPoints = (points: number, outer: number, inner: number): string => {
  const arr = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points;
    const r = i % 2 === 0 ? outer : inner;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    arr.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return arr.join(" ");
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slide1Ref = useRef<HTMLDivElement>(null);
  const slide2Ref = useRef<HTMLDivElement>(null);
  const slide3Ref = useRef<HTMLDivElement>(null);
  const slide4Ref = useRef<HTMLDivElement>(null);

  const [activeSlide, setActiveSlide] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Handle URL routing responsive updates
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new Event("popstate"));
  };

  // Handle resizing and store dimensions for responsive calculations
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Track scroll inside our main scrollable container
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  // Create a smoothed scroll progress using physics spring
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 95,
    damping: 24,
    restDelta: 0.001,
  });

  // Track active slide based on raw scroll progress (0 to 1 over 4 slides)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest < 0.22) {
        setActiveSlide(1);
      } else if (latest < 0.52) {
        setActiveSlide(2);
      } else if (latest < 0.82) {
        setActiveSlide(3);
      } else {
        setActiveSlide(4);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Is mobile viewport?
  const isMobile = dimensions.width < 768;

  // Responsive Burger Animations mapped over scroll progress [0, 0.33, 0.66, 1.0]
  // 1. Vertical translation (Y): Moves down relative to viewport to match landing spots
  const burgerY = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1.0],
    isMobile ? [120, 150, 180, 180] : [0, 140, 210, 210] // Slide down slightly in each slide
  );

  // 2. Horizontal translation (X): Moves left/right. In Slide 3, it moves to the left half!
  const burgerX = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1.0],
    isMobile
      ? [0, 0, -50, -50] // Slide left on mobile
      : [dimensions.width * 0.22, dimensions.width * 0.25, -dimensions.width * 0.30, -dimensions.width * 0.30] // Perfect alignment: starts right over star, stays right in Slide 2 to avoid text, then lands left in Slide 3 and sticks
  );

  // 3. Scale: Grows dynamically
  const burgerScale = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1.0],
    isMobile ? [0.85, 0.95, 0.72, 0.72] : [1.0, 1.15, 0.92, 0.92]
  );

  // 4. Rotation: Natural rotation during scroll
  const burgerRotate = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1.0],
    [0, 12, -4, -4] // Tilts right then straightens or tilts slightly left for menu landing
  );

  // 5. Opacity: stays fully visible through slides 1, 2, and 3, and remains fully visible so it sticks, while Slide 4 slides over it
  const burgerOpacity = useTransform(
    smoothProgress,
    [0, 0.33, 0.66, 1.0],
    [1, 1, 1, 1]
  );

  // Pre-calculated transforms for inner slide components declared at the top-level to follow hook rules
  const starburstRotate = useTransform(smoothProgress, [0, 0.5], [0, -35]);
  const starburstOpacity = useTransform(smoothProgress, [0, 0.35], [1, 0]);

  const slide2ShadowOpacity = useTransform(smoothProgress, [0.35, 0.75], [0, 0.45]);
  const slide2ShadowScale = useTransform(smoothProgress, [0.35, 0.75], [0.5, 1]);

  const slide3ShadowOpacity = useTransform(smoothProgress, [0.55, 0.8], [0, 0.45]);
  const slide3ShadowScale = useTransform(smoothProgress, [0.55, 0.8], [0.5, 1]);

  // Scroll to slide helper
  const scrollToSlide = (slideNum: number) => {
    const targetRef =
      slideNum === 1
        ? slide1Ref
        : slideNum === 2
        ? slide2Ref
        : slideNum === 3
        ? slide3Ref
        : slide4Ref;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Pre-calculated starburst geometries
  const yellowStarburstPoints = generateStarburstPoints(18, 92, 74);
  const redAsteriskPoints = generateStarburstPoints(8, 94, 25);

  const comboMealsLeft = [
    {
      id: "combo-1",
      title: "COMBO MEAL 1",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "120.00",
    },
    {
      id: "combo-2",
      title: "COMBO MEAL 2",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "110.00",
    },
    {
      id: "combo-3",
      title: "COMBO MEAL 3",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "130.00",
    },
  ];

  const comboMealsRight = [
    {
      id: "combo-4",
      title: "COMBO MEAL 4",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "140.00",
    },
    {
      id: "combo-5",
      title: "COMBO MEAL 5",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "150.00",
    },
    {
      id: "combo-6",
      title: "COMBO MEAL 6",
      description: "Classic Beef Burger, Golden Fries, Milkshake",
      price: "220.00",
    },
  ];

  // =======================================================================
  // ABOUT US VIEW (ROUTE: /aboutus)
  // =======================================================================
  if (currentPath === "/aboutus") {
    return (
      <div
        className="w-full min-h-screen bg-[#faf8f5] text-[#9e1218] relative select-none overflow-y-auto"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(158, 18, 24, 0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(158, 18, 24, 0.055) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        {/* HEADER FOR ROUTE */}
        <div className="w-full px-6 md:px-12 pt-6 md:pt-8">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <button
              onClick={() => navigateTo("/")}
              className="font-heading uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold text-[#9e1218]/90 hover:text-[#9e1218] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer pointer-events-auto"
            >
              <MoveLeft className="w-4.5 h-4.5" />
              <span>Presentasi Deck</span>
            </button>
            <div className="h-[1px] bg-[#9e1218]/25 flex-grow mx-4 md:mx-6"></div>
            <span className="font-heading uppercase tracking-[0.2em] text-[10px] md:text-xs font-extrabold text-[#9e1218] border-b-2 border-[#9e1218] pb-0.5">
              About Us
            </span>
          </div>
        </div>

        {/* MAIN BODY CONTAINER */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-16 lg:px-28 py-12 md:py-20 flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-140px)]">
          {/* Left Column: Bold Rounded Header, Subtext and Red Asterisk */}
          <div className="w-full md:w-[50%] flex flex-col justify-center text-left relative pr-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col select-none"
            >
              <h2
                className="text-[12vw] md:text-[7vw] font-display uppercase leading-none tracking-tight text-[#9e1218]"
                style={{
                  WebkitTextStroke: "1px #9e1218",
                  filter: "drop-shadow(2px 3px 0px rgba(0,0,0,0.05))",
                }}
              >
                About Us
              </h2>

              <p className="text-sm md:text-base lg:text-lg text-[#9e1218] max-w-[450px] leading-relaxed font-sans font-semibold mt-6">
                Borcelle Burgers is dedicated to serving mouth-watering burgers that
                are crafted with passion and precision.
              </p>
            </motion.div>

            {/* Central Hand-drawn-style Red Asterisk/Starburst */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 12 }}
              transition={{ delay: 0.25, type: "spring", stiffness: 80 }}
              className="mt-10 ml-12 md:ml-24 pointer-events-none select-none"
            >
              <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20 text-[#9e1218] fill-current">
                <path d="M 46,10 L 54,10 L 54,42 L 76,20 L 82,26 L 60,48 L 82,70 L 76,76 L 54,54 L 54,86 L 46,86 L 46,54 L 24,76 L 18,70 L 40,48 L 18,26 L 24,20 L 46,42 Z" />
              </svg>
            </motion.div>
          </div>

          {/* Right Column: Polaroid Image with Metal Paperclip and Mission Subtext */}
          <div className="w-full md:w-[50%] flex flex-col justify-center items-center md:items-start text-left pl-2 relative mt-12 md:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
              animate={{ opacity: 1, scale: 1, rotate: 3 }}
              transition={{ duration: 0.7, type: "spring", damping: 15 }}
              className="relative bg-white p-4 pb-8 shadow-[0_15px_35px_rgba(0,0,0,0.12)] border border-gray-200/50 transform max-w-[320px] md:max-w-[380px] hover:rotate-0 hover:scale-[1.03] transition-all duration-300 cursor-pointer mb-8"
            >
              {/* Metallic Paperclip overlaying the top right of the white border */}
              <svg
                viewBox="0 0 100 200"
                className="absolute -top-7 right-4 w-10 h-20 drop-shadow-[2px_3px_5px_rgba(0,0,0,0.22)] z-20 pointer-events-none select-none"
              >
                <path
                  d="M 30,140 L 30,50 A 20,20 0 0,1 70,50 L 70,150 A 30,30 0 0,1 10,150 L 10,70 A 15,15 0 0,1 40,70 L 40,130"
                  fill="none"
                  stroke="#909090"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 30,140 L 30,50 A 20,20 0 0,1 70,50 L 70,150 A 30,30 0 0,1 10,150 L 10,70 A 15,15 0 0,1 40,70 L 40,130"
                  fill="none"
                  stroke="#d6d6d6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Inner photo combo snapshot */}
              <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 rounded-sm">
                <img
                  src="/src/assets/images/burger_fries_combo_1782662286820.jpg"
                  alt="Borcelle Burger Combo Snapshot"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-2 text-center text-xs font-mono font-medium tracking-wider text-gray-400">
                Page 2: Passion & Flavor
              </div>
            </motion.div>

            {/* Mission Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-sm md:text-base text-[#9e1218] max-w-[420px] leading-relaxed font-sans font-semibold md:pl-2"
            >
              Our mission is to create a unique dining experience by focusing on
              quality, flavor, and customer satisfaction.
            </motion.p>
          </div>
        </div>

        {/* Torn Kraft Paper Corner Decor in the bottom-left */}
        <div className="absolute bottom-0 left-0 w-64 h-36 md:w-[480px] md:h-56 pointer-events-none select-none z-10">
          <svg viewBox="0 0 400 200" className="w-full h-full fill-[#c6a785] drop-shadow-[2px_-4px_10px_rgba(0,0,0,0.12)]">
            <path d="M 0,200 L 0,100 C 40,112 75,70 110,88 C 145,106 170,58 215,76 C 260,94 290,62 340,90 C 375,108 390,82 400,100 L 400,200 Z" />
            <path
              d="M 0,200 L 0,110 C 35,120 72,82 105,98 C 140,114 168,68 210,84 C 255,100 285,72 335,98 C 370,114 388,92 400,112 L 400,200 Z"
              className="fill-[#b39575]"
            />
          </svg>
        </div>

        {/* PERSISTENT FOOTER ON ABOUTUS VIEW */}
        <div className="w-full px-6 md:px-12 pb-6 md:pb-8">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto border-t border-[#9e1218]/15 pt-4">
            <span className="font-heading tracking-wider text-[10px] md:text-xs font-semibold text-[#9e1218]/90">
              Presented by Surabhi Bhadkamkar
            </span>
            <span className="font-heading uppercase tracking-widest text-[10px] md:text-xs font-extrabold text-[#9e1218]">
              Fast, Tasty, Affordable
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =======================================================================
  // PRESENTATION VIEW (ROUTE: /)
  // =======================================================================
  return (
    <div
      ref={containerRef}
      className="w-full h-screen overflow-y-scroll snap-y snap-mandatory bg-[#9e1218] text-white relative select-none scroll-smooth"
      style={{ scrollbarWidth: "thin" }}
    >
      {/* PERSISTENT HEADER (Sleek original deck style) */}
      <div className="fixed top-0 left-0 w-full z-40 px-6 md:px-12 pt-6 md:pt-8 pointer-events-none">
        <div className="flex items-center justify-between w-full">
          <span className="font-heading uppercase tracking-[0.2em] text-[10px] md:text-xs font-semibold text-white/95">
            Presentasi Deck
          </span>
          <div className="h-[1px] flex-grow mx-4 md:mx-6 bg-white/25"></div>
          <button
            id="header-about-us-btn"
            onClick={() => navigateTo("/aboutus")}
            className="font-heading uppercase tracking-[0.2em] text-[10px] md:text-xs font-extrabold pointer-events-auto cursor-pointer hover:scale-105 hover:text-[#fed136] transition-all duration-300 text-white/95"
          >
            About Us
          </button>
        </div>
      </div>

      {/* PERSISTENT FOOTER */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-6 md:px-12 pb-6 md:pb-8 pointer-events-none">
        <div className="flex items-center justify-between w-full">
          <span className="font-heading tracking-wider text-[10px] md:text-xs font-medium text-white/95">
            Presented by Surabhi Bhadkamkar
          </span>
          <div className="h-[1px] flex-grow mx-4 md:mx-6 bg-white/25"></div>
          <span className="font-heading uppercase tracking-widest text-[10px] md:text-xs font-semibold text-[#fed136]">
            Fast, Tasty, Affordable
          </span>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION DOTS (Clickable) */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
        <button
          id="nav-dot-1"
          onClick={() => scrollToSlide(1)}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
            activeSlide === 1
              ? "bg-[#fed136] border-[#fed136] scale-125 shadow-lg shadow-[#fed136]/30"
              : "bg-transparent border-white/40 hover:border-white/70"
          }`}
          title="Slide 1: Pitch Deck"
        />
        <button
          id="nav-dot-2"
          onClick={() => scrollToSlide(2)}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
            activeSlide === 2
              ? "bg-[#fed136] border-[#fed136] scale-125 shadow-lg shadow-[#fed136]/30"
              : "bg-transparent border-white/40 hover:border-white/70"
          }`}
          title="Slide 2: About the Brand"
        />
        <button
          id="nav-dot-3"
          onClick={() => scrollToSlide(3)}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
            activeSlide === 3
              ? "bg-[#fed136] border-[#fed136] scale-125 shadow-lg shadow-[#fed136]/30"
              : "bg-transparent border-white/40 hover:border-white/70"
          }`}
          title="Slide 3: Burger Menu"
        />
        <button
          id="nav-dot-4"
          onClick={() => scrollToSlide(4)}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border-2 ${
            activeSlide === 4
              ? "bg-[#fed136] border-[#fed136] scale-125 shadow-lg shadow-[#fed136]/30"
              : "bg-transparent border-white/40 hover:border-white/70"
          }`}
          title="Slide 4: Special Combo Flyer"
        />
      </div>

      {/* =======================================================================
          SLIDE 1: PITCH DECK INTRO
          ======================================================================= */}
      <section
        ref={slide1Ref}
        className="w-full h-screen snap-start relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pt-16 md:pt-0 pb-16 md:pb-0 overflow-hidden"
      >
        {/* Left Column: Heading Text */}
        <div className="w-full md:w-[55%] flex flex-col justify-center h-full z-10 relative">
          {/* Decorative Red Asterisk behind text */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-48 h-48 md:w-72 md:h-72 text-[#a3141b] -z-10 pointer-events-none">
            <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
              <polygon points={redAsteriskPoints} />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col text-left select-none pointer-events-none"
          >
            <h1 className="text-[13vw] md:text-[8vw] lg:text-[7.5vw] font-display uppercase leading-[0.82] tracking-tight text-white">
              Fast Food
            </h1>
            <h1 className="text-[13vw] md:text-[8vw] lg:text-[7.5vw] font-display uppercase leading-[0.82] tracking-tight text-white mt-1">
              Business
            </h1>
            <h1 className="text-[13vw] md:text-[8vw] lg:text-[7.5vw] font-display uppercase leading-[0.82] tracking-tight text-[#fed136] mt-1">
              Pitch Deck
            </h1>
          </motion.div>

          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-8 flex items-center gap-2.5 bg-[#a6131a] border border-white/10 px-4 py-2 rounded-full w-fit cursor-pointer hover:bg-[#b81720] transition-all pointer-events-auto"
            onClick={() => scrollToSlide(2)}
          >
            <Sparkles className="w-4 h-4 text-[#fed136] animate-pulse" />
            <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-white">
              Scroll down to slide burger
            </span>
            <ChevronDown className="w-4 h-4 text-[#fed136] animate-bounce" />
          </motion.div>
        </div>

        {/* Right Column Area: Acts as a layout boundary. */}
        <div className="w-full md:w-[45%] h-1/2 md:h-full flex items-center justify-center relative">
          <div className="w-[75vw] h-[75vw] md:w-[35vw] md:h-[35vw] max-w-[420px] max-h-[420px] aspect-square flex items-center justify-center relative">
            {/* Spinning Yellow Starburst */}
            <motion.div
              style={{
                rotate: starburstRotate,
                opacity: starburstOpacity,
              }}
              className="absolute inset-0 w-full h-full text-[#fed136] drop-shadow-[0_10px_20px_rgba(0,0,0,0.18)]"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                <polygon points={yellowStarburstPoints} />
              </svg>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 2: ABOUT THE BRAND
          ======================================================================= */}
      <section
        ref={slide2Ref}
        className="w-full h-screen snap-start relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pt-20 md:pt-0 pb-16 md:pb-0 overflow-hidden bg-[#9e1218]"
      >
        {/* Left Column: Brand Info & Slanted Stickers */}
        <div className="w-full md:w-[50%] flex flex-col justify-center h-full z-10 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4 pointer-events-none"
          >
            <h2 className="text-[11vw] md:text-[6.5vw] font-display uppercase leading-none tracking-tight text-white">
              About The Brand
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-white/95 max-w-[500px] leading-relaxed font-sans font-medium mt-1">
              A modern fast-food brand offering delicious fast food at affordable
              prices with quick service.
            </p>
          </motion.div>

          {/* Tilted Sticker Badges */}
          <div className="flex flex-col gap-3.5 mt-8 md:mt-12 select-none w-fit">
            <motion.div
              initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
              whileInView={{ opacity: 1, rotate: -4, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="bg-[#fed136] text-[#9e1218] px-6 py-2 shadow-lg shadow-black/15 font-display text-xl md:text-2xl uppercase tracking-wider rounded-sm border border-white/5 w-fit cursor-pointer hover:scale-105 hover:-rotate-6 transition-transform"
            >
              FAST SERVICE
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: 15, scale: 0.8 }}
              whileInView={{ opacity: 1, rotate: 3, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
              className="bg-[#fed136] text-[#9e1218] px-6 py-2 shadow-lg shadow-black/15 font-display text-xl md:text-2xl uppercase tracking-wider rounded-sm border border-white/5 w-fit cursor-pointer hover:scale-105 hover:rotate-5 transition-transform ml-4 md:ml-8"
            >
              EVERYDAY CHOICE
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: -10, scale: 0.8 }}
              whileInView={{ opacity: 1, rotate: -2, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
              className="bg-[#fed136] text-[#9e1218] px-6 py-2 shadow-lg shadow-black/15 font-display text-xl md:text-2xl uppercase tracking-wider rounded-sm border border-white/5 w-fit cursor-pointer hover:scale-105 hover:-rotate-4 transition-transform ml-2 md:ml-4"
            >
              GREAT TASTE
            </motion.div>
          </div>
        </div>

        {/* Right Column: Landing site for the burger with fading shadow */}
        <div className="w-full md:w-[50%] h-1/2 md:h-full flex items-center justify-center relative">
          <div className="w-[75vw] h-[75vw] md:w-[35vw] md:h-[35vw] max-w-[420px] max-h-[420px] aspect-square flex items-center justify-center relative">
            <motion.div
              style={{
                opacity: slide2ShadowOpacity,
                scale: slide2ShadowScale,
              }}
              className="absolute bottom-2 md:bottom-8 w-[80%] h-12 bg-black/40 blur-2xl rounded-full pointer-events-none"
            />
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 3: BURGER MENU / COMBO MEALS
          ======================================================================= */}
      <section
        ref={slide3Ref}
        className="w-full h-screen snap-start relative flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24 pt-20 md:pt-0 pb-16 md:pb-0 overflow-hidden bg-[#9e1218]"
      >
        {/* Dynamic Slanted Checkerboard Pattern on Left side */}
        <div className="absolute left-0 top-0 bottom-0 w-24 md:w-36 overflow-hidden pointer-events-none z-0 opacity-80 select-none">
          <div className="h-full w-full flex flex-col transform skew-x-12 -translate-x-12">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex h-[6%] w-full">
                <div className={`w-1/2 h-full ${i % 2 === 0 ? "bg-[#fed136]" : "bg-transparent"}`} />
                <div className={`w-1/2 h-full ${i % 2 === 1 ? "bg-[#fed136]" : "bg-transparent"}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Left Spacer for Burger landing area */}
        <div className="w-full md:w-[35%] h-1/4 md:h-full flex items-end justify-center relative z-10 pointer-events-none">
          <motion.div
            style={{
              opacity: slide3ShadowOpacity,
              scale: slide3ShadowScale,
            }}
            className="absolute bottom-4 left-4 md:left-12 w-[85%] h-10 bg-black/40 blur-2xl rounded-full"
          />
        </div>

        {/* Right Column: Title and Combo Menu Items */}
        <div className="w-full md:w-[65%] flex flex-col justify-center h-full z-10 text-left px-2 md:px-6 relative">
          <div className="mb-6 md:mb-10 select-none">
            <h2 className="text-[10vw] md:text-[5.5vw] font-display uppercase leading-none tracking-tight text-white">
              Burger Menu
            </h2>
            <p className="text-xs md:text-sm font-heading font-semibold uppercase tracking-[0.25em] text-[#fed136] mt-1">
              Combo Meals
            </p>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full max-w-4xl">
            {/* Left Column of Combo Meals */}
            <div className="flex flex-col gap-6">
              {comboMealsLeft.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  id={meal.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group flex flex-col border-b border-[#fed136]/30 pb-4 hover:border-[#fed136]/80 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-heading font-bold text-sm md:text-base tracking-wider text-white group-hover:text-[#fed136] transition-colors">
                      {meal.title}
                    </h3>
                    <span className="font-sans font-extrabold text-base md:text-lg text-[#fed136]">
                      {meal.price}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 font-sans font-medium mt-1 group-hover:text-white transition-colors">
                    {meal.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Right Column of Combo Meals */}
            <div className="flex flex-col gap-6">
              {comboMealsRight.map((meal, index) => (
                <motion.div
                  key={meal.id}
                  id={meal.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index + 3) * 0.1, duration: 0.5 }}
                  className="group flex flex-col border-b border-[#fed136]/30 pb-4 hover:border-[#fed136]/80 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-heading font-bold text-sm md:text-base tracking-wider text-white group-hover:text-[#fed136] transition-colors">
                      {meal.title}
                    </h3>
                    <span className="font-sans font-extrabold text-base md:text-lg text-[#fed136]">
                      {meal.price}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-white/80 font-sans font-medium mt-1 group-hover:text-white transition-colors">
                    {meal.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================================
          SLIDE 4: DYNAMIC PEÇA SEU COMBO FLYER (HIGH-FIDELITY COMMERCIAL RETRO)
          ======================================================================= */}
      <section
        ref={slide4Ref}
        className="w-full h-screen snap-start relative z-35 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(circle, rgba(158, 18, 24, 0.2) 20%, rgba(0, 0, 0, 0.6) 100%), repeating-conic-gradient(from 0deg, #9e1218 0deg 6deg, #810e12 6deg 12deg)",
        }}
      >
        {/* Dynamic Inner Container holding the Flyer poster elements */}
        <div className="w-full max-w-4xl px-6 flex flex-col h-full justify-between py-16 md:py-20 z-10 relative">
          
          {/* Top @GRANDESITE text tag */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-heading text-xs md:text-sm font-extrabold tracking-[0.3em] text-white/95 mt-4 select-none"
          >
            @GRANDESITE
          </motion.div>

          {/* Header Title block */}
          <div className="text-center flex flex-col items-center select-none -mt-4 md:-mt-2">
            {/* Tilted Yellow banner brush stroke container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -3 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 120 }}
              className="bg-[#fed136] text-[#9e1218] px-6 py-1.5 md:px-10 md:py-2.5 font-display text-lg md:text-3xl uppercase tracking-widest rounded-md shadow-[0_5px_15px_rgba(0,0,0,0.2)] border border-[#ffd645]"
            >
              ★ PEÇA SEU ★
            </motion.div>

            {/* Huge comic outline title "COMBO" */}
            <motion.h2
              initial={{ opacity: 0, scale: 1.15 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-9xl font-display uppercase tracking-wider text-white -mt-2 md:-mt-4 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
              style={{
                textShadow: "4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000",
              }}
            >
              COMBO
            </motion.h2>
          </div>

          {/* Central Composite Section: Product Image and Details Grid */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 w-full -mt-2 md:-mt-4">
            
            {/* High-res generated combo photograph */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-[55vw] h-[35vw] md:w-[350px] md:h-[240px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.45)] border border-white/10"
            >
              <img
                src="/src/assets/images/cola_fries_burger_combo_1782662855688.jpg"
                alt="Delicious Combo Meal"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>

            {/* Descriptive Content and Giant Price details */}
            <div className="flex flex-col md:flex-col items-center md:items-start justify-center gap-4 text-center md:text-left select-none">
              
              {/* Slanted text details */}
              <div className="flex flex-col font-display text-xl md:text-3xl tracking-wide uppercase italic leading-[1.1] text-[#faf8f5]">
                <span>BURGER</span>
                <span className="text-[#fed136]">FRITAS MÉDIA</span>
                <span>REFRI 350ML</span>
              </div>

              {/* Price bracket layout with giant comic shadow */}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex flex-col text-right leading-none select-none">
                  <span className="text-[#fed136] font-display text-xl md:text-2xl">Rs</span>
                  <span className="text-white font-sans text-[8px] md:text-[10px] font-extrabold tracking-widest whitespace-nowrap opacity-90">
                    A PARTIR DE
                  </span>
                </div>
                <span
                  className="text-6xl md:text-8xl font-display text-[#fed136] tracking-tight leading-none"
                  style={{
                    textShadow: "4px 4px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000",
                  }}
                >
                  999
                </span>
              </div>

            </div>
          </div>

          {/* Bottom Call-to-Action order area and footer in #ffd136 */}
          <div className="w-full mt-auto select-none pb-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full bg-[#ffd136] text-[#9e1218] p-4 md:p-5 rounded-2xl shadow-2xl border border-[#ffe473] flex flex-col md:flex-row items-center justify-between gap-4"
            >
              {/* Call No */}
              <div className="flex items-center gap-3">
                <div className="bg-[#9e1218] text-[#ffd136] p-2.5 rounded-full animate-pulse">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-heading uppercase tracking-wider opacity-75 font-bold">Call / WhatsApp</span>
                  <a href="tel:9082699149" className="font-display text-xl md:text-2xl tracking-wider hover:underline pointer-events-auto">
                    9082699149
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex flex-col items-center md:items-start leading-tight max-w-xs text-center md:text-left">
                <span className="text-[10px] font-heading uppercase tracking-wider opacity-75 font-bold mb-1">📍 Our Address</span>
                <span className="font-sans font-extrabold text-xs md:text-sm tracking-wide">
                  Borcelle Burger Corner, 45 Gourmet Boulevard, Mumbai, MH 400001
                </span>
              </div>

              {/* Email */}
              <div className="flex flex-col items-center md:items-end leading-tight text-center md:text-right">
                <span className="text-[10px] font-heading uppercase tracking-wider opacity-75 font-bold mb-1">✉️ Email Support</span>
                <a href="mailto:order@borcelleburgers.com" className="font-sans font-extrabold text-xs md:text-sm tracking-wide hover:underline pointer-events-auto">
                  order@borcelleburgers.com
                </a>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* =======================================================================
          THE SEAMLESS SCROLLING BURGER ASSET (PERSISTENT LAYER)
          ======================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-30 flex items-center justify-center">
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-between px-6 md:px-16 lg:px-24">
          <div className="w-full h-full flex items-center justify-center relative pointer-events-none">
            <motion.div
              style={{
                y: burgerY,
                x: burgerX,
                scale: burgerScale,
                rotate: burgerRotate,
                opacity: burgerOpacity,
              }}
              className="absolute w-[62vw] h-[62vw] md:w-[32vw] md:h-[32vw] max-w-[380px] max-h-[380px] aspect-square flex items-center justify-center relative pointer-events-none"
            >
              <div
                className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-white/0"
                style={{
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
                }}
              >
                <img
                  src="/src/assets/images/delicious_burger_red_bg_1782661091205.jpg"
                  alt="Juicy Fast Food Burger"
                  referrerPolicy="no-referrer"
                  className="w-[105%] h-[105%] object-cover object-center"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
