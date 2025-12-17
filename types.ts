export interface Product {
    id: string;
    name: string;
    subtitle: string;
    price: string;
    description: string;
    materialStyle: 'standard' | 'metallic' | 'glass' | 'wireframe'; 
    colorTheme: {
        primary: string;   // Main shoe color
        secondary: string; // Laces/Details
        accent: string;    // Glow/Highlights
        bg: string;        // Background light color
    };
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    isLoading?: boolean;
}