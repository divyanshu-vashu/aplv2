// import React, { useState, useEffect } from 'react';
// import { Match,MatchTeam,PlayerMatchStats} from '../types/index.types';
// import { doc, onSnapshot } from 'firebase/firestore';
// import { db } from '../firebase/config';

// interface DetailedScorecardProps {
//   match: Match;
// }

// const DetailedScorecard: React.FC<DetailedScorecardProps> = ({ match: initialMatch }) => {
//   const [match, setMatch] = useState(initialMatch);
//   const [activeInnings, setActiveInnings] = useState<'teamA' | 'teamB'>('teamA');

//   useEffect(() => {
//     const matchRef = doc(db, 'matches', initialMatch.id);
//     const unsubscribe = onSnapshot(matchRef, (doc) => {
//       if (doc.exists()) {
//         const matchData = doc.data() as Match;
//         console.log("Match data updated:", matchData);
//         setMatch(matchData);
//       }
//     });
//     return () => unsubscribe();
//   }, [initialMatch.id]);

//   const formatScore = (team: MatchTeam) => {
//     return `${team.score.runs}-${team.score.wickets} (${team.score.overs}.${team.score.balls} Ov)`;
//   };

//   const getPlayerStats = (teamId: string) => {
//     if (!match.playerStats) return [];
    
//     return Object.entries(match.playerStats)
//       .map(([, stat]) => stat)
//       .filter(stat => {
//         // Check if player belongs to the current team
//         const team = match.teamA.teamId === teamId ? match.teamA : match.teamB;
//         const isTeamPlayer = team.players?.some(p => p.id === stat.playerId);
        
//         // Filter stats based on whether the player has batting or bowling stats
//         return isTeamPlayer && ((stat.ballsFaced ?? 0) > 0 || (stat.bowlingBalls ?? 0) > 0);
//       });
//   };

//   const getBattingStats = (teamId: string) => {
//     return getPlayerStats(teamId)
//       .filter(stat => stat.ballsFaced && stat.ballsFaced > 0)
//       .sort((a, b) => (b.runs || 0) - (a.runs || 0));
//   };

//   const getBowlingStats = (teamId: string) => {
//     return getPlayerStats(teamId)
//       .filter(stat => stat.bowlingBalls && stat.bowlingBalls > 0)
//       .sort((a, b) => (b.wickets || 0) - (a.wickets || 0));
//   };

//   const getPlayerName = (playerId: string) => {
//     // Find player in either team
//     const playerA = match.teamA.players?.find(p => p.id === playerId);
//     const playerB = match.teamB.players?.find(p => p.id === playerId);
//     return playerA?.name || playerB?.name || playerId;
//   };

//   const calculateStrikeRate = (runs: number, balls: number) => {
//     if (!balls) return 0;
//     return ((runs / balls) * 100).toFixed(2);
//   };

//   const calculateEconomy = (runs: number, balls: number) => {
//     if (!balls) return 0;
//     const overs = balls / 6;
//     return (runs / overs).toFixed(2);
//   };

//   const formatDismissal = (stat: PlayerMatchStats) => {
//     if (!stat.dismissalType) return 'not out';
//     const bowler = match.playerStats[stat.dismissalBowler || '']?.playerId;
//     const fielder = stat.dismissalFielder ? 
//       match.playerStats[stat.dismissalFielder]?.playerId : '';
    
//     switch(stat.dismissalType) {
//       case 'caught':
//         return `c ${fielder} b ${bowler}`;
//       case 'bowled':
//         return `b ${bowler}`;
//       case 'lbw':
//         return `lbw b ${bowler}`;
//       case 'runOut':
//         return `run out (${fielder})`;
//       default:
//         return stat.dismissalType;
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       {/* Match Header */}
//       <div className="text-center mb-6">
//         <h1 className="text-2xl font-bold mb-2">
//           {match.teamA.name} vs {match.teamB.name}
//         </h1>
//         <p className="text-lg mb-2">
//           {formatScore(match.teamA)} vs {formatScore(match.teamB)}
//         </p>
//         <p className="text-green-600 font-semibold">
//           {match.result?.description}
//         </p>
//       </div>

//       {/* Innings Selector */}
//       <div className="flex mb-6 border-b">
//         <button
//           onClick={() => setActiveInnings('teamA')}
//           className={`px-4 py-2 ${activeInnings === 'teamA' ? 'border-b-2 border-blue-500' : ''}`}
//         >
//           {match.teamA.name} Innings
//         </button>
//         <button
//           onClick={() => setActiveInnings('teamB')}
//           className={`px-4 py-2 ${activeInnings === 'teamB' ? 'border-b-2 border-blue-500' : ''}`}
//         >
//           {match.teamB.name} Innings
//         </button>
//       </div>

//       {/* Batting Table */}
//       <div className="overflow-x-auto mb-6">
//         <h3 className="text-xl font-bold mb-4">Batting</h3>
//         <table className="min-w-full">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="text-left p-2">Batter</th>
//               <th className="text-left p-2">Dismissal</th>
//               <th className="p-2">R</th>
//               <th className="p-2">B</th>
//               <th className="p-2">4s</th>
//               <th className="p-2">6s</th>
//               <th className="p-2">SR</th>
//             </tr>
//           </thead>
//           <tbody>
//             {getBattingStats(activeInnings === 'teamA' ? match.teamA.teamId : match.teamB.teamId)
//               .map(stat => (
//                 <tr key={stat.playerId} className="border-b">
//                   <td className="p-2 font-medium">{getPlayerName(stat.playerId)}</td>
//                   <td className="p-2">{formatDismissal(stat)}</td>
//                   <td className="p-2 text-center">{stat.runs || 0}</td>
//                   <td className="p-2 text-center">{stat.ballsFaced || 0}</td>
//                   <td className="p-2 text-center">{stat.fours || 0}</td>
//                   <td className="p-2 text-center">{stat.sixes || 0}</td>
//                   <td className="p-2 text-center">
//                     {calculateStrikeRate(stat.runs || 0, stat.ballsFaced || 0)}
//                   </td>
//                 </tr>
//               ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Extras */}
//       <div className="mb-6">
//         <p className="text-sm">
//           Extras: {match.extras?.total || 0} (
//           b {match.extras?.byes || 0}, 
//           lb {match.extras?.legByes || 0}, 
//           w {match.extras?.wides || 0}, 
//           nb {match.extras?.noBalls || 0}, 
//           p {match.extras?.penalties || 0})
//         </p>
//       </div>

//       {/* Bowling Table */}
//       <div className="overflow-x-auto">
//         <h3 className="text-xl font-bold mb-4">Bowling</h3>
//         <table className="min-w-full">
//           <thead>
//             <tr className="bg-gray-50">
//               <th className="text-left p-2">Bowler</th>
//               <th className="p-2">O</th>
//               <th className="p-2">M</th>
//               <th className="p-2">R</th>
//               <th className="p-2">W</th>
//               <th className="p-2">Econ</th>
//             </tr>
//           </thead>
//           <tbody>
//             {getBowlingStats(activeInnings === 'teamA' ? match.teamB.teamId : match.teamA.teamId)
//               .map(stat => {
//                 const overs = Math.floor((stat.bowlingBalls || 0) / 6);
//                 const balls = (stat.bowlingBalls || 0) % 6;
//                 return (
//                   <tr key={stat.playerId} className="border-b">
//                     <td className="p-2 font-medium">{getPlayerName(stat.playerId)}</td>
//                     <td className="p-2 text-center">{`${overs}.${balls}`}</td>
//                     <td className="p-2 text-center">{stat.maidens || 0}</td>
//                     <td className="p-2 text-center">{stat.runsConceded || 0}</td>
//                     <td className="p-2 text-center">{stat.wickets || 0}</td>
//                     <td className="p-2 text-center">
//                       {calculateEconomy(stat.runsConceded || 0, stat.bowlingBalls || 0)}
//                     </td>
//                   </tr>
//                 );
//               })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DetailedScorecard;
