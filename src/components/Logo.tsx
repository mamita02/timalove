interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

// On définit les hauteurs de l'image pour chaque taille
const logoHeights = {
  sm: "h-12",  // Mobile : augmenté de h-8 à h-12
  md: "h-16",  // Navbar Desktop : augmenté de h-10 à h-19
  lg: "h-32",  // Footer : augmenté de h-20 à h-32
};

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/src/assets/TYMA LOVEPlan de travail 2.png" 
        alt="TimaLove Logo" 
        // Utilisation de la variable logoHeights pour régler la hauteur
        className={`${logoHeights[size]} w-auto object-contain transition-transform hover:scale-105 duration-300`}
      />
    </div>
  );
};