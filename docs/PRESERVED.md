# Preserved materials

All listed bytes preserved at their original paths, except the Nafhamha identity receives a new rebuild_tokens member and its exact original is saved beside it as nafhamha-identity.original.json. The full original source remains on the verified backup branch and tag. Additional extracted topic identifiers are in state/legacy-topic-index.json; new reservations never overwrite that index.

| Original path | SHA256 before rebuild |
|---|---|
| `assets/Noto-Fonts-Copyright.txt` | `075f91382875da1c4b491f1facf2586f55448705133264d98ce15cab6211b125` |
| `assets/NotoSansArabic-Bold.ttf` | `ded6fc7359ca36d15d7aab9ef0c066e21ce48b26a069994d6602fa2cb9a1b952` |
| `assets/NotoSansArabic-Regular.ttf` | `504d7407d86875acf7d04dfaa0fd7524d0b8797723bc4aa18022f29db25b0b6e` |
| `config/channel_identity.json` | `30095718b48019b759d41260a7619a1ce64c26d49e129a505c96fb8d397bcda0` |
| `state/news_history.json` | `95d12ea3d3ece214f45da985f9205dd058b24e0e7636bbb5b896f58fd671dfc8` |
| `professional_motion/branding.json` | `60bb74c7b7497a0953f4b113c49ef96754896ea3fe62c423e1cd9841b90c6a55` |
| `remotion_motion/public/fonts/Arabic-Bold.ttf` | `ded6fc7359ca36d15d7aab9ef0c066e21ce48b26a069994d6602fa2cb9a1b952` |
| `remotion_motion/public/fonts/Arabic-Regular.ttf` | `504d7407d86875acf7d04dfaa0fd7524d0b8797723bc4aa18022f29db25b0b6e` |
| `professional_motion/fonts/OFL-IBM-Plex.txt` | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |
| `professional_motion/fonts/Noto-Fonts-Copyright.txt` | `075f91382875da1c4b491f1facf2586f55448705133264d98ce15cab6211b125` |
| `professional_motion/fonts/NotoSansArabic-Bold.ttf` | `ded6fc7359ca36d15d7aab9ef0c066e21ce48b26a069994d6602fa2cb9a1b952` |
| `professional_motion/fonts/IBMPlexMono-Medium.ttf` | `a9b4c49bb299e05b5f6c481e7fb5e78943d2793249a0c8874ab574a2d1ea6755` |
| `professional_motion/assets/brand/logo.png` | `3c4f8c1d66fa41e6f95e746071956e862cc77ba67951b1807a662197270d01de` |

Original logo present in checkout: yes. The owner subsequently supplied inline logo references. Their original file bytes have not been exposed by the upload tool; no replacement has been drawn. See config/logo-intake.json. Original font files and their available notices remain. Charon and intended 17:00 Africa/Cairo destination names remain in config. No .mp4 files were tracked on the cloned main snapshots; no approved media was deleted from remote media branches. Legacy scheduling files are in the backup, but the new branch has only one active workflow.

## Follow-up original logo installation

Source: Preserved original professional_motion/assets/brand/logo.png

Canonical file: `brand/logo/logo.png`

SHA-256: `3c4f8c1d66fa41e6f95e746071956e862cc77ba67951b1807a662197270d01de`

Byte-for-byte copy verified; no redraw, recolor, background removal, raster edit or vectorization. The public/brand/logo directory is a symlink to the canonical directory. Header, intro/outro and thumbnail use the same Logo component and source.
