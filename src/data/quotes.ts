/**
 * Citations d'artistes célèbres
 */

export interface ArtistQuote {
  text: string;
  author: string;
}

export const ARTIST_QUOTES: ArtistQuote[] = [
  // Grands maîtres classiques
  {
    text: "Le mauvais élève est celui qui ne dépasse jamais son maître.",
    author: "Léonard de Vinci"
  },
  {
    text: "La vraie maîtrise commence par la maîtrise de soi.",
    author: "Léonard de Vinci"
  },
  {
    text: "Un homme peint surtout avec son esprit, pas seulement avec ses mains.",
    author: "Michel-Ange"
  },
  {
    text: "Si l'on voyait le travail derrière mon talent, il ne paraîtrait plus si merveilleux.",
    author: "Michel-Ange"
  },
  {
    text: "La peinture n'est pas faite pour décorer les appartements, elle est un acte sérieux.",
    author: "Rembrandt"
  },
  {
    text: "Ceux qui traquent la perfection partout n'atteignent rien vraiment.",
    author: "Eugène Delacroix"
  },

  // Impressionnistes et modernes
  {
    text: "La couleur est mon obsession, mon plaisir et mon tourment de chaque jour.",
    author: "Claude Monet"
  },
  {
    text: "Peindre est facile quand on ne sait pas comment faire, très difficile quand on le sait.",
    author: "Edgar Degas"
  },
  {
    text: "Je veux surprendre la nature dans ce qu'elle a de plus vivant.",
    author: "Paul Cézanne"
  },
  {
    text: "La créativité demande du courage.",
    author: "Henri Matisse"
  },
  {
    text: "L'art rend visible l'invisible.",
    author: "Paul Klee"
  },

  // Contemporains et XXe siècle
  {
    text: "Le vrai artiste n'est pas celui qui se contente d'être inspiré, mais celui qui inspire les autres.",
    author: "Salvador Dalí"
  },
  {
    text: "Le rôle de l'artiste est toujours d'approfondir le mystère.",
    author: "Francis Bacon"
  },
  {
    text: "Je commence par des mots, puis j'efface pour laisser des traces.",
    author: "Jean-Michel Basquiat"
  },
  {
    text: "Le Graal, c'est de passer moins de temps à faire une image que les gens n'en mettront à la regarder.",
    author: "Banksy"
  },
  {
    text: "À l'avenir, chacun aura son quart d'heure de célébrité.",
    author: "Andy Warhol"
  },
  {
    text: "Un tableau vit par la présence de celui qui le regarde.",
    author: "Mark Rothko"
  },

  // Réflexions sur l'art en général
  {
    text: "Aucun grand artiste ne voit les choses comme elles sont vraiment, sinon il cesserait d'être artiste.",
    author: "Oscar Wilde"
  },
  {
    text: "L'imagination est plus importante que le savoir.",
    author: "Albert Einstein"
  },
  {
    text: "L'essence de l'art véritable est la gratitude.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Chaque artiste a d'abord été un amateur.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "L'art nous permet à la fois de nous trouver et de nous perdre.",
    author: "Thomas Merton"
  },

  // Citations de créativité et de pratique
  {
    text: "Je préférerais mourir de passion que mourir d'ennui.",
    author: "Vincent van Gogh"
  },
  {
    text: "Je me sens vraiment vivant seulement quand je peins.",
    author: "Vincent van Gogh"
  },
  {
    text: "Je me peins moi-même parce que c'est le sujet que je connais le mieux.",
    author: "Frida Kahlo"
  },
  {
    text: "Je n'invente rien, je redécouvre.",
    author: "Auguste Rodin"
  },
  {
    text: "Je suis indépendante, je peux vivre seule et j'adore travailler.",
    author: "Mary Cassatt"
  },
  {
    text: "Chaque artiste plonge son pinceau dans sa propre âme.",
    author: "Henry Ward Beecher"
  }
];

/**
 * Retourne une citation aléatoire
 */
export const getRandomQuote = (): ArtistQuote => {
  const randomIndex = Math.floor(Math.random() * ARTIST_QUOTES.length);
  return ARTIST_QUOTES[randomIndex];
};
