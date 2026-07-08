// js/svg-generator.js - Generatore SVG intelligente per tavole tecniche UIBM

class SVGGenerator {
  constructor() {
    this.width = 800
    this.height = 600
    this.margin = 50
    this.centerX = this.width / 2
    this.centerY = this.height / 2
  }

  // Genera tavole complete da JSON strutturato
  generaTavole(jsonData) {
    if (!jsonData || !jsonData.viste || !jsonData.componenti) {
      console.error('[SVGGenerator] Dati JSON non validi')
      return this.generaTavoleFallback(jsonData)
    }

    const tavole = []

    for (const vista of jsonData.viste) {
      const svg = this.generaVista(vista, jsonData.componenti)
      tavole.push({
        tipo: vista.tipo,
        titolo: vista.titolo || `Vista ${vista.tipo}`,
        numero: tavole.length + 1,
        svg: svg,
        componenti: this.estraiComponentiVista(vista, jsonData.componenti)
      })
    }

    return tavole
  }

  // Genera una singola vista
  generaVista(vista, componenti) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', this.width)
    svg.setAttribute('height', this.height)
    svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Sfondo
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100%')
    rect.setAttribute('height', '100%')
    rect.setAttribute('fill', '#ffffff')
    svg.appendChild(rect)

    // Titolo
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    title.setAttribute('x', this.centerX)
    title.setAttribute('y', 30)
    title.setAttribute('text-anchor', 'middle')
    title.setAttribute('font-family', 'Arial, sans-serif')
    title.setAttribute('font-size', '18')
    title.setAttribute('font-weight', 'bold')
    title.setAttribute('fill', '#000000')
    title.textContent = `${vista.titolo || vista.tipo.toUpperCase()}`
    svg.appendChild(title)

    // Gruppo per i componenti
    const gruppo = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    gruppo.setAttribute('transform', `translate(${this.centerX}, ${this.centerY})`)

    // Disegna componenti
    const componentiVista = this.estraiComponentiVista(vista, componenti)
    for (const comp of componentiVista) {
      const elemento = this.disegnaComponente(comp, vista.tipo)
      if (elemento) {
        gruppo.appendChild(elemento)
      }
    }

    svg.appendChild(gruppo)

    // Bordo tavola
    const bordo = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bordo.setAttribute('x', 10)
    bordo.setAttribute('y', 10)
    bordo.setAttribute('width', this.width - 20)
    bordo.setAttribute('height', this.height - 20)
    bordo.setAttribute('fill', 'none')
    bordo.setAttribute('stroke', '#000000')
    bordo.setAttribute('stroke-width', '2')
    svg.appendChild(bordo)

    return svg
  }

  // Disegna un singolo componente
  disegnaComponente(comp, tipoVista) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    const forma = comp.forma || 'rettangolo'
    const dim = comp.dimensioni || { larghezza: 100, altezza: 50, profondita: 30 }
    const pos = comp.posizione || { x: 0, y: 0, z: 0 }
    const num = comp.numero || 101

    // Scala dimensioni per visualizzazione
    const scala = 2
    const w = (dim.larghezza || 100) / scala
    const h = (dim.altezza || 50) / scala
    const d = (dim.profondita || 30) / scala

    // Posizione centrata
    const x = pos.x / scala - w / 2
    const y = pos.y / scala - h / 2

    let elemento

    switch (forma.toLowerCase()) {
      case 'rettangolo':
      case 'rettangolare':
        elemento = this.disegnaRettangolo(x, y, w, h, num)
        break
      case 'cerchio':
      case 'circolare':
        elemento = this.disegnaCerchio(x, y, w / 2, num)
        break
      case 'cilindro':
      case 'cilindrico':
        elemento = this.disegnaCilindro(x, y, w, h, num, tipoVista)
        break
      case 'arco':
      case 'curvo':
        elemento = this.disegnaArco(x, y, w, h, num)
        break
      case 'triangolo':
        elemento = this.disegnaTriangolo(x, y, w, h, num)
        break
      case 'trapezio':
        elemento = this.disegnaTrapezio(x, y, w, h, num)
        break
      case 'linea':
        elemento = this.disegnaLinea(x, y, w, h, num)
        break
      default:
        elemento = this.disegnaRettangolo(x, y, w, h, num)
    }

    if (elemento) {
      g.appendChild(elemento)
    }

    // Aggiungi numero di riferimento
    const testo = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    testo.setAttribute('x', x + w / 2)
    testo.setAttribute('y', y - 10)
    testo.setAttribute('text-anchor', 'middle')
    testo.setAttribute('font-family', 'Arial, sans-serif')
    testo.setAttribute('font-size', '12')
    testo.setAttribute('fill', '#000000')
    testo.textContent = num
    g.appendChild(testo)

    return g
  }

  // Forme geometriche base
  disegnaRettangolo(x, y, w, h, num) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', w)
    rect.setAttribute('height', h)
    rect.setAttribute('fill', 'none')
    rect.setAttribute('stroke', '#000000')
    rect.setAttribute('stroke-width', '1.5')
    return rect
  }

  disegnaCerchio(x, y, r, num) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', x + r)
    circle.setAttribute('cy', y + r)
    circle.setAttribute('r', r)
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke', '#000000')
    circle.setAttribute('stroke-width', '1.5')
    return circle
  }

  disegnaCilindro(x, y, w, h, num, tipoVista) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    if (tipoVista === 'sezione') {
      // Vista sezione: rettangolo con tratteggio
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', x)
      rect.setAttribute('y', y)
      rect.setAttribute('width', w)
      rect.setAttribute('height', h)
      rect.setAttribute('fill', 'none')
      rect.setAttribute('stroke', '#000000')
      rect.setAttribute('stroke-width', '1.5')
      g.appendChild(rect)

      // Tratteggio sezione
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line1.setAttribute('x1', x + 5)
      line1.setAttribute('y1', y + 5)
      line1.setAttribute('x2', x + w - 5)
      line1.setAttribute('y2', y + h - 5)
      line1.setAttribute('stroke', '#000000')
      line1.setAttribute('stroke-width', '0.5')
      line1.setAttribute('stroke-dasharray', '5,5')
      g.appendChild(line1)
    } else {
      // Vista esterna: rettangolo con ellissi sopra e sotto
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', x)
      rect.setAttribute('y', y + 10)
      rect.setAttribute('width', w)
      rect.setAttribute('height', h - 20)
      rect.setAttribute('fill', 'none')
      rect.setAttribute('stroke', '#000000')
      rect.setAttribute('stroke-width', '1.5')
      g.appendChild(rect)

      // Ellisse superiore
      const ellipse1 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      ellipse1.setAttribute('cx', x + w / 2)
      ellipse1.setAttribute('cy', y + 10)
      ellipse1.setAttribute('rx', w / 2)
      ellipse1.setAttribute('ry', 10)
      ellipse1.setAttribute('fill', 'none')
      ellipse1.setAttribute('stroke', '#000000')
      ellipse1.setAttribute('stroke-width', '1.5')
      g.appendChild(ellipse1)

      // Ellisse inferiore (linea tratteggiata per vista 3D)
      const ellipse2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      ellipse2.setAttribute('cx', x + w / 2)
      ellipse2.setAttribute('cy', y + h - 10)
      ellipse2.setAttribute('rx', w / 2)
      ellipse2.setAttribute('ry', 10)
      ellipse2.setAttribute('fill', 'none')
      ellipse2.setAttribute('stroke', '#000000')
      ellipse2.setAttribute('stroke-width', '1.5')
      ellipse2.setAttribute('stroke-dasharray', '3,3')
      g.appendChild(ellipse2)
    }

    return g
  }

  disegnaArco(x, y, w, h, num) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // Arco inferiore (base del dondolo)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const d = `M ${x} ${y + h} Q ${x + w / 2} ${y + h + 30} ${x + w} ${y + h}`
    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', '#000000')
    path.setAttribute('stroke-width', '2')
    g.appendChild(path)

    return g
  }

  disegnaTriangolo(x, y, w, h, num) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    const points = `${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}`
    polygon.setAttribute('points', points)
    polygon.setAttribute('fill', 'none')
    polygon.setAttribute('stroke', '#000000')
    polygon.setAttribute('stroke-width', '1.5')
    return polygon
  }

  disegnaTrapezio(x, y, w, h, num) {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
    const offset = w * 0.2
    const points = `${x + offset},${y} ${x + w - offset},${y} ${x + w},${y + h} ${x},${y + h}`
    polygon.setAttribute('points', points)
    polygon.setAttribute('fill', 'none')
    polygon.setAttribute('stroke', '#000000')
    polygon.setAttribute('stroke-width', '1.5')
    return polygon
  }

  disegnaLinea(x, y, w, h, num) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', x)
    line.setAttribute('y1', y + h / 2)
    line.setAttribute('x2', x + w)
    line.setAttribute('y2', y + h / 2)
    line.setAttribute('stroke', '#000000')
    line.setAttribute('stroke-width', '1.5')
    return line
  }

  // Estrai componenti visibili in una vista
  estraiComponentiVista(vista, componenti) {
    if (!vista.componenti_visibili && !vista.componenti) {
      return componenti
    }

    const numeri = vista.componenti_visibili || vista.componenti || []
    return componenti.filter(c => numeri.includes(c.numero))
  }

  // Genera tavole fallback se JSON non valido
  generaTavoleFallback(descrizione) {
    console.log('[SVGGenerator] Generazione fallback per:', descrizione)

    // Analisi semplice della descrizione
    const desc = (descrizione || '').toLowerCase()

    let componenti = []

    if (desc.includes('sedia') || desc.includes('seduta')) {
      componenti = [
        { numero: 101, nome: 'Seduta', forma: 'rettangolo', dimensioni: { larghezza: 400, altezza: 40, profondita: 400 }, posizione: { x: 0, y: -100, z: 0 } },
        { numero: 102, nome: 'Schienale', forma: 'rettangolo', dimensioni: { larghezza: 400, altezza: 300, profondita: 40 }, posizione: { x: 0, y: -250, z: -180 } },
        { numero: 103, nome: 'Gambe anteriori', forma: 'cilindro', dimensioni: { larghezza: 40, altezza: 400, profondita: 40 }, posizione: { x: -150, y: 100, z: 150 } },
        { numero: 104, nome: 'Gambe posteriori', forma: 'cilindro', dimensioni: { larghezza: 40, altezza: 400, profondita: 40 }, posizione: { x: 150, y: 100, z: -150 } },
      ]

      if (desc.includes('dondolo') || desc.includes('dondola')) {
        componenti.push(
          { numero: 105, nome: 'Base curva', forma: 'arco', dimensioni: { larghezza: 500, altezza: 100, profondita: 50 }, posizione: { x: 0, y: 300, z: 0 } },
          { numero: 106, nome: 'Supporti dondolo', forma: 'rettangolo', dimensioni: { larghezza: 60, altezza: 200, profondita: 40 }, posizione: { x: -200, y: 200, z: 0 } }
        )
      }
    } else if (desc.includes('usb') || desc.includes('connettore')) {
      componenti = [
        { numero: 101, nome: 'Connettore USB', forma: 'rettangolo', dimensioni: { larghezza: 30, altezza: 15, profondita: 20 }, posizione: { x: 0, y: 0, z: 0 } },
        { numero: 102, nome: 'Cavo', forma: 'cilindro', dimensioni: { larghezza: 8, altezza: 200, profondita: 8 }, posizione: { x: 0, y: 100, z: 0 } },
      ]
    } else {
      // Default: cilindro generico
      componenti = [
        { numero: 101, nome: 'Corpo principale', forma: 'cilindro', dimensioni: { larghezza: 100, altezza: 200, profondita: 100 }, posizione: { x: 0, y: 0, z: 0 } },
      ]
    }

    const viste = [
      { tipo: 'assieme', titolo: 'Vista assieme montato', componenti_visibili: componenti.map(c => c.numero) },
      { tipo: 'esplosa', titolo: 'Vista esplosa', componenti: componenti.map(c => c.numero), direzioni_esplosione: { x: 50, y: 0, z: 0 } },
      { tipo: 'sezione', titolo: 'Sezione A-A', piano_sezione: 'xz', componenti_visibili: componenti.slice(0, 2).map(c => c.numero) },
      { tipo: 'dettaglio', titolo: 'Dettaglio X', componente: componenti[0].numero, scala: 2 }
    ]

    return this.generaTavole({ componenti, viste })
  }

  // Esporta SVG come stringa
  svgToString(svg) {
    const serializer = new XMLSerializer()
    return serializer.serializeToString(svg)
  }

  // Genera tavole da descrizione testuale (per compatibilita)
  async generaDaDescrizione(descrizione, apiUrl, apiKey) {
    try {
      // Chiama API per ottenere JSON strutturato
      const response = await fetch(apiUrl + '/functions/v1/call-ai-tavole', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey,
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          descrizione: descrizione,
          servizio: 'servizio-tavole'
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        return this.generaTavole(data.data)
      } else {
        return this.generaTavoleFallback(descrizione)
      }
    } catch (error) {
      console.error('[SVGGenerator] Errore API:', error)
      return this.generaTavoleFallback(descrizione)
    }
  }
}

// Esportazione
if (typeof window !== 'undefined') {
  window.SVGGenerator = SVGGenerator
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SVGGenerator
}
