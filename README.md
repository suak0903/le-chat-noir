# Café Trotzdem — Redesign-Entwurf

Unverbindlicher Redesign-Demonstrator für [cafe-trotzdem-monchengladbach.de](https://cafe-trotzdem-monchengladbach.de/),
ein türkisch-internationales Café in Mönchengladbach. Erstellt von Dr.-Ing. Suat Akyol.

Live (GitHub Pages): https://suak0903.github.io/cafe-trotzdem/

## Technik
- Vanilla HTML + CSS + JS, kein Build-Step nötig, kein npm
- Self-hosted Schriften (Fraunces Display + Inter Body), kein Google-CDN
- Hero-Parallaxe (Desktop + Mobil), Galerie-Lightbox, Scrollspy, mobiles Menü
- Coral-Akzent (`#fb5849`) der Originalseite beibehalten
- Strukturierte Daten (Restaurant/LocalBusiness JSON-LD), noindex (Entwurf)

## Chrome aus einer Quelle
Header, Footer und Demo-Leiste liegen in `partials/` und werden per `node build-site.mjs`
byte-identisch in jede Seite gesetzt (kein Drift). Nach Änderung an einem Partial:
`node build-site.mjs` ausführen, dann committen.

Inhalte und Bilder stammen aus dem öffentlich verfügbaren Bestand. Kein offizieller Auftritt.
