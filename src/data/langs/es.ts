import type { LanguagePack } from '../languages'

export const es: LanguagePack = {
  id: 'es',
  name: 'Español',
  short: 'ES',
  layoutId: 'es',
  script: 'latin',
  words: `de la que el en y a los se del las un por con no una su para es al lo como más pero sus
le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde
todo nos durante todos uno les ni contra otros ese eso ante ellos e esto mí antes algunos qué
unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar
casa día vida tiempo año mundo país ciudad calle agua noche mañana tarde mano ojo cabeza
palabra libro carta escuela trabajo amigo puerta ventana mesa árbol río mar montaña viento
lluvia sol luz color verde azul rojo blanco negro grande pequeño nuevo viejo rápido lento
bueno malo fácil difícil siempre nunca ahora hoy ayer juntos casi pronto hablar decir hacer
tener poder saber querer llegar pasar deber poner parecer quedar creer llevar dejar seguir
encontrar llamar venir pensar salir volver tomar conocer vivir sentir tratar mirar contar
escribir leer aprender jugar correr niño mujer hombre teclado dedo letra texto pantalla
ritmo paso meta resultado práctica canción corazón también así después además`
    .split(/\s+/)
    .filter(Boolean),
  texts: [
    {
      title: 'Sobre la práctica',
      body: 'Quien practica un poco cada día llega más lejos que quien se sienta durante horas una vez al mes. Los dedos aprenden despacio, pero casi nunca olvidan. Después de unas semanas, la mano encuentra sola el camino hacia la tecla correcta.',
    },
    {
      title: 'En el mercado',
      body: 'El mercado abría antes de que saliera el sol. Las fruteras colocaban naranjas en pirámides perfectas, un panadero gritaba precios que nadie escuchaba y, en una esquina, un perro dormía tranquilo junto a una caja de tomates.',
    },
    {
      title: 'Mecanografía',
      body: 'Escribir al tacto significa teclear sin mirar el teclado. Cada dedo se encarga de un pequeño grupo de teclas, y los índices descansan sobre las dos teclas con relieve. Así la vista se queda en la pantalla y el pensamiento no se interrumpe.',
    },
    {
      title: 'Una nota breve',
      body: 'Gracias por el libro que me enviaste. Empecé a leerlo en el tren y me pasé de estación, que es la mejor reseña que puedo darte. Avísame cuando tengas un rato libre el mes que viene; me encantaría saber en qué estás trabajando.',
    },
  ],
}
