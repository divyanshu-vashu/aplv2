import { Timestamp } from 'firebase/firestore';
// Player stats for a specific match




export interface PlayerMatchStats {
  playerId: string;
  matchId: string;
  
  // Enhanced Batting stats
  runs?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  isNotOut?: boolean;
  battingPosition?: number;
  
  // Enhanced Dismissal types
  dismissalType?: 'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped' | 'hitWicket' | 'retired' | 'notOut';
  dismissalBowler?: string;
  dismissalFielder?: string;
  dismissalDescription?: string;
  
  // Enhanced Bowling stats
  bowlingBalls?: number;
  bowlingOvers?: number;
  maidens?: number;
  runsConceded?: number;
  wickets?: number;
  economy?: number;
  wides?: number;
  noBalls?: number;
  dots?: number; // Dot balls bowled
}

export interface PlayerMatchStatsWithBatting{
  playerId: string;
  matchId: string;
  // Enhanced Batting stats
  runs?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  isNotOut?: boolean;
  battingPosition?: number;

  dismissalType?: 'bowled' | 'caught' | 'lbw' | 'runOut' | 'stumped' | 'hitWicket' | 'retired' | 'notOut';
  dismissalBowler?: string;
  dismissalFielder?: string;
  dismissalDescription?: string;
}
export interface PlayerMatchStatsWithBowling{
  playerId: string;
  matchId: string;

  bowlingBalls?: number;
  bowlingOvers?: number;
  maidens?: number;
  runsConceded?: number;
  wickets?: number;
  wicketsPlayerId?:string[];
  economy?: number;
  wides?: number;
  noBalls?: number;
  dots?: number; // Dot balls bowled
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[]; // References to Player documents
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FallOfWicket {
  wicket: number;
  score: string;
  playerOut: string;
  overs: number;
  balls: number;
  runs: number;
  bowler: string;
  partnership?: Partnership;
  dismissalType?: string;
  dismissalDescription?: string;
}

export interface Partnership {
  runs: number;
  balls: number;
  player1Id: string;
  player2Id: string;
  overRange: {
    start: number;
    end: number;
  };
  runRate: number;
}

export interface Extras {
  byes: number;
  legByes: number;
  wides: number;
  noBalls: number;
  penalties: number;
  total: number;
}

export interface Innings {
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  extras: Extras;
  fallOfWickets: FallOfWicket[];
  partnerships: Partnership[];
  battingOrder: string[]; // Array of player IDs in batting order
  didNotBat: string[]; // Array of player IDs who didn't bat
}

export interface Score {
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate?: number;
  requiredRunRate?: number;
  projectedScore?: number;
}



export interface MatchResult {
  winner: string;
  winningTeam?: {
    id: string;
    name: string;
    margin: {
      runs?: number;
      wickets?: number;
    };
  } | null;
  margin: string;
  description: string;
  matchSummary?: string;
  playerOfMatch?: string;
}


export interface Player {
  id: string;
  name: string;
  teamId: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  
  // Career stats (calculated from match stats)
  careerStats: {
    matches: number;
    totalRuns: number;
    totalBallsFaced: number;
    totalFours: number;
    totalSixes: number;
    highestScore: number;
    average: number;
    strikeRate: number;
    
    // Bowling career
    totalWickets: number;
    totalOvers: number;
    totalMaidens: number;
    totalRunsConceded: number;
    bestBowling: string; // e.g. "5/20"
    bowlingAverage: number;
    bowlingEconomy: number;
    
    // Fielding career
    totalCatches: number;
    totalRunouts: number;
    totalStumpings: number;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
export interface MatchTeam {
  teamId: string;
  name: string;
  players: Player[];
  innings: Innings[];
  score: Score;
  currentBatsmen?: {
    striker?: string;
    nonStriker?: string;
  };
  currentBowler?: string;
  powerPlay?: {
    current: boolean;
    overs: number[];
  };
}
export interface Match {
  id: string;
  date: string;
  venue: string;
  teamA: MatchTeam;
  teamB: MatchTeam;
  leagueId: string;
  league: {
    id: string;
    name: string;
  };
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
  firstBattingTeam?: string;
  firstBowlingTeam?: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  result?: MatchResult;
  // playerStats: { [playerId: string]: PlayerMatchStats }; removed it -old logic ;
  //1st innings:
  teamABatting: PlayerMatchStatsWithBatting[];
  teamBBowling: PlayerMatchStatsWithBowling[];

  // secondInnings:
  teamBBatting: PlayerMatchStatsWithBatting[];
  teamABowling: PlayerMatchStatsWithBowling[];

  
  fallOfWickets: FallOfWicket[];
  extras: Extras;
  currentInnings?: 'teamA' | 'teamB';
  currentPartnership?: Partnership;
  matchNotes?: string[];
  weather?: string;
  umpires?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface League {
  id: string;
  name: string;
  maxTeamCount: number;
  overs: number;
  startDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  format?: 'T20' | 'ODI' | 'Test';
  powerPlayOvers?: number[];
}

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'public';
}


// Add these type definitions near your other interfaces
export type BattingArrayField = 'teamABatting' | 'teamBBatting';
export type BowlingArrayField = 'teamABowling' | 'teamBBowling';