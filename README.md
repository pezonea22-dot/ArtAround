# ArtAround

Applicazione web per visite museali personalizzate, sviluppata come progetto universitario per la Galleria Estense di Modena. Il sistema adatta i contenuti all'utente su quattro dimensioni: livello di competenza, interessi, tempo disponibile ed età.

---

## 1. Livello realizzato

**Base** completo, con le seguenti funzionalità:

- Navigator smartphone con sintesi vocale e comandi vocali su vocabolario controllato
- Marketplace con sfoglio e selezione visite
- Editor visite con gestione sequenza opere e item multipli per livello
- Creazione e pubblicazione item con licenza e prezzo
- Adozione item di altri autori
- Seed automatico del database al primo avvio
- Avvio completo con `docker compose up`

---

## 2. Stack tecnologico

| Componente | Stack |
|---|---|
| **Back-office** | Node.js 20, Express 4, Mongoose 8, MongoDB 8, JWT |
| **Navigator** | React 19, Vite 6, React Router 7, Axios, Web Speech API |
| **Marketplace/Editor** | Vanilla JavaScript (no framework), HTML5, CSS3 |
| **Database** | MongoDB 8 (Docker) |
| **Framework grafico** | Cormorant Garant + Inter (Google Fonts), CSS custom properties |
| **Infrastruttura** | Docker, Docker Compose |

---

## 3. Istruzioni di avvio

### Prerequisiti

- Docker Desktop installato e in esecuzione
- Porte 3001, 3002, 5173 e 27017 libere

### Avvio

```bash
git clone https://github.com/pezonea22-dot/ArtAround.git
cd artaround
docker compose up --build
```

Il primo avvio richiede qualche minuto per il build delle immagini. Il seed del database viene eseguito automaticamente al primo avvio se il database è vuoto.

### URL di accesso

| Servizio | URL |
|---|---|
| Navigator (smartphone) | http://localhost:5173 |
| Marketplace/Editor (PC) | http://localhost:3002/login.html |
| Back-office API | http://localhost:3001 |

### Arresto

```bash
docker compose down
```

Per eliminare anche i dati del database:

```bash
docker compose down -v
```

---

## 4. Credenziali e dati di test

### Account

| Username | Password | Ruolo |
|---|---|---|
| autore1 | 12345678 | Autore |
| autore2 | 12345678 | Autore |
| visitatore1 | 12345678 | Visitatore |
| visitatore2 | 12345678 | Visitatore |

### Dati precaricati

- **Museo:** Galleria Estense, Modena
- **Opere:** 12 opere con identificatori universali (estense-001 … estense-012)
- **Item:** 51 testi su 4 livelli (infantile, semplice, medio, avanzato) e 4 durate (3s, 15s, 1min, 4min)
- **Visite:** 4 percorsi differenziati per livello e pubblico target

| Titolo | Livello | Durata |
|---|---|---|
| La Galleria Estense — Visita completa | Appassionato | 90 min |
| Approfondimento per esperti | Esperto | 120 min |
| La Galleria per famiglie | Bambini | 45 min |
| Primo approccio alla Galleria | Curioso | 60 min |

---

## 5. Organizzazione dei sorgenti

```
artaround/
├── docker-compose.yml          # Avvia tutti i servizi
├── config/
│   └── museum.json             # Configurazione museo (nome, colori, luoghi)
├── db-seed/
│   ├── seed.js                 # Script seed eseguibile manualmente
│   └── seed-fn.js              # Funzione seed usata dall'avvio automatico
├── backoffice/                 # Node.js + Express + MongoDB
│   ├── Dockerfile
│   └── src/
│       ├── index.js            # Entry point + seed automatico al primo avvio
│       ├── models/             # Schemi Mongoose
│       │   ├── User.js
│       │   ├── MuseumObject.js
│       │   ├── Item.js
│       │   └── Visit.js        # Include steps con item obbligatori e opzionali
│       ├── routes/             # Route Express
│       │   ├── auth.js         # Login e registrazione
│       │   ├── objects.js      # CRUD opere
│       │   ├── items.js        # CRUD item + /mine
│       │   ├── visits.js       # CRUD visite + /mine
│       │   └── marketplace.js  # Sfoglio pubblico + adozione item
│       └── middleware/
│           └── auth.js         # Verifica JWT
├── navigator/                  # React + Vite (client smartphone)
│   ├── Dockerfile
│   └── src/
│       ├── pages/
│       │   ├── OnboardingPage.jsx   # Raccolta profilo utente
│       │   ├── VisitsPage.jsx       # Selezione visita con filtri
│       │   └── VisitPage.jsx        # Navigazione visita con TTS e comandi vocali
│       ├── context/
│       │   └── UserContext.jsx      # Profilo utente e autenticazione
│       └── api/
│           ├── client.js            # Client HTTP con JWT
│           └── museum.js            # Lettura config museo
└── marketplace-editor/         # Vanilla JS (client PC)
    ├── Dockerfile
    ├── index.html              # Marketplace — sfoglio visite
    ├── login.html              # Login
    ├── editor.html             # Le mie visite
    ├── items.html              # I miei item
    ├── visit-detail.html       # Dettaglio visita con opere e testi
    ├── visit-editor.html       # Editor sequenza opere di una visita
    └── src/
        ├── api/
        │   ├── client.js       # Client HTTP vanilla
        │   └── auth.js         # Login, logout, getUser
        ├── components/
        │   └── nav.js          # Navbar comune
        ├── pages/
        │   ├── login.js
        │   ├── editor.js       # Gestione visite dell'autore
        │   ├── items.js        # Gestione item dell'autore
        │   ├── visit-detail.js # Sfoglio dettaglio visita
        │   └── visit-editor.js # Editor sequenza e item per visita
        └── styles.css          # Design system (CSS custom properties)
```

## 6. Organizzazione logica e feature principali

### Modello dati Visit/Item

Il modello centrale ruota attorno a due entità:

**Item** — un singolo testo descrittivo associato a un'opera. Ogni item ha livello linguistico (infantile/semplice/medio/avanzato), durata stimata di lettura (3s/15s/1min/4min), autore, licenza e prezzo. Per ogni opera possono esistere decine di item diversi creati da autori diversi.

**Visit** — sequenza ordinata di steps. Ogni step associa un'opera (MuseumObject) a due liste di item:
- **Item obbligatori** — testi sempre presentati durante la visita
- **Item opzionali** — testi aggiuntivi disponibili se rimane tempo o per domande impreviste del visitatore

Ogni visita include anche indicazioni logistiche (oggetti `logistics`) inserite tra una tappa e l'altra per guidare il visitatore fisicamente negli spazi del museo.

### Navigator

Il Navigator è ottimizzato per l'uso in presenza, con il visitatore che cammina tra le sale con gli auricolari. Funzionalità principali:

- **Onboarding** — raccolta di livello di competenza e tempo disponibile
- **Selezione visita** — filtro automatico per livello e durata
- **Adattamento dinamico** — selezione automatica dell'item più adatto al profilo utente; cambio livello in tempo reale con i bottoni semplice/medio/avanzato/infantile
- **Sintesi vocale** — Web Speech API TTS per la lettura del testo corrente
- **Comandi vocali** — SpeechRecognition API su vocabolario controllato (prossimo, precedente, dimmi di più, non capisco, chi è l'autore, dov'è l'uscita, ecc.)
- **Mappa 2D** — SVG con posizioni delle opere e navigazione diretta
- **Indicazioni logistiche** — overlay tra una tappa e l'altra con direzioni per raggiungere l'opera successiva
- **Luoghi utili** — uscita, toilette, bar, shop, accessibilità letti da museum.json
- **Config museo** — tutte le informazioni specifiche del museo vengono lette da `config/museum.json`; cambiando solo quel file l'app diventa un navigator per un museo diverso

### Marketplace/Editor

Pensato per autori e curatori su PC:

- **Marketplace** — sfoglio visite con filtri per livello e durata; dettaglio visita con tutte le opere e i testi associati
- **Editor visite** — creazione/modifica visita, gestione sequenza opere con riordino ↑↓, aggiunta/rimozione item obbligatori e opzionali per ogni tappa
- **Editor item** — creazione testi con metadati completi (livello, durata, licenza, prezzo, visibilità)
- **Adozione** — gli autori possono adottare item di altri autori copiandoli nella propria collezione
- **Paginazione** — lista item paginata per gestire grandi quantità di contenuti
- **Selezione museo** — pannello di scelta multipla per selezionare il museo attivo; supporto per musei futuri (Pinacoteca Nazionale Bologna, MAMbo) già predisposto nell'interfaccia

---

## 7. Scelte di design

**Generalità** — il sistema è progettato per qualsiasi museo: il `museumId` identifica il museo nei dati, `config/museum.json` configura l'interfaccia. Cambiando solo questi due elementi l'app funziona per un museo diverso senza modifiche al codice.

**Flessibilità** — il modello Item è indipendente dalla Visit: gli stessi item possono essere riusati in visite diverse. Il sistema di livelli (infantile/semplice/medio/avanzato) e durate (3s/15s/1min/4min) permette di coprire qualsiasi tipo di pubblico con gli stessi contenuti presentati diversamente.

**Usabilità** — il Navigator è ottimizzato per smartphone con bottoni grandi, navigazione bottom-fixed e feedback immediato sia visivo che audio. Il Marketplace è ottimizzato per desktop con layout a due colonne e filtri sempre visibili.

**Grafica** — palette ispirata all'estetica museale (oro antico #C8A96E, sfondo caldo #0E0C0A), tipografia Cormorant Garant per i titoli delle opere (richiama le didascalie museali), Inter per l'interfaccia. Il Navigator usa il trattamento "museum label" con bordo dorato per presentare ogni opera.

---

## 8. API

Tutte le route protette richiedono header `Authorization: Bearer <token>` ottenuto dal login.

### Autenticazione
| Metodo | Endpoint | Descrizione |
|---|---|---|
| POST | /auth/register | Registra nuovo utente |
| POST | /auth/login | Login, ritorna JWT e dati utente |

### Opere
| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | /api/objects?museumId= | Lista opere del museo |
| GET | /api/objects/:id | Dettaglio opera |
| POST | /api/objects | Crea opera (solo autori) |

### Item
| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | /api/items?objectId=&level=&duration=&isPublic= | Lista item con filtri |
| GET | /api/items/mine | I miei item (autenticato) |
| GET | /api/items/:id | Dettaglio item |
| POST | /api/items | Crea item (solo autori) |
| PUT | /api/items/:id | Modifica item (solo autore proprietario) |
| DELETE | /api/items/:id | Elimina item (solo autore proprietario) |

### Visite
| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | /api/visits?museumId=&targetLevel= | Lista visite pubbliche senza steps |
| GET | /api/visits/mine | Le mie visite (autenticato) |
| GET | /api/visits/:id | Dettaglio visita con steps e item espansi |
| POST | /api/visits | Crea visita (solo autori) |
| PUT | /api/visits/:id | Modifica visita (solo autore proprietario) |
| DELETE | /api/visits/:id | Elimina visita (solo autore proprietario) |

### Marketplace
| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | /api/marketplace/visits?museumId=&targetLevel= | Visite pubbliche con filtri |
| GET | /api/marketplace/items?level=&duration=&search= | Item pubblici con filtri e ricerca |
| POST | /api/marketplace/items/:id/adopt | Adotta item altrui (solo autori) |

### Config museo
| Metodo | Endpoint | Descrizione |
|---|---|---|
| GET | /museum-config | Restituisce config/museum.json al client |

## 9. Contributo LLM

Il progetto è stato sviluppato con il supporto di Claude (Anthropic) per:

- Generazione dei testi descrittivi delle opere su 4 livelli linguistici (infantile, semplice, medio, avanzato) per tutte le 12 opere della Galleria Estense
- Supporto alla progettazione dell'architettura del sistema e del modello dati
- Debugging e risoluzione di problemi tecnici durante lo sviluppo

I testi generati sono stati revisionati per accuratezza storica e adattati al contesto museale. Nei metadati di ogni item è presente il campo `author` che identifica l'account autore che ha creato il contenuto.

---

## 10. Limiti noti

- **Seed automatico** — il seed parte solo se il database è vuoto. Se si fa `docker compose down` senza `-v` e si riavvia, i dati precedenti vengono mantenuti senza rieseguire il seed. Per ripartire da zero usare `docker compose down -v`
- **Immagini opere** — il campo `image` è presente negli schemi di Item e MuseumObject ma non è stato implementato un sistema di upload; le immagini di riconoscimento non sono disponibili
- **Posizionamento utente** — la mappa mostra le posizioni delle opere ma non la posizione del visitatore in tempo reale; non è implementata alcuna forma di localizzazione
- **Comandi vocali** — SpeechRecognition API è supportata su Chrome e Edge ma non su Safari e Firefox; su browser non supportati i bottoni a schermo restano comunque funzionanti
- **museumId parzialmente hardcoded** — la stringa `galleria-estense` è presente in alcuni punti del codice del Marketplace oltre che in `museum.json`; per adattare il marketplace a un museo diverso sarebbe necessaria una modifica al codice
- **Pagamento** — il campo `price` è implementato e visibile nell'interfaccia ma non c'è un sistema di pagamento reale; tutti gli item sono accessibili indipendentemente dal prezzo impostato
- **Profilo utente parziale** — l'onboarding raccoglie livello e tempo disponibile ma non interessi specifici né età, che le specifiche indicano come dimensioni di adattamento

## 11. Estensioni future

- **Estensione 1** — sincronizzazione guida/classe in tempo reale con WebSocket (socket.io), controllo remoto della navigazione e quiz finale con punteggio
- **Estensione 2** — QR code per identificazione opere, comandi vocali in linguaggio naturale via LLM, traduzione real-time dei contenuti, creazione automatica di visite su vincoli dell'utente
- Sistema di upload immagini per le opere con visualizzazione nel Navigator
- Localizzazione avanzata con orientamento device per identificazione automatica dell'opera davanti al visitatore
- Dashboard statistiche per gli autori (visualizzazioni, adozioni, vendite)
- Raccolta completa del profilo utente (interessi, età) per adattamento più preciso dei contenuti