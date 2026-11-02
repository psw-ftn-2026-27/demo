# Explorer

Explorer je nastavni projekat: platforma za istraživanje turističkih sadržaja koju jedan tim studenata razvija kao modularni monolit (ASP.NET Core, Angular, PostgreSQL). Pre prvog rada pratite protokol [Podešavanje radne stanice](docs/protocols/podesavanje-radne-stanice.md). Gradivo koje pokriva predmet i koje razvijamo kroz rad na projektu je u [bazi znanja](docs/knowledge-base).

## Moduli

Platforma ima četiri funkcionalna modula. `Exploration` i `Games` su osnovni moduli, jer nude iskustva zbog kojih korisnici dolaze na platformu. `Social` i `Payment` su pomoćni moduli, koji ta iskustva šire i naplaćuju. Svaki zahtev treba da služi cilju svog modula, pa ciljeve opisane u nastavku koristite kao oslonac kada razmatrate zahteve.

### Exploration

Exploration pretvara kretanje kroz prostor u otkrivanje. Korisnik ne obilazi samo lokacije, već ih otkriva, a svako mesto do kog stigne otvara deo priče koji tom mestu daje smisao. Prvi oblik takvog iskustva je tura: niz ključnih tačaka koji je osmislio autor, gde svaka tačka spaja lokaciju sa delom priče. Modul ipak nije određen turom, već spojem mesta i priče, pa mu se vremenom mogu pridružiti i drugi oblici istraživanja. Iskustvo koje modul nudi počiva na prisutnosti, divljenju i doživljaju uzvišenog, odnosno na pažnji nekoga ko želi da razume gde se nalazi. Korisnik dobija bogatiji doživljaj grada, staze ili predela nego što mu pružaju mapa ili turistički vodič. Autor dobija sredstvo da takva iskustva osmisli i objavi. Platforma dobija svoj glavni proizvod, sadržaj zbog kog korisnici dolaze i za koji plaćaju.

### Games

Ako Exploration istraživanje pretvara u priču, Games ga pretvara u igru. I ovaj modul se odvija u prostoru, ali dok Exploration traži pažnju, Games poziva na akciju kroz izazove, susrete i ciljeve. Primeri su kviz na koji se odgovara kod znamenitosti ili skrivena lokacija koja se pronalazi na osnovu tragova. Iskustvo počiva na zabavi, interakciji, nadmetanju i zadovoljstvu rešenog izazova. Dva osnovna modula se namerno preklapaju, jer oba opisuju boravak u prostoru. Razlika među njima je u naglasku: Exploration teži smislu i pripovedanju, a Games igri i izazovu. Korisnik dobija razlog da izađe napolje i da se vraća. Autori dobijaju još jednu vrstu sadržaja koju mogu da osmisle. Platforma dobija drugu liniju proizvoda i sadržaj koji se igra iznova, pa korisnici ostaju aktivni i između tura.

### Social

Social postoji zbog mrežnog efekta: što više ljudi učestvuje, platforma vredi više svakom od njih. Modul gradi angažovanost kroz odnose među ljudima, kao što su blogovi, klubovi, gilde i rang-liste. Podržava dve vrste odnosa. Prvi je odnos autora i ljudi koji kupuju i prate njegov rad. Drugi je odnos među korisnicima koji prolaze iste avanture, pa razmenjuju utiske, nadmeću se ili se udružuju. Social sam ne stvara iskustva, već ih pojačava. Korisnik dobija zajednicu, priznanje i društvo. Autor dobija publiku i povratnu informaciju. Platforma dobija korisnike koji ostaju, preporuke od usta do usta i lakše otkrivanje sadržaja.

### Payment

Payment pretvara sadržaj platforme u prihod, pre svega sadržaj osnovnih modula. Nudi uobičajene funkcionalnosti kupovine: katalog, korpu i plaćanje, istoriju kupovina, pakete, akcije i popuste, a kasnije možda i pretplate. Prodavcu pruža analitiku o tome šta se prodaje i koliko donosi, a kupcu pregled onoga što poseduje i koliko je potrošio. Modul prodaje proizvode kao apstrakciju, pa može da proda turu, igru ili paket koji sadrži oba, a da ne poznaje njihovu unutrašnju strukturu. Modul kome proizvod pripada pita Payment da li je proizvod kupljen. Kupovina je dobro poznat problem, pa je ovde cilj uobičajen i pouzdan dizajn, a ne novina. Platforma ostvaruje prihod, a autori zarađuju, čime se finansira nov sadržaj. Korisnik dobija poznat način kupovine kome može da veruje.

## Veštine za rad sa agentom

Projekat razvijate uz agenta Claude Code i uz pomoć veština koje smo definisali. Veštine u isto vreme razvijaju funkcionalnosti i vas podučavaju, gde je naš glavni cilj da razvijemo vaše sposobnosti.

Jedan student vodi jednu funkcionalnost od zahteva do pull request-a, ovim redom:

| Veština | Šta joj dajete | Šta je rezultat |
|---|---|---|
| `/psw-zahtevi` | Tekst zahteva | Po jednu specifikaciju za svaku funkcionalnost, sa namerom, ponašanjem i pravilima |
| `/psw-dizajn` | Jednu specifikaciju | Istu specifikaciju dopunjenu dizajnom: korisničko iskustvo, domenski model, tok poruka i dizajn testova |
| `/psw-implementacija` | Specifikaciju sa odobrenim dizajnom | Kod na novoj grani, lokalni commit i siže koji će vam pomoći da formirate opis pull request-a |

Tokom implementacije agent piše kod u pozadini, a vi predviđate kako će taj kod izgledati i zatim predviđanje poredite sa napisanim kodom. Slanje grane i otvaranje pull request-a ostaju vaš posao, po protokolu [Rad sa granama i pull request-ovima](docs/protocols/rad-sa-granama.md).

Ostale veštine pozivate po potrebi:

| Veština | Kada je pozivate |
|---|---|
| `/psw-pitaj` | Kada vam deo koda nije jasan. Agent objašnjava šta kod radi i zašto je tako napisan, pojmovima iz baze znanja. |
| `/psw-ucenje` | Kada se spremate za proveru znanja na vežbama i usmeni ispit na kraju. Agent postavlja pitanja o kodu koji ste sami napisali. Uz poziv možete navesti deo gradiva, na primer `/psw-ucenje klijent` koje želite posebno da obradite. |
| `/psw-izvoz-razgovora` | Ako učestvujete u istraživanju (pratite obaveštenje na Canvasu). Veština pakuje vaše razgovore sa agentom u jednu arhivu. |

Objašnjenje agenta koje izlazi iz okvira baze znanja počinje oznakom `Van baze znanja:`.
