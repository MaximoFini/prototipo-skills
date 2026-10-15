import type { Unit } from '@/domain/types'

export const a2Units: Unit[] = [
  {
    id: 'a2-u5', level: 'A2', number: 5, title: 'Weekend plans',
    description: 'Contá tus planes, invitá a tus amigos y hablá de lo que hiciste el finde',
    lessons: [
      {
        id: 'a2-u5-l1', title: 'Planes e invitaciones',
        exercises: [
          { id: 'e1', type: 'choose-translation', prompt: "I'm going to watch a series tonight.", promptLang: 'en', options: ['Vi una serie anoche.', 'Voy a ver una serie esta noche.', 'Estoy viendo una serie ahora.'], correct: 1, explanation: '"Be + going to + verbo" sirve para hablar de planes. "Tonight" es "esta noche".', vocab: [{ en: 'tonight', es: 'esta noche', emoji: '🌙' }, { en: 'series', es: 'serie', emoji: '📺' }] },
          { id: 'e2', type: 'match-pairs', pairs: [{ en: 'weekend', es: 'fin de semana' }, { en: 'plans', es: 'planes' }, { en: 'tomorrow', es: 'mañana' }, { en: 'next Saturday', es: 'el próximo sábado' }, { en: 'invite', es: 'invitar' }], explanation: '"Next" + día significa "el próximo". Fijate que "weekend" se escribe todo junto.', vocab: [{ en: 'weekend', es: 'fin de semana', emoji: '🎉' }, { en: 'plans', es: 'planes' }, { en: 'tomorrow', es: 'mañana' }, { en: 'invite', es: 'invitar' }] },
          { id: 'e3', type: 'choose-image', word: 'beach', options: [{ emoji: '🎬', label: 'cinema' }, { emoji: '🎮', label: 'video game' }, { emoji: '🏖️', label: 'beach' }, { emoji: '🍕', label: 'pizza' }], correct: 2, explanation: '"Beach" es la playa. ¡Ideal para los planes de verano!', vocab: [{ en: 'beach', es: 'playa', emoji: '🏖️' }] },
          { id: 'e4', type: 'fill-blank', sentence: 'We ___ going to play football on Saturday.', options: ['are', 'is', 'am'], correct: 0, translation: 'Vamos a jugar al fútbol el sábado.', explanation: 'Con "we" se usa "are": "we are going to".' },
          { id: 'e5', type: 'build-sentence', prompt: 'Voy a visitar a mi abuela', promptLang: 'es', accepted: ["I'm going to visit my grandma", 'I am going to visit my grandma', "I'm going to visit my grandmother", 'I am going to visit my grandmother'], bank: ["I'm", 'I', 'am', 'going', 'to', 'visit', 'my', 'grandma', 'grandmother', 'was', 'your'], explanation: 'Estructura: sujeto + am/is/are + going to + verbo. "Grandma" es la forma cariñosa de "grandmother".', vocab: [{ en: 'visit', es: 'visitar' }, { en: 'grandma', es: 'abuela', emoji: '👵' }] },
          { id: 'e6', type: 'listen-type', audio: 'Do you want to go to the cinema?', accepted: ['Do you want to go to the cinema?', 'Do you want to go to the cinema', 'Do you want to go to the movies?', 'Do you want to go to the movies'], translation: '¿Querés ir al cine?', explanation: '"Do you want to...?" es la forma más simple de invitar a alguien. "Cinema" y "movies" valen los dos.' },
          { id: 'e7', type: 'type-translation', prompt: '¡Vamos al parque!', promptLang: 'es', accepted: ["Let's go to the park", "Let's go to the park!", 'Let us go to the park'], explanation: '"Let\'s + verbo" es "vamos a...". Es una invitación para hacer algo juntos.', vocab: [{ en: "let's", es: 'vamos a', emoji: '🙌' }] },
          { id: 'e8', type: 'listen-choose', audio: "Sure! Let's meet at six.", options: ['No puedo, estoy ocupado.', '¡Qué lástima! Es tarde.', '¡Dale! Nos vemos a las seis.'], correct: 2, explanation: '"Sure!" es "¡Dale!" y "meet" es "encontrarse". Así se acepta una invitación.', vocab: [{ en: 'meet', es: 'encontrarse' }] },
          { id: 'e9', type: 'speak', phrase: 'Do you want to come with us?', translation: '¿Querés venir con nosotros?', explanation: 'Practicá la entonación de pregunta: sube al final de la frase.' },
        ],
      },
      {
        id: 'a2-u5-l2', title: 'El finde pasado',
        exercises: [
          { id: 'e1', type: 'choose-translation', prompt: 'Ayer jugué al fútbol con mis amigos.', promptLang: 'es', options: ['I play football with my friends yesterday.', 'I played football with my friends yesterday.', "I'm going to play football with my friends."], correct: 1, explanation: 'Para el pasado de los verbos regulares se agrega "-ed": play → played.', vocab: [{ en: 'yesterday', es: 'ayer' }, { en: 'played', es: 'jugó / jugué' }] },
          { id: 'e2', type: 'match-pairs', pairs: [{ en: 'yesterday', es: 'ayer' }, { en: 'last weekend', es: 'el fin de semana pasado' }, { en: 'watched', es: 'miré / vio' }, { en: 'visited', es: 'visité / visitó' }, { en: 'went', es: 'fui / fue' }], explanation: '"Went" es el pasado de "go" y es irregular: no termina en -ed.', vocab: [{ en: 'last weekend', es: 'el fin de semana pasado' }, { en: 'watched', es: 'miró' }, { en: 'visited', es: 'visitó' }, { en: 'went', es: 'fue' }] },
          { id: 'e3', type: 'fill-blank', sentence: 'Last weekend, we ___ to the beach.', options: ['go', 'went', 'going'], correct: 1, translation: 'El finde pasado fuimos a la playa.', explanation: '"Last weekend" marca el pasado, así que usamos "went".' },
          { id: 'e4', type: 'fill-blank', sentence: 'I ___ at home yesterday.', options: ['am', 'were', 'was'], correct: 2, translation: 'Ayer estuve en casa.', explanation: 'El pasado de "I am" es "I was". "Were" va con you, we y they.' },
          { id: 'e5', type: 'listen-choose', audio: 'I watched a movie last night.', options: ['Voy a mirar una película.', 'Miré una película anoche.', 'Miro una película todas las noches.'], correct: 1, explanation: '"Watched" está en pasado y "last night" es "anoche".', vocab: [{ en: 'last night', es: 'anoche' }] },
          { id: 'e6', type: 'build-sentence', prompt: 'Mis amigos fueron al cine ayer', promptLang: 'es', accepted: ['My friends went to the cinema yesterday', 'My friends went to the movies yesterday'], bank: ['My', 'friends', 'went', 'to', 'the', 'cinema', 'movies', 'yesterday', 'go', 'was'], explanation: 'El pasado de "go" es "went" para todas las personas.' },
          { id: 'e7', type: 'type-translation', prompt: 'Ayer visité a mi abuela', promptLang: 'es', accepted: ['I visited my grandma yesterday', 'Yesterday I visited my grandma', 'I visited my grandmother yesterday', 'Yesterday I visited my grandmother'], explanation: 'El tiempo ("yesterday") puede ir al final o al principio de la oración.' },
          { id: 'e8', type: 'listen-type', audio: 'We were tired after the match.', accepted: ['We were tired after the match.', 'We were tired after the match', 'We were tired after the game', 'We were tired after the game.'], translation: 'Estábamos cansados después del partido.', explanation: '"Were" es el pasado de "are". "Match" y "game" significan partido.', vocab: [{ en: 'tired', es: 'cansado', emoji: '😴' }, { en: 'match', es: 'partido', emoji: '⚽' }] },
          { id: 'e9', type: 'choose-image', word: 'concert', options: [{ emoji: '🎤', label: 'concert' }, { emoji: '🏖️', label: 'beach' }, { emoji: '🎬', label: 'cinema' }, { emoji: '🎮', label: 'video game' }], correct: 0, explanation: '"Concert" es recital. ¡Ojo con la pronunciación: CON-sert!', vocab: [{ en: 'concert', es: 'recital', emoji: '🎤' }] },
          { id: 'e10', type: 'speak', phrase: 'I went to a concert last Saturday.', translation: 'Fui a un recital el sábado pasado.', explanation: 'Decí "went" como "güent" y "Saturday" con acento en la primera sílaba.' },
        ],
      },
    ],
  },
  {
    id: 'a2-u6', level: 'A2', number: 6, title: 'Social media & tech',
    description: 'Hablá de redes, apps y celulares, y comparalos como un pro',
    lessons: [
      {
        id: 'a2-u6-l1', title: 'Redes y apps',
        exercises: [
          { id: 'e1', type: 'choose-image', word: 'phone', options: [{ emoji: '💻', label: 'laptop' }, { emoji: '📱', label: 'phone' }, { emoji: '🎧', label: 'headphones' }, { emoji: '📷', label: 'camera' }], correct: 1, explanation: '"Phone" es el celular. También se dice "mobile phone" o "cell phone".', vocab: [{ en: 'phone', es: 'celular', emoji: '📱' }, { en: 'headphones', es: 'auriculares', emoji: '🎧' }] },
          { id: 'e2', type: 'choose-translation', prompt: 'I post photos on Instagram every week.', promptLang: 'en', options: ['Subo fotos a Instagram todas las semanas.', 'Miro fotos en Instagram todos los días.', 'Subí fotos a Instagram ayer.'], correct: 0, explanation: '"Post" es publicar o subir algo a una red. "Every week" indica una rutina.', vocab: [{ en: 'post', es: 'publicar' }, { en: 'photo', es: 'foto', emoji: '📸' }] },
          { id: 'e3', type: 'match-pairs', pairs: [{ en: 'follow', es: 'seguir' }, { en: 'followers', es: 'seguidores' }, { en: 'message', es: 'mensaje' }, { en: 'app', es: 'aplicación' }, { en: 'link', es: 'enlace' }], explanation: '"Followers" son las personas que te siguen. ¡Más seguidores, más fama!', vocab: [{ en: 'follow', es: 'seguir' }, { en: 'followers', es: 'seguidores' }, { en: 'message', es: 'mensaje', emoji: '💬' }, { en: 'app', es: 'aplicación', emoji: '📲' }, { en: 'link', es: 'enlace', emoji: '🔗' }] },
          { id: 'e4', type: 'fill-blank', sentence: 'I ___ messages to my friends every day.', options: ['sends', 'send', 'sending'], correct: 1, translation: 'Les mando mensajes a mis amigos todos los días.', explanation: 'Con "I" el verbo queda sin cambios: "send". Solo con he/she/it se agrega -s.' },
          { id: 'e5', type: 'build-sentence', prompt: 'Sigo a mis youtubers favoritos', promptLang: 'es', accepted: ['I follow my favorite YouTubers', 'I follow my favourite YouTubers'], bank: ['I', 'follow', 'my', 'favorite', 'favourite', 'YouTubers', 'follows', 'a'], explanation: '"Favorite" se escribe así en inglés americano y "favourite" en británico: valen los dos.' },
          { id: 'e6', type: 'listen-type', audio: 'I watch videos on YouTube.', accepted: ['I watch videos on YouTube.', 'I watch videos on YouTube'], translation: 'Miro videos en YouTube.', explanation: 'Con redes y plataformas se usa "on": on YouTube, on TikTok, on Instagram.' },
          { id: 'e7', type: 'type-translation', prompt: 'Ella publica una foto', promptLang: 'es', accepted: ['She posts a photo', 'She posts a picture'], explanation: 'Con "she" el verbo lleva -s: "posts".' },
          { id: 'e8', type: 'listen-choose', audio: 'Can you send me the link?', options: ['¿Querés ver el video?', '¿Podés abrir la aplicación?', '¿Podés mandarme el link?'], correct: 2, explanation: '"Can you send me...?" es una forma natural de pedir que te manden algo.' },
          { id: 'e9', type: 'speak', phrase: "Let's take a selfie!", translation: '¡Sacámonos una selfie!', explanation: '"Take a selfie" es sacarse una selfie. Con "take" también se dice "take a photo".', vocab: [{ en: 'selfie', es: 'selfie', emoji: '🤳' }] },
        ],
      },
      {
        id: 'a2-u6-l2', title: 'Comparar y pedir ayuda',
        exercises: [
          { id: 'e1', type: 'choose-translation', prompt: 'This phone is faster than my old phone.', promptLang: 'en', options: ['Este celular es más lento que el viejo.', 'Este celular es más rápido que mi celular viejo.', 'Este celular es tan rápido como el mío.'], correct: 1, explanation: 'Con adjetivos cortos se agrega -er y "than": fast → faster than.', vocab: [{ en: 'faster', es: 'más rápido' }] },
          { id: 'e2', type: 'fill-blank', sentence: 'This phone is ___ than that one.', options: ['more cheap', 'cheaper', 'cheapest'], correct: 1, translation: 'Este celular es más barato que aquel.', explanation: 'Adjetivo corto + -er: cheap → cheaper.', vocab: [{ en: 'cheaper', es: 'más barato' }] },
          { id: 'e3', type: 'fill-blank', sentence: 'Instagram is ___ than Facebook for teenagers.', options: ['popularer', 'most popular', 'more popular'], correct: 2, translation: 'Instagram es más popular que Facebook entre los adolescentes.', explanation: 'Con adjetivos largos se usa "more": more popular, more expensive.' },
          { id: 'e4', type: 'match-pairs', pairs: [{ en: 'faster', es: 'más rápido' }, { en: 'cheaper', es: 'más barato' }, { en: 'more expensive', es: 'más caro' }, { en: 'better', es: 'mejor' }, { en: 'battery', es: 'batería' }], explanation: '"Better" es irregular: es el comparativo de "good", no se dice "gooder".', vocab: [{ en: 'more expensive', es: 'más caro' }, { en: 'better', es: 'mejor' }, { en: 'battery', es: 'batería', emoji: '🔋' }] },
          { id: 'e5', type: 'build-sentence', prompt: 'Mi celular es más rápido que el tuyo', promptLang: 'es', accepted: ['My phone is faster than yours'], bank: ['My', 'phone', 'is', 'faster', 'than', 'yours', 'fast', 'more', 'mine'], explanation: '"Yours" reemplaza a "your phone" para no repetir.' },
          { id: 'e6', type: 'listen-choose', audio: 'Can you help me with this app?', options: ['¿Me ayudás con esta aplicación?', '¿Me prestás tu celular?', '¿Descargaste esta aplicación?'], correct: 0, explanation: '"Can you help me with...?" sirve para pedir ayuda con cualquier cosa.', vocab: [{ en: 'help', es: 'ayudar' }] },
          { id: 'e7', type: 'type-translation', prompt: '¿Me ayudás con mi celular?', promptLang: 'es', accepted: ['Can you help me with my phone?', 'Can you help me with my phone', 'Could you help me with my phone?', 'Could you help me with my phone', 'Can you help me with my cell phone?', 'Can you help me with my cell phone'], explanation: '"Could you" es un poco más amable que "Can you".' },
          { id: 'e8', type: 'listen-type', audio: 'My phone has no battery.', accepted: ['My phone has no battery.', 'My phone has no battery'], translation: 'Mi celular no tiene batería.', explanation: '"Has no" es otra forma de decir "doesn\'t have".' },
          { id: 'e9', type: 'choose-translation', prompt: 'La desventaja es que es muy caro.', promptLang: 'es', options: ["The best part is that it's very cheap.", "The downside is that it's very expensive.", "The problem is that it's very slow."], correct: 1, explanation: '"Downside" es la desventaja y "upside" la ventaja. Sirven para dar pros y contras.', vocab: [{ en: 'downside', es: 'desventaja' }, { en: 'upside', es: 'ventaja' }] },
          { id: 'e10', type: 'speak', phrase: 'Gaming is fun, but it takes a lot of time.', translation: 'Jugar es divertido, pero lleva mucho tiempo.', explanation: '"But" marca el contraste, ideal para decir pros y contras.', vocab: [{ en: 'gaming', es: 'jugar videojuegos', emoji: '🎮' }] },
        ],
      },
    ],
  },
]
