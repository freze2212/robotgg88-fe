import React from "react";

interface GameItem {
  href: string;
  imgSrc: string;
  alt?: string;
  onClick?: () => void;
}

const games: GameItem[] = [
  {
    href: "/casino",
    imgSrc: "/assets/baccarat.png",
    alt: "Baccarat",
  },
  {
    href: "/NH",
    imgSrc: "/assets/no-hu.png",
    alt: "Nổ hũ",
  },
  {
    href: "#",
    imgSrc: "/assets/the-thao.png",
    alt: "Thể thao",
  },
  {
    href: "#",
    imgSrc: "/assets/ban-ca.png",
    alt: "Bắn cá",
  },
];

const CustomLobby: React.FC = () => {
  return (
    <div className="relative w-full max-w-screen-xl mx-auto px-4 ">
      {/* Header */}
      {/* <div className="flex justify-center items-center mb-8 ">
        <div className="max-w-xl">
          <img className="w-full" src="/assets/text_Lobby.png" alt="Lobby" />
        </div>
      </div> */}

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-8 mt-10">
        {games.map((game, index) => (
          <div
            key={index}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={game.onClick}
          >
            {game.onClick ? (
              <div>
                <figure className="overflow-hidden rounded-2xl shadow-md">
                  <img
                    src={game.imgSrc}
                    alt={game.alt || ""}
                    className="w-full h-auto object-cover"
                  />
                </figure>
              </div>
            ) : (
              <a href={game.href}>
                <figure className="overflow-hidden rounded-2xl shadow-md">
                  <img
                    src={game.imgSrc}
                    alt={game.alt || ""}
                    className="w-full h-auto object-cover"
                  />
                </figure>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomLobby;
