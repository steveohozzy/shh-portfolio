export type BaoType =
  | "classic"
  | "strawberry"
  | "matcha"
  | "blueberry"
  | "lavender"
  | "peach"
  | "golden"
  | "rainbow";

const BAO_NAMES: Record<BaoType, string> = {
  classic: "Cloud Cream",
  strawberry: "Strawberry Milk",
  matcha: "Matcha Mochi",
  blueberry: "Blueberry Swirl",
  lavender: "Lavender Dream",
  peach: "Peach Fizz",
  golden: "Honey Gold",
  rainbow: "Rainbow Pop",
};

export default function DumplingTile({
  type,
  small = false,
}: {
  type: BaoType;
  small?: boolean;
}) {
  const colours: Record<
    BaoType,
    { body: string; shade: string; detail: string }
  > = {
    classic: { body: "#fff0d8", shade: "#f3d4ac", detail: "#dba98a" },
    strawberry: { body: "#ffd8e5", shade: "#f4aac3", detail: "#e98cab" },
    matcha: { body: "#d7edb9", shade: "#a9ce85", detail: "#7ca95e" },
    blueberry: { body: "#c5e7ff", shade: "#83b9f1", detail: "#528bd0" },
    lavender: { body: "#ead7ff", shade: "#c3a0ef", detail: "#9970ce" },
    peach: { body: "#ffdbc0", shade: "#ffb08e", detail: "#e78370" },
    golden: { body: "#fff064", shade: "#ffad08", detail: "#d97800" },
    rainbow: { body: "#ff8cdb", shade: "#9d62ff", detail: "#6735db" },
  };

  const colour = colours[type];
  const gradientId = `sdm-${type}-body`;

  return (
    <svg
      className={`sdm-dumpling${small ? " sdm-dumpling--small" : ""}${
        type === "golden" ? " sdm-dumpling--golden" : ""
      }${type === "rainbow" ? " sdm-dumpling--rainbow" : ""}`}
      viewBox="0 0 120 112"
      role="img"
      aria-label={BAO_NAMES[type]}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.8" y2="1">
          {type === "rainbow" ? (
            <>
              <stop offset="0%" stopColor="#ff78bb" />
              <stop offset="28%" stopColor="#ffad69" />
              <stop offset="50%" stopColor="#fff078" />
              <stop offset="70%" stopColor="#71edc2" />
              <stop offset="100%" stopColor="#8a70ff" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor={colour.body} />
              <stop offset="100%" stopColor={colour.shade} />
            </>
          )}
        </linearGradient>

        <linearGradient id={`sdm-${type}-shine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <clipPath id={`sdm-${type}-clip`}>
          <path d="M15 70 Q9 53 25 39 Q35 30 45 26 Q52 18 60 25 Q68 18 75 27 Q90 30 99 43 Q112 57 105 75 Q98 95 60 98 Q22 97 15 70Z" />
        </clipPath>
      </defs>

      {type === "golden" && (
        <>
          <circle
            className="sdm-special-halo"
            cx="60"
            cy="57"
            r="47"
            fill="#ffd43b"
            opacity=".45"
          />
          <path
            d="M16 46 L20 36 L24 46 L34 50 L24 54 L20 64 L16 54 L6 50Z"
            fill="#ffbd20"
          />
          <path
            d="M96 53 L100 43 L104 53 L114 57 L104 61 L100 71 L96 61 L86 57Z"
            fill="#ffbd20"
          />
        </>
      )}

      {type === "rainbow" && (
        <>
          <circle
            className="sdm-special-halo"
            cx="60"
            cy="57"
            r="47"
            fill="#e3a0ff"
            opacity=".45"
          />
          <path
            d="M24 47 Q15 15 43 17"
            fill="none"
            stroke="#ff477e"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M35 27 Q49 3 66 17"
            fill="none"
            stroke="#ffcf35"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M59 18 Q83 8 92 34"
            fill="none"
            stroke="#42dba0"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </>
      )}

      <path
        d="M15 70 Q9 53 25 39 Q35 30 45 26 Q52 18 60 25 Q68 18 75 27 Q90 30 99 43 Q112 57 105 75 Q98 95 60 98 Q22 97 15 70Z"
        fill={`url(#${gradientId})`}
        stroke={colour.detail}
        strokeWidth={
          type === "classic" || type === "strawberry" || type === "matcha"
            ? 2.5
            : 4
        }
        strokeLinejoin="round"
      />

      {type === "rainbow" && (
        <g clipPath={`url(#sdm-${type}-clip)`}>
          <path d="M5 47 L115 78" stroke="#ff477e" strokeWidth="12" opacity=".85" />
          <path d="M5 61 L115 92" stroke="#ffdc48" strokeWidth="11" opacity=".9" />
          <path d="M5 75 L100 102" stroke="#48e3a3" strokeWidth="10" opacity=".9" />
          <path
            d="M18 39 Q45 26 73 35"
            fill="none"
            stroke="#ffffff"
            strokeWidth="7"
            strokeLinecap="round"
            opacity=".65"
          />
        </g>
      )}

      <path
        d="M29 43 Q39 32 47 32 M52 29 Q60 24 66 31 M74 32 Q84 34 91 45"
        fill="none"
        stroke="#fffaf0"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".9"
      />

      {type === "matcha" && (
        <path
          d="M76 35 Q83 17 98 25 Q95 39 76 35Z"
          fill="#7eae5c"
          stroke="#659449"
          strokeWidth="1.5"
        />
      )}

      {type === "golden" && (
        <>
          <path
            d="M60 11 L67 23 L81 25 L71 35 L73 49 L60 42 L47 49 L49 35 L39 25 L53 23Z"
            fill="#fffef0"
            stroke="#e58b00"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M60 16 L64 26 L74 27 L66 34 L68 43 L60 38 L52 43 L54 34 L46 27 L56 26Z"
            fill="#ffbe19"
          />
          <path
            d="M28 65 Q32 58 36 65 M84 65 Q88 58 92 65"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}

      {type === "strawberry" && (
        <path
          d="M77 35 Q87 22 95 33 Q93 44 77 35Z"
          fill="#f18eae"
          stroke="#db7595"
          strokeWidth="1.5"
        />
      )}

      {type === "blueberry" && (
        <>
          <circle cx="29" cy="43" r="4" fill="#528bd0" />
          <circle cx="91" cy="46" r="3" fill="#528bd0" />
          <circle cx="96" cy="52" r="2" fill="#ffffff" />
        </>
      )}

      {type === "lavender" && (
        <>
          <path
            d="M82 43 Q80 34 85 27 M85 33 Q76 30 78 23 Q87 24 85 33 M85 38 Q94 34 94 27 Q86 28 85 38Z"
            fill="#a47ad8"
            stroke="#8960bd"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="29" cy="47" r="2.5" fill="#b89ae5" />
        </>
      )}

      {type === "peach" && (
        <>
          <path
            d="M81 40 Q75 29 84 25 Q91 28 89 36 Q97 27 102 35 Q102 43 89 43Z"
            fill="#ff9c83"
            stroke="#e78370"
            strokeWidth="1.5"
          />
          <circle cx="29" cy="48" r="3" fill="#ffab91" />
        </>
      )}

      {type === "rainbow" && (
        <>
          <path
            d="M32 51 L35 44 L38 51 L45 54 L38 57 L35 64 L32 57 L25 54Z"
            fill="#fffef0"
            stroke="#e7a5ff"
            strokeWidth="1"
          />
          <path
            d="M83 39 L86 32 L89 39 L96 42 L89 45 L86 52 L83 45 L76 42Z"
            fill="#fffef0"
            stroke="#e7a5ff"
            strokeWidth="1"
          />
          <circle cx="60" cy="51" r="3" fill="#ffffff" />
        </>
      )}

      <ellipse cx="44" cy="62" rx="3.7" ry="5" fill="#59464a" />
      <ellipse cx="76" cy="62" rx="3.7" ry="5" fill="#59464a" />
      <path
        d="M54 71 Q60 78 66 71"
        fill="none"
        stroke="#59464a"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <ellipse cx="34" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".75" />
      <ellipse cx="86" cy="70" rx="7" ry="4" fill="#f49ca8" opacity=".75" />

      <path
        d="M28 53 Q31 49 35 52 M83 52 Q88 49 91 53"
        fill="none"
        stroke="#fffaf0"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}