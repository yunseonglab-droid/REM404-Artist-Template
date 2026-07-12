# Replace these exhibition assets before publishing

This template includes the original files only as local development samples. Do
not publish another artist's work with them still in place.

1. Create a MindAR target file from the printed images for this exhibition and
   replace `target.mind`. The current experience expects two targets.
2. Replace `ai-01.jpg` and `ai-02.jpg` with the AR images that appear after
   recognition. Keep the same 1.6:1 width-to-height ratio or adjust the
   `width` and `height` values in `ar.html`.
3. Replace `../audio/recovery.mp3` (image-reveal sound) and
   `../audio/restore.mp3` (archive-entry sound), or remove their playback from
   `js/ar.js`.
4. Optional: put an intro video at `../video/intro.mp4` and set
   `intro.enabled` to `true` in `js/site-config.js`.

After replacing the target file, test recognition from the actual printed
artwork on both iPhone Safari and Android Chrome.
