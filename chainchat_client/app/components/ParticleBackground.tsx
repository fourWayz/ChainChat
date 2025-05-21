"use client"
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine, ISourceOptions } from "tsparticles-engine";

const ParticleBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions: ISourceOptions = {
    background: {
      color: "transparent",
    },
    particles: {
      color: { value: ["#FF5F6D", "#FFC371", "#4A90E2", "#50E3C2"] },
      move: {
        direction: "none",
        enable: true,
        outModes: "bounce",
        random: true,
        speed: 0.5,
        straight: false,
      },
      opacity: {
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
        value: { min: 0.3, max: 0.8 },
      },
      size: {
        value: { min: 1, max: 3 },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 0.7,
          },
        },
      },
    },
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

export default ParticleBackground;