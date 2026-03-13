import React, { useRef, useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const START_TIME = 3;
const END_TIME = 45;

const BackgroundMusic: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = START_TIME;
    audio.volume = 0.3;

    const handleTimeUpdate = () => {
      if (audio.currentTime >= END_TIME) {
        audio.currentTime = START_TIME;
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!userInteracted) {
      setUserInteracted(true);
      audio.currentTime = START_TIME;
      audio.play();
      setPlaying(true);
      return;
    }

    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} src="/audio/danza-kuduro.mp3" preload="auto" />
      <button
        onClick={toggle}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary/80 backdrop-blur-sm text-primary-foreground shadow-lg hover:bg-primary transition-all duration-300 hover:scale-110"
        title={playing ? "Pausar música" : "Tocar música"}
      >
        {playing ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
    </>
  );
};

export default BackgroundMusic;
