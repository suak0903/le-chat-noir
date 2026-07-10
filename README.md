# Le Chat Noir — Redesign-Entwurf

Unverbindlicher Redesign-Demonstrator für das Le Chat Noir, eine Weinbar und ein Bistro
in Essen-Rüttenscheid. Erstellt von Dr.-Ing. Suat Akyol.

Live (GitHub Pages): https://suak0903.github.io/le-chat-noir/

## Technik
- Vanilla HTML + CSS + JS, kein Build-Step nötig, kein npm
- Self-hosted Schriften (Cormorant Display + Inter Body), kein Google-CDN
- Hero mit Video und Ton (mobil full-bleed mit Parallaxe), Galerie-Lightbox, Scrollspy, mobiles Menü
- Belle-Époque-Palette: Bordeaux + Messing-Gold auf Noir und Pergament
- Strukturierte Daten (Restaurant / LocalBusiness JSON-LD), noindex (Entwurf)

## Chrome aus einer Quelle
Header, Footer und Demo-Leiste liegen in `partials/` und werden per `node build-site.mjs`
byte-identisch in jede Seite gesetzt (kein Drift). Nach Änderung an einem Partial:
`node build-site.mjs` ausführen, dann committen.

Inhalte und Bilder stammen aus öffentlich verfügbaren Quellen (Facebook, Google). Kein offizieller Auftritt.
