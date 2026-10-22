import type { Metadata } from "next";
import Link from "next/link";
import DumplingTile from "./DumplingTile";
import "./squishy-dumpling-match.css";
import "./welcome.css";

export const metadata: Metadata = {
  title: "Squishy Dumpling Games – Free Online Match Games",
  description:
    "Play free squishy dumpling games online! Match cute bao characters, chase high scores in Endless Squish and explore Dumpling World in a fun matching adventure.",
};

export default function SquishyDumplingMatchWelcome() {
  return (
    <main className="sdm-welcome">
      <div className="sdm-welcome__glow sdm-welcome__glow--pink" aria-hidden="true" />
      <div className="sdm-welcome__glow sdm-welcome__glow--green" aria-hidden="true" />

      <div className="sdm-welcome__shell">
        <header className="sdm-welcome__header">
          <div className="sdm-welcome__brand">
            <span aria-hidden="true">✦</span>
            SQUISHY DUMPLING CLUB
            <span aria-hidden="true">✦</span>
          </div>

          <p className="sdm-welcome__eyebrow">
            A LITTLE GAME, A LOT OF SQUISH
          </p>

          <h1>
            Squishy Dumpling
            <span>Match!</span>
          </h1>

          <p className="sdm-welcome__intro">
            Play free squishy dumpling games online! Match adorable bao
            characters, chase your high score in Endless Squish or explore
            Dumpling World in a colourful match-3 adventure.
          </p>
        </header>

        <section
          className="sdm-welcome__showcase"
          aria-label="Meet the dumplings"
        >
          <span className="sdm-welcome__sparkle sdm-welcome__sparkle--one" aria-hidden="true">✦</span>
          <span className="sdm-welcome__sparkle sdm-welcome__sparkle--two" aria-hidden="true">✧</span>
          <span className="sdm-welcome__sparkle sdm-welcome__sparkle--three" aria-hidden="true">♡</span>

          <div className="sdm-welcome__dumpling sdm-welcome__dumpling--strawberry">
            <DumplingTile type="strawberry" />
          </div>

          <div className="sdm-welcome__dumpling sdm-welcome__dumpling--classic">
            <DumplingTile type="classic" />
          </div>

          <div className="sdm-welcome__dumpling sdm-welcome__dumpling--matcha">
            <DumplingTile type="matcha" />
          </div>

          <div className="sdm-welcome__dumpling sdm-welcome__dumpling--golden">
            <DumplingTile type="golden" />
          </div>

          <div className="sdm-welcome__dumpling sdm-welcome__dumpling--rainbow">
            <DumplingTile type="rainbow" />
          </div>

          <div className="sdm-welcome__showcase-caption">
            <span>♡</span> Your next little obsession <span>♡</span>
          </div>
        </section>

        <section className="sdm-welcome__modes" aria-label="Choose your game">
          <Link
            href="/squishy-dumpling-match/endless"
            className="sdm-welcome__mode sdm-welcome__mode--endless"
          >
            <div className="sdm-welcome__mode-art" aria-hidden="true">
              <DumplingTile type="strawberry" small />
              <DumplingTile type="classic" small />
              <DumplingTile type="matcha" small />
            </div>

            <div className="sdm-welcome__mode-copy">
              <span className="sdm-welcome__mode-kicker">QUICK PLAY</span>
              <h2>Endless Squish</h2>
              <p>
                Stack your bao, make sweet matches and chase your high score.
              </p>
              <span className="sdm-welcome__mode-cta">
                LET&apos;S PLAY <span aria-hidden="true">↗</span>
              </span>
            </div>

            <span className="sdm-welcome__mode-number" aria-hidden="true">01</span>
          </Link>

          <Link
            href="/squishy-dumpling-match/levels"
            className="sdm-welcome__mode sdm-welcome__mode--levels"
          >
            <div className="sdm-welcome__mode-art" aria-hidden="true">
              <DumplingTile type="golden" small />
              <DumplingTile type="rainbow" small />
              <DumplingTile type="matcha" small />
            </div>

            <div className="sdm-welcome__mode-copy">
              <span className="sdm-welcome__mode-kicker">A LITTLE ADVENTURE</span>
              <h2>Dumpling World</h2>
              <p>
                Discover cosy new places, take on levels and meet more bao
                besties.
              </p>
              <span className="sdm-welcome__mode-cta">
                EXPLORE WORLD <span aria-hidden="true">↗</span>
              </span>
            </div>

            <span className="sdm-welcome__mode-number" aria-hidden="true">02</span>
          </Link>
        </section>

        <footer className="sdm-welcome__footer">
          <span aria-hidden="true">♡</span>
          <p>Take a breath. Find a bao. Have a little fun.</p>
          <span aria-hidden="true">♡</span>
        </footer>
      </div>
    </main>
  );
}