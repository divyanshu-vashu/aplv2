// export interface PlayerMatchStatsWithBatting{
//     playerId: string;
//     matchId: string;
//     // Enhanced Batting stats
//     runs?: number;
//     ballsFaced?: number;
//     fours?: number;
//     sixes?: number;
//     strikeRate?: number;
//     isNotOut?: boolean;
//     battingPosition?: number;
  
//     dismissalType?: 'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped' | 'hitWicket' | 'retired' | 'notOut';
//     dismissalBowler?: string;
//     dismissalFielder?: string;
//     dismissalDescription?: string;
//   }

//   export interface PlayerMatchStatsWithBowling{
//     playerId: string;
//     matchId: string;
  
//     bowlingBalls?: number;
//     bowlingOvers?: number;
//     maidens?: number;
//     runsConceded?: number;
//     wickets?: number;
//     wicketsPlayerId?:string[];
//     economy?: number;
//     wides?: number;
//     noBalls?: number;
//     dots?: number; // Dot balls bowled
//   }