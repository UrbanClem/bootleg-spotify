/**
 * Generates a 10-second synthetic WAV file for every song in the catalogue.
 * Each song gets a unique frequency based on a hash of its title, so they
 * sound different from each other. The tone is a sine wave with two
 * harmonics and a fade in/out envelope to avoid clicks.
 *
 * Run with: node scripts/gen-audio.js
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SAMPLE_RATE = 44100;
const DURATION = 10; // seconds
const NUM_SAMPLES = SAMPLE_RATE * DURATION;

/** Simple string hash to pick a frequency per song. */
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Write a 16-bit mono WAV file with a synthesized tone. */
function generateWav(filename, frequency) {
  const dataSize = NUM_SAMPLES * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate samples
  for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    // Fade in/out over 100ms to avoid clicks
    const fadeIn = Math.min(1, t / 0.1);
    const fadeOut = Math.min(1, (DURATION - t) / 0.1);
    const envelope = Math.min(fadeIn, fadeOut);
    // Fundamental + 2 harmonics
    const sample = (
      Math.sin(2 * Math.PI * frequency * t) * 0.6 +
      Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3 +
      Math.sin(2 * Math.PI * frequency * 3 * t) * 0.1
    ) * envelope;
    buffer.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(sample * 32767))), 44 + i * 2);
  }

  fs.writeFileSync(filename, buffer);
}

async function main() {
  const audioDir = path.join(__dirname, '..', 'uploads', 'audio');
  fs.mkdirSync(audioDir, { recursive: true });

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [songs] = await conn.query('SELECT id_cancion, titulo FROM cancion ORDER BY id_cancion');
  console.log(`Generating audio for ${songs.length} songs...`);

  for (const song of songs) {
    const h = hash(song.titulo);
    const freq = 220 + (h % 660); // 220–880 Hz
    const filename = path.join(audioDir, `${song.titulo}.wav`);
    generateWav(filename, freq);
    await conn.query('UPDATE cancion SET archivo_audio = ? WHERE id_cancion = ?', [
      `${song.titulo}.wav`,
      song.id_cancion
    ]);
    console.log(`  ${song.titulo}.wav (${freq}Hz)`);
  }

  await conn.end();
  console.log(`\nDone. ${songs.length} files in uploads/audio/`);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
