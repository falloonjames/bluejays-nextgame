"use client";

import { useEffect, useState } from "react";

type Opponent = {
  name: string;
  id: number;
};

export default function BlueJaysCountdown() {
  const [nextGame, setNextGame] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [opponent, setOpponent] = useState<Opponent | null>(null);

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
    opponent &&
    `https://www.mlbstatic.com/team-logos/${opponent.id}.svg`;

  return (
    <div className="text-white text-center space-y-4">
      {opponent && (
        <>
          <img
            src={opponentLogo}
            alt={opponent.name}
            className="w-20 mx-auto"
          />

          <h2 className="text-2xl font-semibold">
            Next game vs {opponent.name}
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
  );
}