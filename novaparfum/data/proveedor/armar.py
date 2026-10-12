import json, re, csv
store=json.load(open('store.json'))
for s in store:
    if s['marca']=='Chloé': s['nombre']='Chloé'; s['conc']='EDP'
    if s['marca']=='Hugo Boss' and s['nombre']=='Femme': s['nombre']='Boss Femme'
# Recomendados nuevos: (cat, gen, marca, nombre, conc, tamaños)
A,D,N='Árabe','Diseñador','Nicho'
NEW=[
(A,'Unisex','Lattafa','Khamrah','EDP',[100]),(A,'Unisex','Lattafa','Khamrah Qahwa','EDP',[100]),(A,'Unisex','Lattafa','Khamrah Dukhan','EDP',[100]),
(A,'Unisex','Lattafa',"Bade'e Al Oud Honor & Glory",'EDP',[100]),(A,'Unisex','Lattafa',"Bade'e Al Oud Sublime",'EDP',[100]),(A,'Unisex','Lattafa',"Bade'e Al Oud Amethyst",'EDP',[100]),
(A,'Unisex','Lattafa','Ana Abiyedh','EDP',[60]),(A,'Unisex','Lattafa','Ana Abiyedh Rouge','EDP',[60]),(A,'Caballero','Lattafa','Fakhar Black','EDP',[100]),
(A,'Dama','Lattafa','Fakhar Rose','EDP',[100]),(A,'Unisex','Lattafa','Qaed Al Fursan','EDP',[90]),(A,'Dama','Lattafa','Mayar','EDP',[100]),
(A,'Dama','Lattafa','Mayar Cherry Intense','EDP',[100]),(A,'Dama','Lattafa','Eclaire','EDP',[100]),(A,'Dama','Lattafa','Haya','EDP',[100]),
(A,'Unisex','Lattafa','Teriaq','EDP',[100]),(A,'Caballero','Lattafa','Hayaati','EDP',[100]),(A,'Unisex','Lattafa','Musamam','EDP',[100]),
(A,'Unisex','Lattafa','Nebras','EDP',[100]),(A,'Unisex','Lattafa','Ajwad','EDP',[60]),(A,'Caballero','Lattafa','Emeer','EDP',[100]),(A,'Unisex','Lattafa','Ramz Silver','EDP',[100]),
(A,'Caballero','Armaf','Club de Nuit Intense Man','EDT',[105]),(A,'Dama','Armaf','Club de Nuit Woman','EDP',[105]),(A,'Unisex','Armaf','Club de Nuit Untold','EDP',[105]),
(A,'Caballero','Armaf','Club de Nuit Iconic','EDP',[105]),(A,'Unisex','Armaf','Club de Nuit Milestone','EDP',[105]),(A,'Unisex','Armaf','Club de Nuit Sillage','EDP',[105]),
(A,'Unisex','Armaf','Odyssey Toffee Coffee','EDP',[100]),
(A,'Dama','Rasasi','Hawas Diva','EDP',[100]),(A,'Dama','Rasasi','Hawas for Her Éclat','EDP',[100]),(A,'Caballero','Rasasi','Hawas Thunder','EDP',[100]),
(A,'A confirmar','Rasasi','Hawas Highness','EDP',[100]),(A,'A confirmar','Rasasi','Hawas London','EDP',[100]),(A,'A confirmar','Rasasi','Hawas Lava Gold','EDP',[100]),
(A,'A confirmar','Rasasi','Hawas Overdose','EDP',[100]),(A,'A confirmar','Rasasi','Hawas Exotic','EDP',[100]),(A,'A confirmar','Rasasi','Hawas Glitz','EDP',[100]),
(A,'Caballero','Afnan','9PM','EDP',[100]),(A,'Caballero','Afnan','9PM Rebel','EDP',[100]),(A,'Unisex','Afnan','9AM Dive','EDP',[100]),
(A,'Caballero','Afnan','Supremacy Silver','EDP',[100]),(A,'Caballero','Afnan','Turathi Blue','EDP',[90]),
(A,'Unisex','Al Haramain','Amber Oud Gold Edition','EDP',[60,120]),(A,'Caballero','Al Haramain',"L'Aventure",'EDP',[100]),
(A,'Caballero','Maison Alhambra','Salvo','EDP',[100]),(A,'Caballero','French Avenue','Liquid Brun','EDP',[100]),(A,'Caballero','Bharara','King','EDP',[100]),
(D,'Caballero','Dior','Sauvage EDT','EDT',[60,100,200]),(D,'Caballero','Dior','Sauvage Parfum','Parfum',[60,100]),(D,'Dama','Dior','Miss Dior Blooming Bouquet','EDT',[30,50,100]),
(D,'Caballero','Chanel','Bleu de Chanel Parfum','Parfum',[50,100]),(D,'Dama','Chanel','Chance Eau Fraîche','EDT',[50,100]),(D,'Caballero','Chanel','Allure Homme Édition Blanche','EDP',[100]),
(D,'Dama','Carolina Herrera','Good Girl Supreme','EDP',[30,50,80]),(D,'Caballero','Carolina Herrera','Bad Boy Elixir','EDP',[50,100]),
(D,'Dama','Paco Rabanne','Fame','EDP',[30,50,80]),(D,'Caballero','Paco Rabanne','Invictus Platinum','EDP',[50,100]),(D,'Caballero','Paco Rabanne','Phantom Elixir','Parfum',[50,100]),
(D,'Dama','Paco Rabanne','Million Gold for Her','EDP',[30,50,90]),(D,'Caballero','Paco Rabanne','Pure XS','EDT',[50,100]),
(D,'Dama','Lancôme',"La Vie Est Belle L'Elixir",'EDP',[30,50,100]),(D,'Dama','Lancôme','La Nuit Trésor','EDP',[30,50,100]),
(D,'Dama','Yves Saint Laurent','Libre Intense','EDP',[30,50,90]),(D,'Dama','Yves Saint Laurent','Libre Le Parfum','Parfum',[30,50,90]),(D,'Caballero','Yves Saint Laurent','MYSLF EDP','EDP',[40,60,100]),
(D,'Caballero','Giorgio Armani','Acqua di Giò Parfum','Parfum',[75,125]),(D,'Caballero','Giorgio Armani','Code Parfum','Parfum',[75,125]),
(D,'Dama','Giorgio Armani','Sì Passione','EDP',[30,50,100]),(D,'Dama','Giorgio Armani',"Because It's You",'EDP',[50,100]),
(D,'Caballero','Versace','Eros Najim','Parfum',[50,100]),(D,'Caballero','Versace','Eros Energy','EDP',[50,100]),
(D,'Dama','Versace','Dylan Turquoise','EDT',[30,50,100]),(D,'Dama','Versace','Dylan Purple','EDP',[30,50,100]),
(D,'Caballero','Jean Paul Gaultier','Le Male Elixir Absolu','Parfum',[75,125]),(D,'Dama','Jean Paul Gaultier','Scandal (mujer)','EDP',[30,50,80]),
(D,'Dama','Jean Paul Gaultier','La Belle Le Parfum','EDP',[30,50,100]),(D,'Dama','Jean Paul Gaultier','Gaultier Divine','EDP',[30,50,100]),
(D,'Dama','Valentino','Donna Born in Roma Intense','EDP',[30,50,100]),
(D,'Caballero','Prada','Luna Rossa Black','EDP',[50,100]),(D,'Caballero','Prada','Luna Rossa Ocean','EDP',[50,100]),
(D,'Caballero','Givenchy','Gentleman Réserve Privée','EDP',[60,100]),(D,'Dama','Dolce & Gabbana','Light Blue Intense (mujer)','EDP',[25,50,100]),
(D,'Caballero','Dolce & Gabbana','K by Dolce & Gabbana','EDP',[50,100]),(D,'Dama','Mugler','Angel Elixir','EDP',[50,100]),(D,'Dama','Mugler','Alien Goddess','EDP',[30,50,90]),
(D,'Caballero','Gucci','Guilty Pour Homme','EDT',[50,90]),(D,'Caballero','Hugo Boss','Boss Bottled Elixir','Parfum',[50,100]),(D,'Caballero','Hugo Boss','Boss The Scent','EDT',[50,100]),
(D,'Caballero','Montblanc','Explorer Ultra Blue','EDP',[60,100]),(D,'Dama','Burberry','Her Elixir','EDP',[30,50,100]),(D,'Caballero','Azzaro','Wanted by Night','EDP',[50,100]),
(D,'Dama','Viktor&Rolf','Good Fortune','EDP',[30,50,90]),(D,'Dama','Ariana Grande','Cloud Pink','EDP',[30,50,100]),(D,'Dama','Ariana Grande','Thank U, Next','EDP',[30,100]),
(D,'Dama','Ariana Grande','Sweet Like Candy','EDP',[30,50,100]),(D,'Dama','Marc Jacobs','Perfect','EDP',[30,50,100]),
(D,'Caballero','Antonio Banderas','Blue Seduction','EDT',[50,100,200]),(D,'Caballero','Antonio Banderas','The Golden Secret','EDT',[50,100,200]),
(D,'Dama','Antonio Banderas','Her Golden Secret','EDT',[50,80]),(D,'Caballero','Antonio Banderas','King of Seduction','EDT',[50,100,200]),
(D,'Caballero','Nautica','Voyage','EDT',[100]),(D,'Caballero','Ralph Lauren','Polo Red','EDT',[75,125]),(D,'Dama','Jimmy Choo','I Want Choo','EDP',[40,60,100]),
(D,'Caballero','Moschino','Toy Boy','EDP',[50,100]),(D,'Dama','Moschino','Toy 2 Bubble Gum','EDT',[30,50,100]),(D,'Caballero','Bvlgari','Aqva Pour Homme','EDT',[50,100]),
(D,'Dama','Issey Miyake',"L'Eau d'Issey (mujer)",'EDT',[50,100]),(D,'Caballero','Kenzo','Kenzo Homme','EDT',[60,110]),(D,'Caballero','Lacoste','L.12.12 Blanc','EDT',[50,100]),
(D,'Dama',"Victoria's Secret",'Bombshell','EDP',[50,100]),(D,'Dama','Sol de Janeiro',"Cheirosa '62 (perfume mist)",'Mist',[90,240]),
(N,'Unisex','Creed','Millésime Impérial','EDP',[50,100]),(N,'Caballero','Creed','Absolu Aventus','EDP',[100]),
(N,'Unisex','Parfums de Marly','Greenley','EDP',[75,125]),(N,'Dama','Parfums de Marly','Valaya','EDP',[75]),(N,'Dama','Parfums de Marly','Delina Exclusif','Parfum',[75]),
(N,'Caballero','Parfums de Marly','Haltane','EDP',[75,125]),(N,'Unisex','Maison Francis Kurkdjian','Gentle Fluidity Gold','EDP',[70]),(N,'Caballero','Maison Francis Kurkdjian','Amyris Homme','EDT',[70]),
(N,'Unisex','Tom Ford','Fucking Fabulous','EDP',[30,50,100]),(N,'Caballero','Tom Ford','Noir Extreme','EDP',[50,100]),(N,'Unisex','Tom Ford','Tuscan Leather','EDP',[30,50,100]),
(N,'Unisex','Tom Ford','Rose Prick','EDP',[30,50,100]),(N,'Unisex','Tom Ford','Neroli Portofino','EDP',[30,50,100]),
(N,'Unisex','Kilian','Black Phantom','EDP',[50]),(N,'Unisex','Kilian','Rolling in Love','EDP',[50]),(N,'Unisex','Initio Parfums Privés','Musk Therapy','EDP',[90]),
(N,'Unisex','Xerjoff','Erba Gold','EDP',[50,100]),(N,'Unisex','Xerjoff','More Than Words','EDP',[100]),(N,'Dama','Byredo','Blanche','EDP',[50,100]),
(N,'Unisex','Le Labo','Rose 31','EDP',[50,100]),(N,'Unisex','Nishane','Wulong Cha','Extrait',[50,100]),(N,'Unisex','Maison Margiela','Replica Lazy Sunday Morning','EDT',[30,100]),
(N,'Dama','Kayali','Vanilla 28','EDP',[50,100]),(N,'Dama','Kayali','Yum Pistachio Gelato 33','EDP',[50,100]),
(N,'Unisex','Jo Malone','Wood Sage & Sea Salt','Cologne',[30,100]),(N,'Dama','Jo Malone','English Pear & Freesia','Cologne',[30,100]),
(N,'Unisex','Escentric Molecules','Molecule 01','EDT',[30,100]),(N,'Caballero','Louis Vuitton',"L'Immensité",'EDP',[100,200]),
(N,'Dama','Mancera','Roses Vanille','EDP',[120]),(N,'Dama','Montale','Roses Musk','EDP',[100]),
]
def std_sizes(s):
    n=(s['marca']+' '+s['nombre']).lower(); c=s['cat']; g=s['gen']
    R=[('armaf',[100]),('rasasi',[100]),('lattafa',[100]),('a confirmar',[100]),('amber oud',[125,200]),
       ('creed',[50,100]),('parfums de marly',[75,125]),('kurkdjian',[70]),('baccarat rouge 540 edp',[70,200]),
       ('tom ford black orchid',[50,100]),('ombré leather',[50,100]),('tom ford',[30,50,100]),('le labo',[50,100]),('byredo',[50,100]),('xerjoff',[50,100]),
       ('initio',[90]),('kilian',[50]),('amouage',[100]),('nishane',[50,100]),('louis vuitton',[100,200]),('mancera',[120]),('montale',[100]),('replica',[30,100]),
       ('n°5',[35,50,100]),('coco mademoiselle',[35,50,100]),('chance',[50,100]),('bleu de chanel',[50,100,150]),('allure homme',[100,150]),
       ('sauvage edp',[60,100,200]),('sauvage elixir',[60,100]),("j'adore",[30,50,100]),('miss dior',[30,50,100]),('hypnotic',[30,50,100]),('homme intense',[100]),('fahrenheit',[100,200]),
       ('good girl',[30,50,80]),('la bomba',[50,80]),('212 vip rose',[50,80]),('212 vip black elixir',[50,100,200]),('212 vip',[50,100]),('212 men',[100,200]),('212 sexy',[100]),('212 nyc',[100]),
       ('bad boy cobalt',[50,100]),('bad boy le parfum',[50,100]),('bad boy',[50,100,150]),
       ('1 million black',[50,100]),('1 million elixir',[50,100]),('golden oud',[50,100]),('1 million',[50,100,200]),('invictus aqua',[100]),('invictus victory',[50,100]),('invictus',[50,100,200]),
       ('phantom parfum',[50,100]),('phantom',[50,100,150]),('lady million',[30,50,80]),('million red',[50,90]),('olympéa',[30,50,80]),('black xs for her',[50,80]),('black xs',[50,100]),('pour homme paco',[100,200]),
       ('la vie est belle',[30,50,100]),('idôle',[25,50,100]),('trésor',[30,50,100]),
       ('libre',[30,50,90]),('black opium',[30,50,90]),('mon paris',[30,50,90]),('y edp',[60,100]),('y le parfum',[60,100]),('nuit de l',[60,100]),('myslf',[40,60,100]),
       ('profondo',[75,125]),('profumo',[75,125]),('acqua di giò (hombre)',[50,100,200]),('stronger',[50,100]),('armani code (hombre)',[75,125]),('code femme',[30,50,75]),('acqua di gioia',[30,50,100]),('sì edp',[30,50,100]),('my way',[30,50,90]),
       ('eros',[50,100,200]),('dylan blue pour homme',[50,100,200]),('dylan blue pour femme',[30,50,100]),('crystal',[30,50,90]),('yellow diamond',[30,50,90]),('versense',[30,50,100]),('versace pour homme',[50,100,200]),
       ('le male le parfum',[75,125]),('le male elixir',[75,125]),('in blue',[75,125]),('ultra male',[75,125]),('le beau',[75,125]),('scandal intense (mujer)',[30,50,80]),('scandal',[50,100]),('la belle',[30,50,100]),
       ('light blue (mujer)',[25,50,100]),('light blue pour homme',[75,125]),('the one for men',[50,100]),('the one (mujer)',[30,50,75]),('devotion',[30,50,100]),
       ('donna born',[30,50,100]),('uomo',[50,100]),('voce viva',[30,50,100]),
       ('polo',[75,125]),('tommy',[50,100]),('paradoxe',[30,50,90]),('luna rossa',[50,100]),("l'homme",[50,100]),
       ("l'interdit",[35,50,80]),('gentleman',[60,100]),('alien',[30,60,90]),('angel',[25,50,100]),('a*men',[50,100]),
       ('bloom',[30,50,100]),('flora',[30,50,100]),('goddess',[30,50,100]),('burberry her',[30,50,100]),('hero',[50,100]),
       ('boss bottled',[50,100,200]),('hugo man',[75,125]),('boss femme',[50,75]),('montblanc',[50,100]),('ck one',[100,200]),('euphoria magnetic',[100]),('euphoria',[30,50,100]),
       ('kenzo',[30,50,100]),('moschino',[30,50,100]),('flowerbomb',[30,50,100]),('spicebomb',[50,90]),('narciso',[30,50,100]),('chloé',[30,50,75]),('daisy',[50,100]),('cloud',[30,50,100]),
       ('most wanted',[50,100]),('only the brave',[50,75,125]),("terre d'herm",[50,100]),('issey',[75,125]),('lacoste',[50,100]),('jimmy choo',[50,100]),('bvlgari',[60,100]),
       ('halloween man',[75,125]),('halloween',[30,50,100]),('paloma',[30,50,100])]
    for k,v in R:
        if k in n: return v
    return [30,50,100] if g=='Dama' else [50,100]
items=[]
for s in store:
    sz=sorted(set(std_sizes(s))|set(s['store_sizes']))
    items.append(dict(cat=s['cat'],gen=s['gen'],marca=s['marca'],nombre=s['nombre'],conc=s['conc'],sizes=sz,estado='En la web'))
have={(i['marca'].lower(),i['nombre'].lower()) for i in items}
for c,g,m,n,co,sz in NEW:
    if (m.lower(),n.lower()) in have: print('ya está',m,n); continue
    items.append(dict(cat=c,gen=g,marca=m,nombre=n,conc=co,sizes=sz,estado='Nuevo (recomendado)'))
order={'Árabe':0,'Diseñador':1,'Nicho':2}
items.sort(key=lambda i:(order[i['cat']], i['marca'].lower(), i['nombre'].lower()))
json.dump(items,open('items.json','w'),ensure_ascii=False)
from collections import Counter
print('perfumes',len(items),'filas',sum(len(i['sizes']) for i in items))
print(Counter((i['cat'],i['estado']) for i in items))
