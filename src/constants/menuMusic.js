const MUSIC_FILES = [
  'Hiroyuki_Sawano_進撃_gt20130218_巨人Attack_On_Titan_Shingeki_No_Kyojin.mp3',
  "Now_We_Are_Free_Honor_Him_from__Gladiator_____Hans_Zimmer____Jacob's.mp3",
];

const publicBase = process.env.PUBLIC_URL || '';

export const menuMusicTracks = MUSIC_FILES.map(
  (file) => `${publicBase}/music/${encodeURIComponent(file)}`
);
