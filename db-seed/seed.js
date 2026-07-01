const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

mongoose.connect('mongodb://127.0.0.1:27017/artaround')
  .then(() => console.log('MongoDB connesso'))
  .catch(err => { console.error(err); process.exit(1) })

// ─── SCHEMI INLINE ────────────────────────────────────────

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['author', 'visitor'], default: 'visitor' }
}, { timestamps: true }))

const MuseumObject = mongoose.model('MuseumObject', new mongoose.Schema({
  universalId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  artist: String,
  year: String,
  room: String,
  position: { x: Number, y: Number },
  image: String,
  style: String,
  museumId: { type: String, required: true }
}, { timestamps: true }))

const Item = mongoose.model('Item', new mongoose.Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, ref: 'MuseumObject', required: true },
  text: { type: String, required: true },
  duration: { type: String, enum: ['3s', '15s', '1min', '4min'], required: true },
  level: { type: String, enum: ['infantile', 'semplice', 'medio', 'avanzato'], required: true },
  language: { type: String, default: 'it' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license: { type: String, enum: ['free', 'cc-by', 'paid'], default: 'free' },
  price: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  image: String
}, { timestamps: true }))

const logisticSchema = new mongoose.Schema({ text: String, afterStepIndex: Number })
const visitStepSchema = new mongoose.Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, ref: 'MuseumObject' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
})
const Visit = mongoose.model('Visit', new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  museumId: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetLevel: { type: String, enum: ['infantile', 'semplice', 'medio', 'avanzato'] },
  estimatedDuration: String,
  steps: [visitStepSchema],
  logistics: [logisticSchema],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true }))

// ─── SEED ─────────────────────────────────────────────────

async function seed() {
  await User.deleteMany({})
  await MuseumObject.deleteMany({})
  await Item.deleteMany({})
  await Visit.deleteMany({})
  console.log('Database pulito')

  const hashedPw = await bcrypt.hash('12345678', 10)
  const [autore1, autore2] = await User.insertMany([
    { username: 'autore1', password: hashedPw, role: 'author' },
    { username: 'autore2', password: hashedPw, role: 'author' },
    { username: 'visitatore1', password: hashedPw, role: 'visitor' },
    { username: 'visitatore2', password: hashedPw, role: 'visitor' },
  ])
  console.log('Utenti creati')

  const objects = await MuseumObject.insertMany([
    { universalId: 'estense-001', title: 'Ritratto di Francesco I d\'Este', artist: 'Diego Velázquez', year: '1638', room: 'Sala 12', position: { x: 120, y: 80 }, museumId: 'galleria-estense', style: 'Barocco' },
    { universalId: 'estense-002', title: 'Busto di Francesco I d\'Este', artist: 'Gian Lorenzo Bernini', year: '1650–1651', room: 'Sala 12', position: { x: 200, y: 80 }, museumId: 'galleria-estense', style: 'Barocco' },
    { universalId: 'estense-003', title: 'San Giorgio e il drago', artist: 'Cosmè Tura', year: '1469 ca.', room: 'Sala 5', position: { x: 80, y: 160 }, museumId: 'galleria-estense', style: 'Rinascimento' },
    { universalId: 'estense-004', title: 'Madonna della Rosa', artist: 'Parmigianino', year: '1530 ca.', room: 'Sala 8', position: { x: 160, y: 160 }, museumId: 'galleria-estense', style: 'Manierismo' },
    { universalId: 'estense-005', title: 'Compianto sul Cristo morto', artist: 'Guercino', year: '1617', room: 'Sala 15', position: { x: 240, y: 160 }, museumId: 'galleria-estense', style: 'Barocco' },
    { universalId: 'estense-006', title: 'Giove e Semele', artist: 'Dosso Dossi', year: '1520 ca.', room: 'Sala 7', position: { x: 80, y: 240 }, museumId: 'galleria-estense', style: 'Rinascimento' },
    { universalId: 'estense-007', title: 'Ritratto di giovane', artist: 'Jacopo Tintoretto', year: '1550 ca.', room: 'Sala 10', position: { x: 160, y: 240 }, museumId: 'galleria-estense', style: 'Rinascimento' },
    { universalId: 'estense-008', title: 'Sacra Famiglia con san Giovannino', artist: 'Correggio', year: '1520 ca.', room: 'Sala 6', position: { x: 240, y: 240 }, museumId: 'galleria-estense', style: 'Rinascimento' },
    { universalId: 'estense-009', title: 'Transito della Vergine', artist: 'Nicolò dell\'Abate', year: '1540 ca.', room: 'Sala 4', position: { x: 80, y: 320 }, museumId: 'galleria-estense', style: 'Manierismo' },
    { universalId: 'estense-010', title: 'Ritratto di Giulio Clovio', artist: 'El Greco', year: '1571 ca.', room: 'Sala 11', position: { x: 160, y: 320 }, museumId: 'galleria-estense', style: 'Manierismo' },
    { universalId: 'estense-011', title: 'Madonna con Bambino e santi', artist: 'Ludovico Carracci', year: '1590 ca.', room: 'Sala 14', position: { x: 240, y: 320 }, museumId: 'galleria-estense', style: 'Barocco' },
    { universalId: 'estense-012', title: 'Ercole e Anteo', artist: 'Guido Reni', year: '1620 ca.', room: 'Sala 16', position: { x: 80, y: 400 }, museumId: 'galleria-estense', style: 'Barocco' },
  ])
  const pinacotecaObjects = await MuseumObject.insertMany([
    { universalId: 'pinacoteca-001', title: 'Polittico di Giotto', artist: 'Giotto', year: '1320 ca.', room: 'Sala 1', position: { x: 980, y: 420 }, museumId: 'pinacoteca-nazionale', style: 'Gotico' },
    { universalId: 'pinacoteca-002', title: 'Estasi di Santa Cecilia', artist: 'Raffaello Sanzio', year: '1516-1517', room: 'Sala 26', position: { x: 1000, y: 365 }, museumId: 'pinacoteca-nazionale', style: 'Rinascimento' },
    { universalId: 'pinacoteca-003', title: 'Strage degli innocenti', artist: 'Guido Reni', year: '1611', room: 'Sala 24', position: { x: 1000, y: 445 }, museumId: 'pinacoteca-nazionale', style: 'Barocco' },
    { universalId: 'pinacoteca-004', title: 'Pala di Santa Margherita', artist: 'Parmigianino', year: '1529-1530', room: 'Sala 27', position: { x: 965, y: 335 }, museumId: 'pinacoteca-nazionale', style: 'Manierismo' },
  ])
  console.log('Opere create:', objects.length + pinacotecaObjects.length)

  const allObjects = [...objects, ...pinacotecaObjects]
  const obj = (uid) => allObjects.find(o => o.universalId === uid)._id

  const items = await Item.insertMany([
    // Velázquez
    { objectId: obj('estense-001'), text: 'Un famoso ritratto dipinto da un grande pittore spagnolo.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Velázquez dipinse questo ritratto di Francesco I d\'Este nel 1638, senza mai incontrare il duca di persona. Si basò su una miniatura inviata da Modena. È uno dei pochi ritratti che il maestro spagnolo dedicò a un sovrano straniero.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Capolavoro della ritrattistica seicentesca, il ritratto di Francesco I d\'Este fu eseguito da Velázquez nel 1638, probabilmente su commissione dello stesso duca attraverso l\'ambasciatore estense a Madrid. Straordinariamente, Velázquez non incontrò mai il soggetto: si servì di una miniatura di Sustermans. La resa psicologica del personaggio, l\'uso della luce sui tessuti e l\'abbandono delle convenzioni manieristiche rivelano la piena maturità del pittore sivigliano.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Guarda questo signore elegante! Lo ha dipinto un pittore molto bravo che viveva in Spagna. Si chiama Francesco e governava Modena, la città dove sei adesso!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Il ritratto di Francesco I d\'Este rappresenta uno dei vertici della collaborazione tra le corti europee e i grandi maestri del Seicento. Francisco de Quevedo, contemporaneo di Velázquez, descriveva la pittura spagnola come capace di "rubare l\'anima" al soggetto. Velázquez, pittore di corte di Filippo IV, era abituato a ritrarre i potenti d\'Europa, ma il caso di Francesco I è eccezionale: il duca di Modena, desideroso di affermare il prestigio della propria casata sul piano internazionale, commissionò il ritratto attraverso il marchese Virginio Attendolo Bolognini, ambasciatore estense a Madrid. Velázquez lavorò su una miniatura di Sustermans, pittore di corte dei Medici che aveva ritratto Francesco durante un soggiorno fiorentino. Il risultato è straordinario: la resa psicologica del personaggio, lo sguardo leggermente obliquo, il trattamento virtuosistico dei merletti e del busto dorato rivelano la piena padronanza del maestro sivigliano. L\'opera entrò nelle collezioni estensi nel 1639 e rimase a Modena fino alle requisizioni napoleoniche, per poi rientrare definitivamente.', duration: '4min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // Bernini
    { objectId: obj('estense-002'), text: 'Un busto in marmo scolpito da Bernini, il più grande scultore del Seicento.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Bernini scolpì questo busto tra il 1650 e il 1651, lavorando su ritratti e calchi inviati da Modena. Il risultato è una delle sculture barocche più vivaci e psicologicamente intense mai realizzate.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Commissionato da Francesco I d\'Este a Gian Lorenzo Bernini tra il 1650 e il 1651, questo busto rappresenta uno dei vertici della ritrattistica scultorea barocca. Bernini non incontrò mai il soggetto e lavorò a partire da tre dipinti inviati da Modena. Il dinamismo del busto — la testa ruotata, il panneggio mosso, lo sguardo vivace — anticipa le soluzioni che Bernini svilupperà nel Baldacchino e nella Cattedra di San Pietro.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Tocca con gli occhi questo marmo! Sembra quasi morbido, vero? Lo ha scolpito Bernini, un artista bravissimo a lavorare la pietra. Ha fatto sembrare la giacca di seta e i capelli veri veri!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Il busto di Francesco I d\'Este è considerato da molti storici dell\'arte il capolavoro assoluto della ritrattistica scultorea barocca. Bernini lo realizzò tra il 1650 e il 1651 senza mai incontrare il soggetto, lavorando esclusivamente da tre dipinti inviati da Modena — tra cui il celebre ritratto di Velázquez visibile nella sala adiacente. La sfida tecnica era enorme: tradurre in marmo la vitalità psicologica di un uomo che Bernini non aveva mai visto. La soluzione fu geniale: la testa ruotata, lo sguardo rivolto verso qualcosa fuori campo, il panneggio mosso come se il duca fosse colto in un momento di improvvisa attenzione. Il marmo è lavorato con un virtuosismo senza precedenti: i merletti del colletto sembrano tessuto reale, i capelli fluiscono con naturalezza, la seta del mantello ha una consistenza quasi tattile. Baldinucci, biografo di Bernini, racconta che il maestro disse di aver "dato il moto al marmo". Il busto arrivò a Modena nel 1651 e fu accolto con straordinario entusiasmo dalla corte estense. È oggi considerato uno dei pochi casi nella storia dell\'arte in cui la scultura riesce a superare la pittura nella resa della personalità.', duration: '4min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // Cosmè Tura
    { objectId: obj('estense-003'), text: 'Un cavaliere che combatte un drago: la storia di san Giorgio.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-003'), text: 'Cosmè Tura fu il fondatore della scuola ferrarese. Le figure sembrano scolpite nel bronzo: durissime e metalliche. Il drago è minaccioso ma Giorgio lo domina con sicurezza, in piena armatura.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-003'), text: 'Cosmè Tura è il più importante pittore ferrarese del Quattrocento. Figure dal volume metallico e quasi scultorico, colori smaltati, un paesaggio roccioso e fantastico che risente dell\'influenza di Mantegna e della pittura fiamminga. Lo stile di Tura, duro e prezioso, riflette la cultura di corte estense, attenta alle miniature, agli smalti e agli oggetti di lusso.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-003'), text: 'Un cavaliere coraggioso sta combattendo un drago enorme! Si chiama san Giorgio. Il pittore ha usato colori brillanti per far sembrare l\'armatura lucente come un giocattolo di metallo.', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Parmigianino
    { objectId: obj('estense-004'), text: 'La Madonna della Rosa di Parmigianino: figure eleganti e allungate.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-004'), text: 'Parmigianino dipinse questa opera intorno al 1530. Le figure sono tipicamente allungate e sofisticate. Il bambino Gesù porge una rosa alla madre, simbolo di purezza. I colori freddi e cangianti anticipano il manierismo maturo.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-004'), text: 'Francesco Mazzola detto il Parmigianino realizzò questa tavola probabilmente durante il soggiorno bolognese seguente al Sacco di Roma (1527). Le proporzioni allungate, il collo lungo della Vergine, i colori smaltati e la luce fredda sono caratteristiche tipiche della maniera parmigianinesca. L\'opera è considerata uno dei capolavori del manierismo emiliano.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-004'), text: 'Guarda la mamma con il suo bambino! Il bambino tiene in mano una rosa rossa. Il pittore si chiamava Parmigianino perché veniva da Parma. Ha disegnato le persone con il collo un po\' lungo, come dei cigni!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-004'), text: 'La Madonna della Rosa di Parmigianino è uno dei documenti più raffinati del manierismo emiliano maturo. Francesco Mazzola, detto il Parmigianino per le sue origini parmensi, dipinse questa tavola probabilmente tra il 1529 e il 1530, durante il soggiorno bolognese che seguì il traumatico Sacco di Roma del 1527. L\'esperienza romana era stata fondamentale per la sua formazione: aveva studiato Raffaello e Michelangelo, assorbendo la lezione classica per poi reinterpretarla in chiave personale e antinaturalistica. Le figure allungate, il collo lungo e arcuato della Vergine, le proporzioni volutamente distorte non sono ingenuità anatomiche ma scelte estetiche precise, che puntano a un ideale di grazia artificiale e raffinata — la sprezzatura pittorica di cui parlava Castiglione nel Cortegiano. La rosa che il Bambino porge alla madre è simbolo mariano tradizionale ma anche richiamo alla vita terrena e alla Passione. La luce fredda e cangiante, i colori smaltati quasi metallici, l\'atmosfera sospesa e irreale rendono quest\'opera uno dei vertici del manierismo padano.', duration: '4min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // Guercino
    { objectId: obj('estense-005'), text: 'Il Compianto sul Cristo morto del Guercino: dolore e luce drammatica.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-005'), text: 'Il Guercino dipinse questo Compianto nel 1617, quando aveva solo vent\'anni. La scena mostra la Madonna e san Giovanni che piangono sul corpo di Cristo. Il forte contrasto tra ombre scure e zone illuminate è già maturo.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-005'), text: 'Giovanni Francesco Barbieri detto il Guercino realizzò quest\'opera giovanile nel 1617, rivelando già una padronanza del chiaroscuro di ascendenza caravaggesca. La composizione è piramidale, con il corpo di Cristo al centro, sorretto da angeli e compianto dalla Vergine e da san Giovanni.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-005'), text: 'Guarda quest\'uomo che dorme... no, non dorme. È Gesù e tutti lo piangono perché gli vogliono bene. Il pittore si chiamava Guercino ed era bravissimo a dipingere le facce tristi.', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Dosso Dossi
    { objectId: obj('estense-006'), text: 'Dosso Dossi dipinse divinità mitologiche con colori vivaci e fantastici.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-006'), text: 'Dosso Dossi era il pittore preferito della corte estense di Ferrara. Questo dipinto raffigura Giove e Semele, tratto dalle Metamorfosi di Ovidio. I colori sono intensi e la composizione movimentata.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-006'), text: 'Dosso Dossi fu il pittore di corte degli Este a Ferrara. Il soggetto, tratto dalle Metamorfosi di Ovidio, racconta come Semele, amante di Giove, chiese di vedere il dio nella sua forma reale e ne fu fulminata. Ariosto, che frequentava la stessa corte, lo celebrò nell\'Orlando Furioso.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-006'), text: 'Questo è Giove, il re degli dei! È fortissimo e lancia i fulmini. Dosso Dossi lo ha dipinto con colori brillanti perché i re devono essere sempre belli e potenti!', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
    // Tintoretto
    { objectId: obj('estense-007'), text: 'Un ritratto veneziano di Tintoretto: potente e psicologico.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-007'), text: 'Tintoretto è uno dei grandi pittori veneziani del Cinquecento. Questo ritratto è caratterizzato da una pennellata veloce e dalla tipica luce che emerge dallo sfondo scuro. Il soggetto ci guarda con intensità.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-007'), text: 'Jacopo Robusti detto il Tintoretto è tra i massimi esponenti del tardo Rinascimento veneziano. I suoi ritratti si distinguono per la pennellata rapida e nervosa, lo sfondo scuro da cui emerge il soggetto grazie a una luce radente, e la profondità psicologica del personaggio.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-007'), text: 'Guarda questo signore serio! Non sorride, ma ha gli occhi molto vivi. Il pittore Tintoretto era bravissimo a dipingere le persone come se fossero vere vere!', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
    // Correggio
    { objectId: obj('estense-008'), text: 'Correggio dipinse Madonne dolcissime, con luci morbide e calde.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Antonio Allegri detto il Correggio rivoluzionò la pittura emiliana con il suo stile morbido e sentimentale. Il piccolo Gesù gioca con Giovannino in una scena tenera e familiare, avvolta da una luce dorata.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Antonio Allegri da Correggio sviluppò uno stile originalissimo che anticipa il Barocco. La morbidezza dello sfumato, derivato da Leonardo, si combina con una luminosità calda e dorata. Le espressioni dei personaggi sacri sono affettuose e quotidiane. Questo umanesimo emotivo influenzò enormemente la pittura barocca emiliana, da Guercino ai Carracci.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Guarda questa famiglia felice! C\'è la mamma, il papà, e due bambini che giocano insieme. Il pittore si chiamava Correggio. Ha usato colori molto caldi, come la luce del sole al tramonto!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Nicolò dell'Abate
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate: colori vivaci e storie religiose eleganti.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate nacque proprio a Modena ed è uno degli artisti più importanti del Rinascimento emiliano. I colori sono brillanti, i gesti teatrali, i panneggi elaborati: uno stile elegante che piaceva alle corti.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate è il grande protagonista del Rinascimento modenese prima di trasferirsi in Francia, dove diventerà uno dei fondatori della Scuola di Fontainebleau. Il suo stile fonde la lezione parmigianinesca con una narratività vivace e una tendenza al decorativo.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-009'), text: 'Questi uomini stanno tutti intorno a una persona importante. Nicolò dell\'Abate era di Modena, proprio come te! Ha usato colori bellissimi per questa storia.', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // El Greco
    { objectId: obj('estense-010'), text: 'El Greco: un pittore greco che lavorò in Spagna con uno stile unico.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-010'), text: 'El Greco era originario di Creta e si formò a Venezia prima di stabilirsi a Toledo. Questo ritratto raffigura Giulio Clovio, miniaturista che El Greco conobbe a Roma. Lo stile è già inconfondibile: colori freddi e figure intense.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-010'), text: 'Doménikos Theotokópoulos detto El Greco realizzò questo ritratto di Giulio Clovio probabilmente intorno al 1571, durante il soggiorno romano. È uno dei rarissimi ritratti del periodo italiano di El Greco, e mostra già la palette fredda e argentea e la tensione psicologica del suo stile maturo.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-010'), text: 'Quest\'uomo si chiama Giulio e teneva in mano un libro con disegni piccoli piccoli! El Greco lo ha dipinto con colori freddi come il ghiaccio.', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
    // Ludovico Carracci
    { objectId: obj('estense-011'), text: 'Ludovico Carracci: fondatore dell\'Accademia bolognese degli Incamminati.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-011'), text: 'Ludovico Carracci, insieme ai cugini Annibale e Agostino, fondò a Bologna l\'Accademia degli Incamminati, che rivoluzionò la pittura italiana di fine Cinquecento reagendo contro i manierismi artificiali.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-011'), text: 'Ludovico Carracci è la figura centrale della riforma pittorica bolognese di fine Cinquecento. L\'Accademia degli Incamminati teorizzava un ritorno allo studio dal naturale e ai grandi modelli del Rinascimento contro l\'artificiosità del manierismo tardo. L\'influenza dei Carracci fu immensa: da Guercino a Domenichino a Reni, tutta la pittura bolognese del Seicento si sviluppò nel solco di questa riforma.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-011'), text: 'Ecco la Madonna con il suo bambino Gesù! Intorno ci sono i santi che li proteggono. Ludovico Carracci era di Bologna ed era molto famoso!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Guido Reni
    { objectId: obj('estense-012'), text: 'Guido Reni dipinse eroi mitologici con eleganza e grazia classica.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-012'), text: 'Guido Reni è uno dei grandi pittori bolognesi del Seicento. Questa scena mostra Ercole che solleva Anteo da terra, privandolo della forza che traeva dal contatto con la madre Terra. Lo stile è classico e armonioso.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-012'), text: 'Guido Reni fu l\'artista più celebrato e meglio pagato del suo tempo. La lotta tra Ercole e Anteo è un soggetto mitologico tratto dalle Metamorfosi: Anteo, figlio di Gaia, recuperava le forze toccando la terra, e Ercole lo sconfisse sollevandolo in aria. La composizione di Reni è torsionale e scultorea, con evidente debito verso l\'antico.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-012'), text: 'Ercole è fortissimo! Sta sollevando Anteo da terra perché Anteo diventava ancora più forte quando toccava il suolo. Guido Reni ha dipinto i muscoli benissimo!', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
    // Giotto
    { objectId: obj('pinacoteca-001'), text: 'Un grande polittico dipinto da Giotto, il padre della pittura italiana.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-001'), text: 'Giotto rivoluzionò la pittura trecentesca introducendo la prospettiva e la resa realistica delle emozioni. Questo polittico proviene dalla chiesa di Santa Maria degli Angeli di Bologna e mostra la Madonna col Bambino tra angeli e santi.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-001'), text: 'Il Polittico di Giotto è una delle opere più importanti della Pinacoteca Nazionale di Bologna. Realizzato intorno al 1320, proviene probabilmente dalla chiesa bolognese di Santa Maria degli Angeli. La Madonna in trono col Bambino, affiancata da angeli e santi, mostra la rivoluzione giottesca: figure solide, volumetriche, con sguardi che comunicano emozioni umane. Giotto rompe con la tradizione bizantina e apre la strada al Rinascimento.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-001'), text: 'Guarda questa mamma con il suo bambino! Sembrano quasi veri, vero? Giotto è stato un pittore bravissimo che ha insegnato a tutti come dipingere le persone vere!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Raffaello
    { objectId: obj('pinacoteca-002'), text: 'L\'Estasi di Santa Cecilia di Raffaello: un capolavoro del Rinascimento.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-002'), text: 'Raffaello dipinse quest\'opera tra il 1516 e il 1517 per la chiesa di San Giovanni in Monte a Bologna. Santa Cecilia ascolta il coro angelico mentre gli strumenti musicali cadono a terra, simbolo del trionfo della musica divina su quella terrena.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-002'), text: 'L\'Estasi di Santa Cecilia è considerata il capolavoro del periodo romano di Raffaello. Commissionata per la cappella Duglioli in San Giovanni in Monte a Bologna, l\'opera raffigura la santa protettrice della musica in estasi, mentre ascolta il canto degli angeli. Gli strumenti musicali spezzati ai suoi piedi simboleggiano il superamento della musica terrena in favore di quella divina. La composizione è bilanciata con perfetta armonia rinascimentale, e le figure dei santi Paolo, Giovanni Evangelista, Agostino e Maddalena incorniciano la scena centrale con dolcezza.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-002'), text: 'Questa signora ascolta una musica bellissima che solo lei può sentire! È Santa Cecilia, la musica degli angeli! Gli strumenti per terra sono quelli degli umani, perché quella celeste è molto più bella!', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
    // Guido Reni
    { objectId: obj('pinacoteca-003'), text: 'Strage degli innocenti di Guido Reni: un dramma biblico dipinto con eleganza classica.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-003'), text: 'Guido Reni dipinse quest\'opera nel 1611. La scena mostra il massacro dei bambini ordinato da Erode. I soldati strappano i piccoli alle madri in una composizione drammatica resa però con la tipica grazia classica di Reni.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-003'), text: 'La Strage degli innocenti di Guido Reni, eseguita nel 1611 per la chiesa di San Domenico a Bologna, è uno dei vertici della pittura barocca emiliana. Reni rappresenta l\'episodio biblico con straordinaria intensità emotiva, ma filtrata attraverso un ideale di bellezza classica che mitiga l\'orrore. Il dinamismo delle figure, il pathos delle madri disperate e la compostezza quasi danzata dei soldati creano un equilibrio unico tra dramma e armonia.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-003'), text: 'I soldati cattivi vogliono portare via i bambini! Le mamme sono molto tristi e cercano di proteggerli. Guido Reni era di Bologna, proprio come te!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Parmigianino
    { objectId: obj('pinacoteca-004'), text: 'La Pala di Santa Margherita del Parmigianino: eleganza manierista.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-004'), text: 'Parmigianino dipinse questa pala d\'altare tra il 1529 e il 1530. Santa Margherita emerge dal drago, simbolo del male sconfitto. Le figure sono allungate e raffinate, con colori freddi e luminosi, tipici del Manierismo.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-004'), text: 'La Pala di Santa Margherita fu commissionata al Parmigianino nel 1529 per la chiesa bolognese di Santa Margherita. L\'artista, reduce dal Sacco di Roma, si era rifugiato a Bologna dove sviluppò la sua maniera più matura. Santa Margherita emerge trionfante dal drago sconfitto, con la croce e la palma del martirio. Le figure allungate, i panneggi morbidissimi e la luce argentea sono il manifesto del Manierismo emiliano.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('pinacoteca-004'), text: 'Una principessa coraggiosa ha sconfitto un drago! Lei si chiama Margherita e il drago è il male. Il pittore Parmigianino la dipinse bellissima con colori freddi e lucenti.', duration: '15s', level: 'infantile', author: autore1._id, license: 'free', isPublic: true },
  ])
  console.log('Item creati:', items.length)

  const getItems = (uid, levels) =>
    items.filter(i =>
      i.objectId.toString() === obj(uid).toString() &&
      levels.includes(i.level)
    ).map(i => i._id)

  await Visit.insertMany([
    {
      title: 'La Galleria Estense — Visita completa',
      description: 'Un percorso completo attraverso i capolavori della Galleria Estense di Modena.',
      museumId: 'galleria-estense', author: autore1._id, targetLevel: 'medio',
      estimatedDuration: '90 min', isPublic: true,
      logistics: [
        { text: 'Ingresso da Via Emilia Este 38. Biglietto 10€, ridotto 5€. Guardaroba gratuito.', afterStepIndex: -1 },
        { text: 'Dalla sala 12 scendere le scale verso la sala 5.', afterStepIndex: 1 },
        { text: 'Dalla sala 5 tornare al piano superiore verso la sala 8.', afterStepIndex: 2 },
      ],
      steps: [
        { objectId: obj('estense-001'), items: getItems('estense-001', ['medio']) },
        { objectId: obj('estense-002'), items: getItems('estense-002', ['medio']) },
        { objectId: obj('estense-003'), items: getItems('estense-003', ['medio']) },
        { objectId: obj('estense-004'), items: getItems('estense-004', ['medio']) },
        { objectId: obj('estense-008'), items: getItems('estense-008', ['medio']) },
        { objectId: obj('estense-006'), items: getItems('estense-006', ['medio']) },
        { objectId: obj('estense-007'), items: getItems('estense-007', ['medio']) },
        { objectId: obj('estense-010'), items: getItems('estense-010', ['medio']) },
        { objectId: obj('estense-005'), items: getItems('estense-005', ['medio']) },
        { objectId: obj('estense-011'), items: getItems('estense-011', ['medio']) },
        { objectId: obj('estense-012'), items: getItems('estense-012', ['medio']) },
        { objectId: obj('estense-009'), items: getItems('estense-009', ['medio']) },
      ]
    },
    {
      title: 'Approfondimento per esperti',
      description: 'Percorso per appassionati e storici dell\'arte. Analisi stilistica e contestuale delle opere principali.',
      museumId: 'galleria-estense', author: autore1._id, targetLevel: 'avanzato',
      estimatedDuration: '120 min', isPublic: true,
      logistics: [
        { text: 'Ingresso da Via Emilia Este 38. Si consiglia di acquistare il biglietto online.', afterStepIndex: -1 },
      ],
      steps: [
        { objectId: obj('estense-001'), items: getItems('estense-001', ['avanzato']) },
        { objectId: obj('estense-002'), items: getItems('estense-002', ['avanzato']) },
        { objectId: obj('estense-010'), items: getItems('estense-010', ['avanzato']) },
        { objectId: obj('estense-004'), items: getItems('estense-004', ['avanzato']) },
        { objectId: obj('estense-003'), items: getItems('estense-003', ['avanzato']) },
        { objectId: obj('estense-006'), items: getItems('estense-006', ['avanzato']) },
        { objectId: obj('estense-009'), items: getItems('estense-009', ['avanzato']) },
        { objectId: obj('estense-008'), items: getItems('estense-008', ['avanzato']) },
        { objectId: obj('estense-005'), items: getItems('estense-005', ['avanzato']) },
        { objectId: obj('estense-011'), items: getItems('estense-011', ['avanzato']) },
        { objectId: obj('estense-012'), items: getItems('estense-012', ['avanzato']) },
        { objectId: obj('estense-007'), items: getItems('estense-007', ['avanzato']) },
      ]
    },
    {
      title: 'La Galleria per famiglie',
      description: 'Un percorso pensato per bambini e famiglie. Storie, draghi e cavalieri raccontati con semplicità.',
      museumId: 'galleria-estense', author: autore2._id, targetLevel: 'infantile',
      estimatedDuration: '45 min', isPublic: true,
      logistics: [
        { text: 'Ingresso da Via Emilia Este 38. I bambini sotto i 18 anni entrano gratis!', afterStepIndex: -1 },
        { text: 'Andate verso le scale e scendete al piano di sotto!', afterStepIndex: 1 },
      ],
      steps: [
        { objectId: obj('estense-001'), items: getItems('estense-001', ['infantile']) },
        { objectId: obj('estense-002'), items: getItems('estense-002', ['infantile']) },
        { objectId: obj('estense-003'), items: getItems('estense-003', ['infantile']) },
        { objectId: obj('estense-004'), items: getItems('estense-004', ['infantile']) },
        { objectId: obj('estense-008'), items: getItems('estense-008', ['infantile']) },
        { objectId: obj('estense-005'), items: getItems('estense-005', ['semplice']) },
        { objectId: obj('estense-006'), items: getItems('estense-006', ['semplice']) },
        { objectId: obj('estense-007'), items: getItems('estense-007', ['semplice']) },
        { objectId: obj('estense-009'), items: getItems('estense-009', ['semplice']) },
        { objectId: obj('estense-010'), items: getItems('estense-010', ['semplice']) },
        { objectId: obj('estense-012'), items: getItems('estense-012', ['semplice']) },
      ]
    },
    {
      title: 'Primo approccio alla Galleria',
      description: 'Percorso introduttivo per chi visita la Galleria Estense per la prima volta. Testi brevi e chiari sulle opere principali.',
      museumId: 'galleria-estense',
      author: autore2._id,
      targetLevel: 'semplice',
      estimatedDuration: '60 min',
      isPublic: true,
      logistics: [
        { text: 'Ingresso da Via Emilia Este 38. Biglietto 10€, ridotto 5€.', afterStepIndex: -1 },
        { text: 'Proseguire verso la sala 5 al piano inferiore.', afterStepIndex: 1 },
      ],
      steps: [
        { objectId: obj('estense-001'), items: getItems('estense-001', ['semplice']) },
        { objectId: obj('estense-002'), items: getItems('estense-002', ['semplice']) },
        { objectId: obj('estense-003'), items: getItems('estense-003', ['semplice']) },
        { objectId: obj('estense-004'), items: getItems('estense-004', ['semplice']) },
        { objectId: obj('estense-008'), items: getItems('estense-008', ['semplice']) },
        { objectId: obj('estense-006'), items: getItems('estense-006', ['semplice']) },
        { objectId: obj('estense-007'), items: getItems('estense-007', ['semplice']) },
        { objectId: obj('estense-010'), items: getItems('estense-010', ['semplice']) },
        { objectId: obj('estense-005'), items: getItems('estense-005', ['semplice']) },
        { objectId: obj('estense-011'), items: getItems('estense-011', ['semplice']) },
        { objectId: obj('estense-012'), items: getItems('estense-012', ['semplice']) },
        { objectId: obj('estense-009'), items: getItems('estense-009', ['semplice']) },
      ]
    },
    
  ])
  await Visit.insertMany([
    {
      title: 'Pinacoteca Nazionale — Visita introduttiva',
      description: 'Un percorso attraverso i capolavori della Pinacoteca Nazionale di Bologna, dal Trecento al Seicento.',
      museumId: 'pinacoteca-nazionale', author: autore1._id, targetLevel: 'semplice',
      estimatedDuration: '60 min', isPublic: true,
      logistics: [
        { text: 'Ingresso da Via delle Belle Arti 56. Biglietto 10€, ridotto 5€ (18-25 anni).', afterStepIndex: -1 },
        { text: 'Proseguire verso le sale del Trecento per ammirare il Polittico di Giotto.', afterStepIndex: 0 },
        { text: 'Continuare verso le sale del Rinascimento e del Manierismo.', afterStepIndex: 1 },
        { text: 'Concludere con la grande sala barocca della Strage degli innocenti.', afterStepIndex: 2 },
      ],
      steps: [
        { objectId: obj('pinacoteca-001'), items: getItems('pinacoteca-001', ['semplice']) },
        { objectId: obj('pinacoteca-004'), items: getItems('pinacoteca-004', ['semplice']) },
        { objectId: obj('pinacoteca-002'), items: getItems('pinacoteca-002', ['semplice']) },
        { objectId: obj('pinacoteca-003'), items: getItems('pinacoteca-003', ['semplice']) },
      ]
    },
  ])
  console.log('Visite create: 4')
  console.log('✅ Seed completato!')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})