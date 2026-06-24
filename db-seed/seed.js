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
    { universalId: 'estense-001', title: 'Ritratto di Francesco I d\'Este', artist: 'Diego Velázquez', year: '1638', room: 'Sala 12', position: { x: 120, y: 80 }, museumId: 'galleria-estense' },
    { universalId: 'estense-002', title: 'Busto di Francesco I d\'Este', artist: 'Gian Lorenzo Bernini', year: '1650–1651', room: 'Sala 12', position: { x: 200, y: 80 }, museumId: 'galleria-estense' },
    { universalId: 'estense-003', title: 'San Giorgio e il drago', artist: 'Cosmè Tura', year: '1469 ca.', room: 'Sala 5', position: { x: 80, y: 160 }, museumId: 'galleria-estense' },
    { universalId: 'estense-004', title: 'Madonna della Rosa', artist: 'Parmigianino', year: '1530 ca.', room: 'Sala 8', position: { x: 160, y: 160 }, museumId: 'galleria-estense' },
    { universalId: 'estense-005', title: 'Compianto sul Cristo morto', artist: 'Guercino', year: '1617', room: 'Sala 15', position: { x: 240, y: 160 }, museumId: 'galleria-estense' },
    { universalId: 'estense-006', title: 'Giove e Semele', artist: 'Dosso Dossi', year: '1520 ca.', room: 'Sala 7', position: { x: 80, y: 240 }, museumId: 'galleria-estense' },
    { universalId: 'estense-007', title: 'Ritratto di giovane', artist: 'Jacopo Tintoretto', year: '1550 ca.', room: 'Sala 10', position: { x: 160, y: 240 }, museumId: 'galleria-estense' },
    { universalId: 'estense-008', title: 'Sacra Famiglia con san Giovannino', artist: 'Correggio', year: '1520 ca.', room: 'Sala 6', position: { x: 240, y: 240 }, museumId: 'galleria-estense' },
    { universalId: 'estense-009', title: 'Transito della Vergine', artist: 'Nicolò dell\'Abate', year: '1540 ca.', room: 'Sala 4', position: { x: 80, y: 320 }, museumId: 'galleria-estense' },
    { universalId: 'estense-010', title: 'Ritratto di Giulio Clovio', artist: 'El Greco', year: '1571 ca.', room: 'Sala 11', position: { x: 160, y: 320 }, museumId: 'galleria-estense' },
    { universalId: 'estense-011', title: 'Madonna con Bambino e santi', artist: 'Ludovico Carracci', year: '1590 ca.', room: 'Sala 14', position: { x: 240, y: 320 }, museumId: 'galleria-estense' },
    { universalId: 'estense-012', title: 'Ercole e Anteo', artist: 'Guido Reni', year: '1620 ca.', room: 'Sala 16', position: { x: 80, y: 400 }, museumId: 'galleria-estense' },
  ])
  console.log('Opere create:', objects.length)

  const obj = (uid) => objects.find(o => o.universalId === uid)._id

  const items = await Item.insertMany([
    // Velázquez
    { objectId: obj('estense-001'), text: 'Un famoso ritratto dipinto da un grande pittore spagnolo.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Velázquez dipinse questo ritratto di Francesco I d\'Este nel 1638, senza mai incontrare il duca di persona. Si basò su una miniatura inviata da Modena. È uno dei pochi ritratti che il maestro spagnolo dedicò a un sovrano straniero.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Capolavoro della ritrattistica seicentesca, il ritratto di Francesco I d\'Este fu eseguito da Velázquez nel 1638, probabilmente su commissione dello stesso duca attraverso l\'ambasciatore estense a Madrid. Straordinariamente, Velázquez non incontrò mai il soggetto: si servì di una miniatura di Sustermans. La resa psicologica del personaggio, l\'uso della luce sui tessuti e l\'abbandono delle convenzioni manieristiche rivelano la piena maturità del pittore sivigliano.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-001'), text: 'Guarda questo signore elegante! Lo ha dipinto un pittore molto bravo che viveva in Spagna. Si chiama Francesco e governava Modena, la città dove sei adesso!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Bernini
    { objectId: obj('estense-002'), text: 'Un busto in marmo scolpito da Bernini, il più grande scultore del Seicento.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Bernini scolpì questo busto tra il 1650 e il 1651, lavorando su ritratti e calchi inviati da Modena. Il risultato è una delle sculture barocche più vivaci e psicologicamente intense mai realizzate.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Commissionato da Francesco I d\'Este a Gian Lorenzo Bernini tra il 1650 e il 1651, questo busto rappresenta uno dei vertici della ritrattistica scultorea barocca. Bernini non incontrò mai il soggetto e lavorò a partire da tre dipinti inviati da Modena. Il dinamismo del busto — la testa ruotata, il panneggio mosso, lo sguardo vivace — anticipa le soluzioni che Bernini svilupperà nel Baldacchino e nella Cattedra di San Pietro.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-002'), text: 'Tocca con gli occhi questo marmo! Sembra quasi morbido, vero? Lo ha scolpito Bernini, un artista bravissimo a lavorare la pietra. Ha fatto sembrare la giacca di seta e i capelli veri veri!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
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
    // Guercino
    { objectId: obj('estense-005'), text: 'Il Compianto sul Cristo morto del Guercino: dolore e luce drammatica.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-005'), text: 'Il Guercino dipinse questo Compianto nel 1617, quando aveva solo vent\'anni. La scena mostra la Madonna e san Giovanni che piangono sul corpo di Cristo. Il forte contrasto tra ombre scure e zone illuminate è già maturo.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-005'), text: 'Giovanni Francesco Barbieri detto il Guercino realizzò quest\'opera giovanile nel 1617, rivelando già una padronanza del chiaroscuro di ascendenza caravaggesca. La composizione è piramidale, con il corpo di Cristo al centro, sorretto da angeli e compianto dalla Vergine e da san Giovanni.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    // Dosso Dossi
    { objectId: obj('estense-006'), text: 'Dosso Dossi dipinse divinità mitologiche con colori vivaci e fantastici.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-006'), text: 'Dosso Dossi era il pittore preferito della corte estense di Ferrara. Questo dipinto raffigura Giove e Semele, tratto dalle Metamorfosi di Ovidio. I colori sono intensi e la composizione movimentata.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-006'), text: 'Dosso Dossi fu il pittore di corte degli Este a Ferrara. Il soggetto, tratto dalle Metamorfosi di Ovidio, racconta come Semele, amante di Giove, chiese di vedere il dio nella sua forma reale e ne fu fulminata. Ariosto, che frequentava la stessa corte, lo celebrò nell\'Orlando Furioso.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // Tintoretto
    { objectId: obj('estense-007'), text: 'Un ritratto veneziano di Tintoretto: potente e psicologico.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-007'), text: 'Tintoretto è uno dei grandi pittori veneziani del Cinquecento. Questo ritratto è caratterizzato da una pennellata veloce e dalla tipica luce che emerge dallo sfondo scuro. Il soggetto ci guarda con intensità.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-007'), text: 'Jacopo Robusti detto il Tintoretto è tra i massimi esponenti del tardo Rinascimento veneziano. I suoi ritratti si distinguono per la pennellata rapida e nervosa, lo sfondo scuro da cui emerge il soggetto grazie a una luce radente, e la profondità psicologica del personaggio.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    // Correggio
    { objectId: obj('estense-008'), text: 'Correggio dipinse Madonne dolcissime, con luci morbide e calde.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Antonio Allegri detto il Correggio rivoluzionò la pittura emiliana con il suo stile morbido e sentimentale. Il piccolo Gesù gioca con Giovannino in una scena tenera e familiare, avvolta da una luce dorata.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Antonio Allegri da Correggio sviluppò uno stile originalissimo che anticipa il Barocco. La morbidezza dello sfumato, derivato da Leonardo, si combina con una luminosità calda e dorata. Le espressioni dei personaggi sacri sono affettuose e quotidiane. Questo umanesimo emotivo influenzò enormemente la pittura barocca emiliana, da Guercino ai Carracci.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-008'), text: 'Guarda questa famiglia felice! C\'è la mamma, il papà, e due bambini che giocano insieme. Il pittore si chiamava Correggio. Ha usato colori molto caldi, come la luce del sole al tramonto!', duration: '15s', level: 'infantile', author: autore2._id, license: 'free', isPublic: true },
    // Nicolò dell'Abate
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate: colori vivaci e storie religiose eleganti.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate nacque proprio a Modena ed è uno degli artisti più importanti del Rinascimento emiliano. I colori sono brillanti, i gesti teatrali, i panneggi elaborati: uno stile elegante che piaceva alle corti.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-009'), text: 'Nicolò dell\'Abate è il grande protagonista del Rinascimento modenese prima di trasferirsi in Francia, dove diventerà uno dei fondatori della Scuola di Fontainebleau. Il suo stile fonde la lezione parmigianinesca con una narratività vivace e una tendenza al decorativo.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // El Greco
    { objectId: obj('estense-010'), text: 'El Greco: un pittore greco che lavorò in Spagna con uno stile unico.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-010'), text: 'El Greco era originario di Creta e si formò a Venezia prima di stabilirsi a Toledo. Questo ritratto raffigura Giulio Clovio, miniaturista che El Greco conobbe a Roma. Lo stile è già inconfondibile: colori freddi e figure intense.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-010'), text: 'Doménikos Theotokópoulos detto El Greco realizzò questo ritratto di Giulio Clovio probabilmente intorno al 1571, durante il soggiorno romano. È uno dei rarissimi ritratti del periodo italiano di El Greco, e mostra già la palette fredda e argentea e la tensione psicologica del suo stile maturo.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
    // Ludovico Carracci
    { objectId: obj('estense-011'), text: 'Ludovico Carracci: fondatore dell\'Accademia bolognese degli Incamminati.', duration: '3s', level: 'semplice', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-011'), text: 'Ludovico Carracci, insieme ai cugini Annibale e Agostino, fondò a Bologna l\'Accademia degli Incamminati, che rivoluzionò la pittura italiana di fine Cinquecento reagendo contro i manierismi artificiali.', duration: '15s', level: 'medio', author: autore2._id, license: 'free', isPublic: true },
    { objectId: obj('estense-011'), text: 'Ludovico Carracci è la figura centrale della riforma pittorica bolognese di fine Cinquecento. L\'Accademia degli Incamminati teorizzava un ritorno allo studio dal naturale e ai grandi modelli del Rinascimento contro l\'artificiosità del manierismo tardo. L\'influenza dei Carracci fu immensa: da Guercino a Domenichino a Reni, tutta la pittura bolognese del Seicento si sviluppò nel solco di questa riforma.', duration: '1min', level: 'avanzato', author: autore1._id, license: 'free', isPublic: true },
    // Guido Reni
    { objectId: obj('estense-012'), text: 'Guido Reni dipinse eroi mitologici con eleganza e grazia classica.', duration: '3s', level: 'semplice', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-012'), text: 'Guido Reni è uno dei grandi pittori bolognesi del Seicento. Questa scena mostra Ercole che solleva Anteo da terra, privandolo della forza che traeva dal contatto con la madre Terra. Lo stile è classico e armonioso.', duration: '15s', level: 'medio', author: autore1._id, license: 'free', isPublic: true },
    { objectId: obj('estense-012'), text: 'Guido Reni fu l\'artista più celebrato e meglio pagato del suo tempo. La lotta tra Ercole e Anteo è un soggetto mitologico tratto dalle Metamorfosi: Anteo, figlio di Gaia, recuperava le forze toccando la terra, e Ercole lo sconfisse sollevandolo in aria. La composizione di Reni è torsionale e scultorea, con evidente debito verso l\'antico.', duration: '1min', level: 'avanzato', author: autore2._id, license: 'free', isPublic: true },
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
    }
  ])
  console.log('Visite create: 3')
  console.log('✅ Seed completato!')
  await mongoose.disconnect()
}

seed().catch(err => {
  console.error(err)
  process.exit(1)
})