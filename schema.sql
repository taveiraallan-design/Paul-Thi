-- Schema do banco D1 para os produtos do Paul-Thi Ferramentas

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  cat TEXT NOT NULL,
  icon TEXT,
  image TEXT,
  price REAL NOT NULL,
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  badge TEXT,
  description TEXT,
  specs TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (id, name, cat, icon, image, price, rating, reviews, badge, description, specs) VALUES
(1, 'Furadeira de Impacto 750W', 'Eletricas', 'i-drill', '', 349.90, 4.7, 128, 'Top venda',
 'Furadeira de impacto robusta para furos em alvenaria, madeira e metal. Empunhadura emborrachada e seletor de torque para uso diario em obra.',
 '{"Potencia":"750W","Mandril":"13mm","Voltagem":"220V","Peso":"2,1kg"}'),

(2, 'Jogo de Chaves Combinadas 8-19mm', 'Manuais', 'i-wrench', '', 189.00, 4.8, 64, NULL,
 'Conjunto com 8 chaves combinadas em aco cromo-vanadio, acabamento polido e maleta organizadora inclusa.',
 '{"Pecas":"8 unidades","Material":"Cromo-vanadio","Medidas":"8 a 19mm","Maleta":"Inclusa"}'),

(3, 'Serra Circular 7.1/4 1400W', 'Corte', 'i-saw', '', 459.90, 4.6, 41, 'Novo',
 'Serra circular com motor de 1400W, disco de 184mm e guia paralelo ajustavel para cortes precisos em madeira.',
 '{"Potencia":"1400W","Disco":"184mm","Guia":"Paralelo ajustavel","Voltagem":"220V"}'),

(4, 'Nivel a Laser Autonivelante', 'Medicao', 'i-ruler', '', 279.00, 4.5, 37, NULL,
 'Nivel a laser com linhas cruzadas e autonivelamento, ideal para instalacao de moveis, forros e revestimentos.',
 '{"Alcance":"ate 20m","Linhas":"Cruzadas (H+V)","Bateria":"Recarregavel","Precisao":"+-0,3mm/m"}'),

(5, 'Kit Protecao Basico', 'EPI', 'i-glove', '', 64.90, 4.9, 203, NULL,
 'Kit completo de EPI para trabalhos gerais: luva de raspa, oculos antiembacante e mascara PFF2 descartavel.',
 '{"Itens":"3 pecas","Luva":"Raspa, par","Oculos":"Antiembacante","Mascara":"PFF2 (5un)"}'),

(6, 'Compressor de Ar 24L 2HP', 'Pneumaticas', 'i-tank', '', 899.00, 4.7, 52, 'Promocao',
 'Compressor de ar com tanque de 24 litros e motor monofasico de 2HP, ideal para pintura, limpeza e ferramentas pneumaticas.',
 '{"Tanque":"24 litros","Motor":"2HP monofasico","Pressao":"ate 8 bar","Voltagem":"220V"}'),

(7, 'Marreta de Borracha 500g', 'Manuais', 'i-hammer', '', 39.90, 4.8, 89, NULL,
 'Marreta de borracha com cabeca dupla face e cabo de fibra de vidro, resistente a impactos e confortavel no uso.',
 '{"Peso":"500g","Cabo":"Fibra de vidro","Cabeca":"Dupla face","Uso":"Montagem geral"}'),

(8, 'Caixa Organizadora de Parafusos (200 pc)', 'Fixacao', 'i-screw', '', 54.90, 4.6, 76, NULL,
 'Caixa compartimentada com 200 pecas entre parafusos, buchas e arruelas em medidas variadas para uso domestico e profissional.',
 '{"Pecas":"200 unidades","Medidas":"6 variacoes","Material":"Aco zincado","Caixa":"Compartimentada"}');