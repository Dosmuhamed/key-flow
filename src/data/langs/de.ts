import type { LanguagePack } from '../languages'

export const de: LanguagePack = {
  id: 'de',
  name: 'Deutsch',
  short: 'DE',
  layoutId: 'qwertz',
  script: 'latin',
  words: `der die das und sein in ein zu haben ich werden sie von nicht mit es sich auch auf für an
er so dass können dies als ihr ja wie bei oder wir aber dann man da sein noch nach was also
aus all wenn nur müssen sagen um über machen kein Jahr du mein schon jetzt gehen geben weil
mehr ganz ohne immer viel Zeit kommen wollen Mann sehen hier Frau gut groß neu alt klein
lang schnell langsam Haus Stadt Land Welt Leben Kind Tag Nacht Morgen Abend Wasser Weg Hand
Auge Kopf Wort Buch Brief Schule Arbeit Frage Antwort Freund Straße Fenster Tür Tisch Baum
Wald Fluss Berg Meer Wind Regen Schnee Sonne Licht Farbe grün blau rot weiß schwarz warm kalt
früh spät heute morgen gestern immer wieder zusammen fast sofort einfach wichtig richtig
schön leicht schwer stark ruhig laut leise denken wissen finden bleiben stehen liegen
halten bringen lassen lesen schreiben spielen lernen arbeiten fahren laufen hören sprechen
Übung Taste Finger Text Bildschirm Tempo Ruhe Ziel Schritt Ergebnis Größe Glück Brücke
fünf zwölf Mädchen Bäcker Käse Löffel Müller Tür über für schön Straße weiß heißen`
    .split(/\s+/)
    .filter(Boolean),
  texts: [
    {
      title: 'Über das Üben',
      body: 'Wer jeden Tag ein wenig übt, kommt weiter als jemand, der einmal im Monat stundenlang am Tisch sitzt. Die Finger lernen langsam, aber sie vergessen kaum. Nach ein paar Wochen findet die Hand den Weg zur richtigen Taste fast von selbst.',
    },
    {
      title: 'Am Bahnhof',
      body: 'Der Zug hatte wieder einmal zwanzig Minuten Verspätung. Auf dem Bahnsteig standen Pendler mit Kaffeebechern, ein kleiner Junge zählte laut die vorbeifahrenden Güterwagen, und eine ältere Dame las ruhig ihre Zeitung, als hätte sie alle Zeit der Welt.',
    },
    {
      title: 'Zehnfingersystem',
      body: 'Beim Zehnfingersystem schreibt man, ohne auf die Tastatur zu schauen. Jeder Finger ist für eine kleine Gruppe von Tasten zuständig, und die Zeigefinger ruhen auf den beiden Tasten mit den fühlbaren Rillen. So bleibt der Blick auf dem Bildschirm.',
    },
    {
      title: 'Ein kurzer Gruß',
      body: 'Liebe Grüße aus dem Norden! Hier regnet es seit drei Tagen, aber das stört mich kaum, denn ich habe endlich Zeit zum Lesen. Wie geht es dir und deiner Familie? Schreib mir bald, ich freue mich über jede Nachricht.',
    },
  ],
}
