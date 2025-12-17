import React, { useState } from 'react';
import Experience from './components/Experience';
import GeminiAssistant from './components/GeminiAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { Product } from './types';

// --- DATA: Product Catalog ---
const PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'ZYRA ULTRA',
        subtitle: 'VOLT GREEN EDITION',
        price: '$240.00',
        description: "Don't chase the go. Wear ZYRA. Standard fit with bioluminescent mesh technology.",
        materialStyle: 'standard',
        colorTheme: {
            primary: '#39e75f', // Green
            secondary: '#8fff00',
            accent: '#39e75f',
            bg: '#0a1a0f'
        }
    },
    {
        id: '2',
        name: 'ZYRA MAGMA',
        subtitle: 'CRIMSON CORE',
        price: '$265.00',
        description: "Forged in heat. The Magma edition features a full metallic chassis and reactive heat-map soles.",
        materialStyle: 'metallic',
        colorTheme: {
            primary: '#ef4444', // Red
            secondary: '#7f1d1d',
            accent: '#b91c1c',
            bg: '#1a0505'
        }
    },
    {
        id: '3',
        name: 'ZYRA AZURE',
        subtitle: 'DEEP OCEAN',
        price: '$250.00',
        description: "Pure transparency. Constructed from recycled ocean glass-polymer for a weightless feel.",
        materialStyle: 'glass',
        colorTheme: {
            primary: '#0ea5e9', // Blue
            secondary: '#bae6fd',
            accent: '#0369a1',
            bg: '#081826'
        }
    },
    {
        id: '4',
        name: 'ZYRA PHANTOM',
        subtitle: 'MIDNIGHT OPS',
        price: '$280.00',
        description: "Stealth mode engaged. Tactical wireframe weave for maximum breathability and zero weight.",
        materialStyle: 'wireframe',
        colorTheme: {
            primary: '#ffffff', // White wireframe on black
            secondary: '#333333',
            accent: '#4b5563',
            bg: '#000000'
        }
    }
];

export default function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHoveringProduct, setIsHoveringProduct] = useState(false);

  const currentProduct = PRODUCTS[currentIndex];

  const changeProduct = (newIndex: number) => {
    setCurrentIndex(newIndex);
  };

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
  };

  return (
    <div 
        className="relative w-full h-screen text-white overflow-hidden selection:bg-white selection:text-black transition-colors duration-1000"
        style={{ backgroundColor: currentProduct.colorTheme.bg }}
    >
      
      {/* 
         3D SCROLL CANVAS 
         This now occupies the entire background and handles the scrolling content 
      */}
      <div className="absolute inset-0 z-0">
        <Experience active={isHoveringProduct} product={currentProduct} />
      </div>

      {/* 
         FIXED UI LAYER 
         Elements here stay on screen regardless of scroll position 
      */}
      <div className="absolute inset-0 z-50 pointer-events-none">
        
        {/* Navbar (Fixed Top) */}
        <nav className="absolute top-0 w-full p-6 md:px-12 flex justify-between items-center pointer-events-auto bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center gap-4">
                <h1 className="text-3xl font-display tracking-widest text-white mix-blend-difference">ZYRA</h1>
            </div>
            
            <div className="hidden md:flex gap-8 text-sm font-medium tracking-widest text-white/60">
                {['NEW RELEASES', 'MEN', 'WOMEN', 'KIDS'].map((item) => (
                    <a key={item} href="#" className="hover:text-white transition-colors duration-300">{item}</a>
                ))}
            </div>

            <div className="flex gap-6 items-center">
                <button 
                    onClick={() => setIsAiOpen(true)}
                    className="flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white hover:text-black px-4 py-2 rounded-full transition-all backdrop-blur-sm border border-white/10"
                >
                    <MessageSquare className="w-3 h-3" />
                    ASK AI
                </button>
                <div className="relative cursor-pointer group">
                    <ShoppingBag className="w-6 h-6 text-white transition-colors" />
                    <span 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-black"
                        style={{ backgroundColor: currentProduct.colorTheme.primary }}
                    ></span>
                </div>
                <Menu className="md:hidden w-6 h-6 text-white" />
            </div>
        </nav>

        {/* Product Carousel (Fixed Bottom) */}
        <div className="absolute bottom-0 w-full z-50 pointer-events-auto pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-xs font-bold tracking-widest text-white/50">SELECT EDITION</span>
                    <div className="flex gap-2">
                        <button onClick={prevProduct} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={nextProduct} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    {PRODUCTS.map((prod, index) => (
                        <div 
                            key={prod.id} 
                            onClick={() => changeProduct(index)}
                            className={`
                                relative min-w-[160px] h-20 rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden group snap-center flex-shrink-0
                                ${index === currentIndex ? 'border-white scale-100 bg-white/10' : 'border-white/10 scale-95 opacity-60 hover:opacity-100'}
                            `}
                            style={{ borderColor: index === currentIndex ? prod.colorTheme.primary : '' }}
                        >
                            <div className="absolute inset-0 p-3 flex flex-col justify-center z-10">
                                <h4 className="font-display text-sm tracking-wide leading-none">{prod.name.split(' ')[1]}</h4>
                                <span className="text-[10px] text-gray-400 mt-1">{prod.subtitle}</span>
                            </div>
                            
                            {/* Glow Effect */}
                            <div 
                                className="absolute -right-2 -bottom-2 w-16 h-16 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
                                style={{ backgroundColor: prod.colorTheme.primary }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

      {/* AI Sidebar */}
      <GeminiAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}