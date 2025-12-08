import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-7xl md:text-8xl text-warm-white mb-16 tracking-wide text-center"
        >
          La Gallerie
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-gray-400 text-xl md:text-2xl text-center max-w-4xl mb-20 leading-relaxed px-8"
        >
          Projetez des œuvres d'art du Metropolitan Museum, sélectionnées aléatoirement.
          <br />
          <span className="text-warm-white">Pensé pour vos spectacles d'improvisation.</span>
        </motion.p>

        {/* Bouton CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button onClick={() => navigate("/gallery")} size="xl">
            Accéder à l'application
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
