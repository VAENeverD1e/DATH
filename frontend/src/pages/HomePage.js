import React from "react";

const HomePage = () => {
  return (
    <section
      className="relative min-h-[calc(100vh-5rem)] bg-no-repeat bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: "url('/assets/Homepage_background.png')",
      }}
    >
      {/* Headline - upper left */}
      <div className="absolute top-8 left-8 z-10 max-w-2xl">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight font-extrabold text-brand-deep drop-shadow-sm tracking-tight">
          <span className="inline-block">Search</span>
          <span className="mx-3 text-3xl md:text-4xl align-middle">-</span>
          <span className="inline-block">Book</span>
          <span className="mx-3 text-3xl md:text-4xl align-middle">-</span>
          <span className="inline-block">Feel Better</span>
        </h1>
        <div className="mt-4 w-28 h-0.5 bg-gradient-to-r from-brand-accent via-transparent to-transparent rounded-full opacity-80" />
      </div>

      {/* Subtext - middle left */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2 z-10 max-w-lg">
        <p className="text-lg md:text-xl lg:text-2xl text-gray-800 leading-relaxed md:leading-snug opacity-95">
          Delivering care with expertise,
          <span className="block">guided by medical ethics</span>
          <span className="block">and deep compassion.</span>
        </p>
      </div>

      {/* CTA text - positioned over the pink box */}
      <div className="absolute bottom-14 left-[170px] z-10">
        <div className="inline-flex items-center bg-brand-accent text-white px-6 py-3 md:px-8 md:py-3 rounded-full shadow-2xl transition-shadow duration-200 border border-white/10">
          <span className="text-lg md:text-2xl lg:text-3xl font-semibold tracking-tight">
            Meet the <span className="font-extrabold">Best Doctor</span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
