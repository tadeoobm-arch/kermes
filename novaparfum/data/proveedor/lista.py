import json, re
P='/tmp/claude-0/-home-user-kermes/4161d6cf-0722-530c-b2e5-5ed4eb20765e/scratchpad/precios/'
rows=[r for r in json.load(open(P+'variantes.json')) if r['status']=='ACTIVE']
gen=json.load(open(P+'genero.json'))
ARAB={'Armaf','Rasasi','Lattafa','Al Haramain','A confirmar'}
NICHO={'Amouage','Byredo','Creed','Initio Parfums Privés','Kilian','Le Labo','Louis Vuitton','Maison Francis Kurkdjian','Mancera','Montale','Nishane','Parfums de Marly','Xerjoff','Maison Margiela'}
TF_PB={'Tobacco Vanille','Oud Wood','Lost Cherry','Bitter Peach','Soleil Blanc'}
# nombre limpio (marca, nombre) para títulos desprolijos; lista = se divide en varios
CLEAN={
"Versace Versense 100ml":[("Versace","Versense")],"Le Male Le Parfum JPG 125ml":[("Jean Paul Gaultier","Le Male Le Parfum")],
"Olympea Paco Rabanne":[("Paco Rabanne","Olympéa")],"Ultra Male JPG 125ml (tester)":[("Jean Paul Gaultier","Ultra Male")],
"Flower by Kenzo 50ml":[("Kenzo","Flower by Kenzo")],"Bad Boy Carolina Herrera":[("Carolina Herrera","Bad Boy")],
"Boss Bottled Hugo Boss":[("Hugo Boss","Boss Bottled")],"Devotion Dolce & Gabbana":[("Dolce & Gabbana","Devotion")],
"Black XS for Her":[("Paco Rabanne","Black XS for Her")],"Pour Homme Paco Rabanne":[("Paco Rabanne","Pour Homme")],
"Libre Yves Saint Laurent":[("Yves Saint Laurent","Libre")],"Scandal Intense Kit JPG":[("Jean Paul Gaultier","Scandal Intense (mujer)")],
"J'adore Dior":[("Dior","J'adore")],"Halloween":[("Jesus Del Pozo","Halloween")],"212 Carolina Herrera":[("Carolina Herrera","212 NYC (mujer)")],
"Euphoria Calvin Klein":[("Calvin Klein","Euphoria")],"Erba Pura Xerjoff":[("Xerjoff","Erba Pura")],
"Black XS Paco Rabanne (Caballero)":[("Paco Rabanne","Black XS (hombre)")],"212 Men Sexy Carolina Herrera":[("Carolina Herrera","212 Sexy Men")],
"Moschino (Fresh o I Love)":[("Moschino","Fresh Couture")],"Explorer Montblanc":[("Montblanc","Explorer")],
"La Bomba Carolina Herrera 80ml":[("Carolina Herrera","La Bomba")],"Amber Oud Al Haramain":[("Al Haramain","Amber Oud")],
"The One Dolce & Gabbana":[("Dolce & Gabbana","The One (mujer)")],"La Vida Es Bella (Lancome)":[("Lancôme","La Vie Est Belle")],
"Invictus Paco Rabanne (Aqua o Comun)":[("Paco Rabanne","Invictus"),("Paco Rabanne","Invictus Aqua")],
"Light Blue Dolce & Gabbana":[("Dolce & Gabbana","Light Blue (mujer)")],"My Way Armani":[("Giorgio Armani","My Way")],
"Acqua di Gio Armani":[("Giorgio Armani","Acqua di Giò (hombre)")],"Moschino Toy":[("Moschino","Toy")],"Lady Million":[("Paco Rabanne","Lady Million")],
"Idole Lancome 100ml":[("Lancôme","Idôle")],"Sauvage Dior EDP":[("Dior","Sauvage EDP")],"Hugo Man":[("Hugo Boss","Hugo Man")],
"Halloween Man Mystery":[("Jesus Del Pozo","Halloween Man Mystery")],"Alpha for Him":[("A confirmar (lista Hawas)","Alpha for Him")],
"Bleu de Chanel":[("Chanel","Bleu de Chanel")],"Armani Code":[("Giorgio Armani","Armani Code (hombre)")],
"Lancome Idole Power":[("Lancôme","Idôle Power")],"Lancome Trésor":[("Lancôme","Trésor")],
"Dolce&Gabbana The One for Men EDP":[],  # duplicado
"Moschino Toy 2 50ml":[("Moschino","Toy 2")],
}
def strip_brand(title, vendor):
    t=title
    for b in [vendor, vendor.replace('Lancôme','Lancome'), 'Dolce & Gabbana','Giorgio Armani','Emporio Armani','Yves Saint Laurent','Paco Rabanne','Jean Paul Gaultier','Carolina Herrera','Maison Francis Kurkdjian','Initio','Parfums de Marly','Maison Margiela','Calvin Klein','Ralph Lauren','Tommy Hilfiger','Rasasi','Lattafa','Armaf','Hugo Boss','Narciso Rodriguez','Issey Miyake','Jimmy Choo']:
        if b and t.lower().startswith(b.lower()+' '): t=t[len(b)+1:]; break
    return re.sub(r'\s*\d{2,3}\s?ml\b','',t).strip()
def gender(title):
    g=gen.get(title,[])
    if 'unisex' in g: return 'Unisex'
    if 'mujer' in g: return 'Dama'
    if 'hombre' in g: return 'Caballero'
    return 'Dama' if title=='Halloween' else 'A confirmar'
def conc(name):
    n=name.lower()
    for k,v in [('extrait','Extrait'),('elixir','Elixir'),('le parfum','Parfum'),('parfum','Parfum'),('edp','EDP'),('eau de parfum','EDP'),('edt','EDT'),('profumo','Parfum'),('intense','')]:
        if k in n and v: return v
    return ''
store=[]; seen=set()
for r in rows:
    t=r['title']
    if t in seen: 
        continue
    seen.add(t)
    sizes=sorted({int(m.group(1)) for x in rows if x['title']==t for m in [re.search(r'(\d{2,3})\s?ml', x['variant'] or '') or re.search(r'(\d{2,3})\s?ml', x['title'])] if m})
    v=r['vendor']; cat='Árabe' if v in ARAB else ('Nicho' if v in NICHO or (v=='Tom Ford' and any(k in t for k in TF_PB)) else 'Diseñador')
    pairs=CLEAN.get(t,[(v, strip_brand(t,v))])
    for (b,n) in pairs:
        store.append(dict(cat=cat,gen=gender(t),marca=b,nombre=n,conc=conc(t),store_sizes=sizes,estado='En la web',orig=t))
json.dump(store,open('store.json','w'),ensure_ascii=False,indent=0)
print(len(store))
for s in store[:5]: print(s)
