import type { Topic } from '../types'

/** Videos: URLs públicas de demostración (YouTube embed). En producción serían de Santillana. */
export const INITIAL_TOPICS: Topic[] = [
  {
    id: 'sumas',
    title: 'Sumas',
    category: 'Aritmética',
    answerMode: 'escrito',
    whatIs:
      'La suma es la operación aritmética que combina dos o más cantidades para obtener un total. Se representa con el signo +.',
    howToSolve:
      '1. Alinea las cantidades por valor posicional.\n2. Suma dígito a dígito de derecha a izquierda.\n3. Si la suma de una columna es 10 o más, lleva 1 a la siguiente columna.\n4. El resultado es el total.',
    example: '245 + 178 = 423',
    videoUrl: 'https://www.youtube.com/embed/AQ7VSEnNn3c',
    videoTitle: 'Cómo sumar paso a paso',
    prerequisiteIds: [],
  },
  {
    id: 'restas',
    title: 'Restas',
    category: 'Aritmética',
    answerMode: 'escrito',
    whatIs:
      'La resta es la operación que encuentra la diferencia entre dos cantidades. Se representa con el signo -.',
    howToSolve:
      '1. Coloca el minuendo arriba y el sustraendo abajo.\n2. Resta de derecha a izquierda.\n3. Si un dígito es menor, pide prestado a la columna izquierda.\n4. El resultado es la diferencia.',
    example: '512 - 287 = 225',
    videoUrl: 'https://www.youtube.com/embed/eCjONmC3G78',
    videoTitle: 'Restas con y sin préstamo',
    prerequisiteIds: ['sumas'],
  },
  {
    id: 'multiplicaciones',
    title: 'Multiplicaciones',
    category: 'Aritmética',
    answerMode: 'escrito',
    whatIs:
      'La multiplicación es una suma repetida. Combina grupos de igual tamaño. Se representa con x.',
    howToSolve:
      '1. Multiplica el multiplicando por cada dígito del multiplicador.\n2. Desplaza cada producto parcial según la posición.\n3. Suma los productos parciales.\n4. El resultado es el producto.',
    example: '36 x 12 = 432',
    videoUrl: 'https://www.youtube.com/embed/egjHqmVH0k4',
    videoTitle: 'Multiplicación de dos cifras',
    prerequisiteIds: ['sumas'],
  },
  {
    id: 'divisiones',
    title: 'Divisiones',
    category: 'Aritmética',
    answerMode: 'escrito',
    whatIs:
      'La división reparte una cantidad en partes iguales. Se representa con /.',
    howToSolve:
      '1. Divide el dividendo entre el divisor.\n2. Multiplica el cociente parcial por el divisor.\n3. Resta y baja el siguiente dígito.\n4. Repite hasta terminar. El resultado es el cociente.',
    example: '144 / 12 = 12',
    videoUrl: 'https://www.youtube.com/embed/8ydJr1Is8xI',
    videoTitle: 'División paso a paso',
    prerequisiteIds: ['multiplicaciones', 'restas'],
  },
  {
    id: 'ecuaciones',
    title: 'Ecuaciones',
    category: 'Álgebra',
    answerMode: 'opcion_multiple',
    whatIs:
      'Una ecuación es una igualdad que contiene una o más incógnitas. Resolverla significa encontrar el valor que la hace verdadera.',
    howToSolve:
      '1. Simplifica ambos lados (paréntesis, términos semejantes).\n2. Aísla la incógnita sumando o restando términos.\n3. Divide o multiplica para despejar.\n4. Verifica sustituyendo el valor encontrado.',
    example: '2x + 5 = 13 → x = 4',
    videoUrl: 'https://www.youtube.com/embed/l3X9X2Dabcd',
    videoTitle: 'Introducción a ecuaciones',
    prerequisiteIds: ['despejar-x', 'sumas', 'restas'],
  },
  {
    id: 'despejar-x',
    title: 'Despejar x',
    category: 'Álgebra',
    answerMode: 'escrito',
    whatIs:
      'Despejar x consiste en aislar la incógnita en un lado de la igualdad mediante operaciones inversas.',
    howToSolve:
      '1. Identifica las operaciones aplicadas sobre x.\n2. Aplica la operación inversa en ambos lados.\n3. Continúa hasta dejar x sola.\n4. Comprueba el resultado.',
    example: '3x - 7 = 8 → 3x = 15 → x = 5',
    videoUrl: 'https://www.youtube.com/embed/9vK4MWqN1y0',
    videoTitle: 'Despejar la incógnita',
    prerequisiteIds: ['sumas', 'restas', 'multiplicaciones', 'divisiones'],
  },
  {
    id: 'polinomios',
    title: 'Polinomios',
    category: 'Álgebra',
    answerMode: 'opcion_multiple',
    whatIs:
      'Un polinomio es una expresión algebraica formada por términos con coeficientes y potencias no negativas de una variable.',
    howToSolve:
      '1. Ordena por grado decreciente.\n2. Combina términos semejantes.\n3. Para sumar/restar, opera coeficientes de igual grado.\n4. Para multiplicar, aplica distributiva y reduce.',
    example: '(2x^2 + 3x) + (x^2 - 5x) = 3x^2 - 2x',
    videoUrl: 'https://www.youtube.com/embed/3N0l2x_poly',
    videoTitle: 'Polinomios básicos',
    prerequisiteIds: ['sumas', 'restas'],
  },
  {
    id: 'factorizar',
    title: 'Factorizar',
    category: 'Álgebra',
    answerMode: 'opcion_multiple',
    whatIs:
      'Factorizar es escribir una expresión como producto de factores. Es la operación inversa a expandir.',
    howToSolve:
      '1. Busca factor común.\n2. Identifica patrones (diferencia de cuadrados, trinomio cuadrado).\n3. Aplica la fórmula correspondiente.\n4. Verifica expandiendo el resultado.',
    example: 'x^2 - 9 = (x - 3)(x + 3)',
    videoUrl: 'https://www.youtube.com/embed/fact0r1ze01',
    videoTitle: 'Factorización: diferencia de cuadrados',
    prerequisiteIds: ['polinomios', 'multiplicaciones'],
  },
]
