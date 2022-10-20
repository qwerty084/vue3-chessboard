export interface LichessOpening {
  white: number;
  black: number;
  draws: number;
  moves: [
    {
      uci: string;
      san: string;
      averageRating: number;
      white: number;
      game: null;
      black: number;
      draws: number;
    }
  ];
  opening: {
    eco: string;
    name: string;
  } | null;
  topGames: [
    {
      id: string;
      uci: string;
      month: string;
      year: number;
      winner: 'white' | 'black' | null;
      white: {
        name: string;
        rating: number;
      };
      black: {
        name: string;
        rating: number;
      };
    }
  ];
}
