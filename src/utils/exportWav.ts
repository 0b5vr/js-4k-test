import { float32ArrayToWav } from '@0b5vr/experimental';

/**
 * Encodes the given channels into a WAV file and triggers a download.
 */
export function exportWav(channels: Float32Array[], sampleRate: number, filename = 'music.wav'): void {
  const buffer = float32ArrayToWav(channels, sampleRate);

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
