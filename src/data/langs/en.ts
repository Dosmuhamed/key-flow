import type { LanguagePack } from '../languages'

export const en: LanguagePack = {
  id: 'en',
  name: 'English',
  short: 'EN',
  layoutId: 'qwerty',
  script: 'latin',
  words: `the be of and a to in he have it that for they with as not on she at by this we you do
but from or which one would all will there say who make when can more if no man out other so
what time up go about than into could state only new year some take come these know see use
get like then first any work now may such give over think most even find day also after way
many must look before great back through long where much should well people down own just
because good each those feel seem how high too place little world very still nation hand old
life tell write become here show house both between need mean call develop under last right
move thing general school never same another begin while number part turn real leave might
want point form off child few small since against ask late home interest large person end
open public follow during present without again hold govern around possible head consider
word program problem however lead system set order eye plan run keep face fact group play
stand increase early course change help line city light river music letter morning water
quick simple strong quiet finger key screen text speed focus steady rhythm practice`
    .split(/\s+/)
    .filter(Boolean),
  texts: [
    {
      title: 'On practice',
      body: 'Practice is not about doing the same thing faster. It is about doing it a little more precisely each time, until the movement no longer needs your attention. Once your fingers know the way, your mind is free to think about what you want to say.',
    },
    {
      title: 'The harbor',
      body: 'By the time the fog lifted, the harbor was already busy. Fishing boats rocked against the pier, gulls argued over scraps, and an old man in a green coat counted crates with the patience of someone who had done it every morning for forty years.',
    },
    {
      title: 'Touch typing',
      body: 'Touch typing means typing without looking at the keyboard. Each finger owns a small group of keys, and your index fingers rest on the two keys with small ridges. Your eyes stay on the screen, so your train of thought is never broken by a search for the right letter.',
    },
    {
      title: 'A short note',
      body: 'Thanks for the book you sent last week. I started reading it on the train and missed my stop, which I think is the best review I can give. Let me know when you are free next month; I would love to hear what you are working on these days.',
    },
    {
      title: 'Slow is smooth',
      body: 'There is an old saying among people who train hard skills: slow is smooth, and smooth is fast. Rushing creates mistakes, and every mistake costs more time than it saves. Keep a calm, even pace, and the speed will arrive on its own.',
    },
  ],
}
