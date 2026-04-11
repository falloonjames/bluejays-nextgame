"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Opponent = {
  name: string;
  id: number;
};

export default function BlueJaysCountdown() {
  const [nextGame, setNextGame] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [isHomeGame, setIsHomeGame] = useState<boolean | null>(null);
  const [gameToday, setGameToday] = useState<boolean | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  let foundTodayGame = false;

  useEffect(() => {
    async function fetchNextGame() {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 14);

      const startDate = today.toISOString().split("T")[0];
      const endDate = end.toISOString().split("T")[0];

      const res = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=141&startDate=${startDate}&endDate=${endDate}`
      );

      const data = await res.json();

      const now = new Date();

      for (const date of data.dates) {
        if (date.date === todayStr && date.games.length > 0) {
          foundTodayGame = true;
        }
      
        for (const game of date.games) {
          const gameDate = new Date(game.gameDate);
      
          if (gameDate > now) {
            setNextGame(gameDate);
      
            const away = game.teams.away.team;
            const home = game.teams.home.team;
      
            const opponentTeam =
              away.id === 141 ? home : away;
      
            setOpponent({
              name: opponentTeam.name,
              id: opponentTeam.id,
            });
      
            setIsHomeGame(home.id === 141);
      
            setGameToday(foundTodayGame);
      
            return;
          }
        }
      }
    }

    fetchNextGame();
  }, []);

  useEffect(() => {
    if (!nextGame) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = nextGame.getTime() - now;

      if (distance <= 0) {
        setTimeLeft("Game starting now!");
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor(
        (distance % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor(
        (distance % (1000 * 60)) / 1000
      );

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [nextGame]);

  const formattedStart =
    nextGame &&
    nextGame.toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  const opponentLogo =
    opponent ?
    `https://www.mlbstatic.com/team-logos/${opponent.id}.svg`
    : undefined;

  return (
    <>
    <div className="w-full text-center fixed top-0 left-0">
  {gameToday !== null && (
    <div
      className={`py-3 text-lg font-bold tracking-wide ${
        gameToday ? "bg-green-600" : "bg-red-600"
      } text-white`}
    >
      {gameToday
        ? "GAME TODAY ⚾"
        : "NO GAME TODAY"}
    </div>
  )}
</div>
    <div className="text-white text-center space-y-4">
      {opponent && (
        <>
          {opponentLogo && (
          <Image
          src={opponentLogo}
          alt={opponent.name}
          width={80}
          height={80}
          className="mx-auto drop-shadow-[0_0_2px_white] drop-shadow-[0_0_6px_white]"
        />
        )}
          {isHomeGame !== null && (
  <div
    className={`inline-block px-4 py-1 rounded-full font-semibold text-sm ${
      isHomeGame
        ? "bg-blue-600 text-white"
        : "bg-gray-700 text-white"
    }`}
  >
    {isHomeGame ? "HOME GAME" : "AWAY GAME"}
  </div>
)}
          <h2 className="text-2xl font-semibold">
            vs {opponent.name}
          </h2>
        </>
      )}

      {formattedStart && (
        <div className="opacity-80">
          {formattedStart}
        </div>
      )}

      <div className="text-4xl font-bold">
        {timeLeft}
      </div>
    </div>
    </>
  );
}