# -*- coding: utf-8 -*-
"""Generate js/data.js for Cronograma Exames."""
import json
from pathlib import Path

TYPE_LABELS = {
    "estudo": "Estudo / teoria",
    "exercicios": "Exercícios",
    "resumo": "Resumo / síntese",
    "ficha_iave": "Ficha IAVE / exame",
    "simulacro": "Simulacro",
    "redacao": "Redação / escrita",
    "descanso": "Descanso",
    "preparacao": "Preparação",
}

DISC_LABELS = {
    "FIS": "Física",
    "MAT": "Matemática",
    "PORT": "Português",
    "QUI": "Química",
    "FQ": "FQ A",
    "PREP": "Preparação",
    "DESC": "Descanso",
}

def t(discipline, type_, title, detail="", duration="1h30–2h"):
    return {
        "discipline": discipline,
        "type": type_,
        "title": title,
        "detail": detail,
        "duration": duration,
    }

def sun():
    return [t("DESC", "descanso", "Descanso total", "Sem estudo. Recuperação.", "—")]

# Week data: list of 7 days (Mon..Sun), each a list of tasks
weeks = []

# ——— WEEK 1 ———
weeks.append({
    "week": 1, "phase": "Mês 1 · Física 10.º + Mat 10.º + Port 10.º",
    "days": [
        [t("FIS", "estudo", "Energia e sistemas", "Sistemas conservativos vs. não conservativos. Sistema elétrico, mecânico e termodinâmico. Ek=½mv² e Ep=mgh."),
         t("PORT", "estudo", "Gramática — classes de palavras", "Substantivos, adjetivos, verbos, determinantes e identificação na frase.")],
        [t("MAT", "estudo", "Método de Hondt", "Modelos para a Cidadania — processos eleitorais: cálculo de mandatos e tabelas."),
         t("PORT", "estudo", "Os Lusíadas — Canto I", "Proposição, Invocação e Dedicatória + estrutura externa.")],
        [t("FIS", "estudo", "Conservação da energia mecânica", "Em=Ek+Ep. Transformações e transferências sem atrito."),
         t("MAT", "estudo", "Sainte-Laguë vs Hondt", "Método de Sainte-Laguë e comparação com Hondt.")],
        [t("PORT", "estudo", "Funções sintáticas", "Sujeito, predicado, modificadores, CD/CI."),
         t("MAT", "exercicios", "5 problemas — sistemas eleitorais", "Aplicação prática de métodos eleitorais.")],
        [t("FIS", "exercicios", "6 exercícios Ek e Ep", "Variação de energia cinética e potencial com gráficos."),
         t("PORT", "estudo", "Canto I — Concílio dos Deuses", "Ilha de Moçambique: Baco e Vénus.")],
        [t("FIS", "resumo", "Formulário de energia mecânica", "Síntese de fórmulas do módulo."),
         t("FIS", "ficha_iave", "1 ficha IAVE — Energia", "Prática tipo exame."),
         t("MAT", "resumo", "Ficha síntese — métodos eleitorais", ""),
         t("PORT", "ficha_iave", "Ficha de leitura — Canto I", "")],
        sun(),
    ],
})

# WEEK 2
weeks.append({
    "week": 2, "phase": "Mês 1 · Trabalho, finanças e Lusíadas",
    "days": [
        [t("FIS", "estudo", "Trabalho de uma força", "W=F·d·cosα. Forças eficazes, resistentes e nulas."),
         t("PORT", "estudo", "Os Lusíadas — Canto III", "Narração de Vasco da Gama ao Rei de Melinde.")],
        [t("MAT", "estudo", "Juros simples e compostos", "J=C·i·t e M=C(1+i)^n."),
         t("PORT", "estudo", "Inês de Castro", "Canto III, versos 118–135 — análise detalhada.")],
        [t("FIS", "estudo", "Teorema da energia cinética", "ΔEk = Wtotal. Exercícios com decomposição de forças."),
         t("MAT", "estudo", "Taxas e amortizações", "Taxas efetivas, nominais e tabela de amortização.")],
        [t("PORT", "estudo", "Canto IV — Velho do Restelo", "Críticas à expansão."),
         t("MAT", "exercicios", "6 problemas — juros e amortizações", "")],
        [t("FIS", "estudo", "Potência e rendimento", "η = Eútil/Etotal × 100. Motores e atrito."),
         t("PORT", "estudo", "Coesão e coerência", "Conetores e anáforas.")],
        [t("FIS", "resumo", "Resumo — trabalho e rendimento", ""),
         t("MAT", "resumo", "Resumo — matemática financeira", ""),
         t("FIS", "ficha_iave", "10 exercícios EN — teorema da Ec", "")],
        sun(),
    ],
})

# WEEK 3
weeks.append({
    "week": 3, "phase": "Mês 1 · Termodinâmica, geometria e Lusíadas",
    "days": [
        [t("FIS", "estudo", "Transferência de calor", "Condução, convecção e radiação — mecanismos e exemplos."),
         t("PORT", "estudo", "Canto IX — Ilha dos Amores", "Significado alegórico e recompensa dos heróis.")],
        [t("MAT", "estudo", "Vetores no plano", "Coordenadas, soma, produto por escalar e norma."),
         t("PORT", "estudo", "Canto X — Máquina do Mundo", "Reflexões e lamentos finais do Poeta.")],
        [t("FIS", "estudo", "Capacidade térmica e mudanças de estado", "Q=m·c·ΔT e Q=m·L."),
         t("MAT", "estudo", "Colinearidade e equação da reta", "Vetor diretor e equação vetorial.")],
        [t("PORT", "resumo", "Ficha síntese — Os Lusíadas", "Planos da Viagem, História, Deuses e Poeta."),
         t("MAT", "exercicios", "8 exercícios — cálculo vetorial", "")],
        [t("FIS", "estudo", "Gráficos de aquecimento e calorímetros", "Mudança de fase e trocas de calor isoladas."),
         t("PORT", "estudo", "Valor temporal, aspetual e modal", "Verbos em trechos literários.")],
        [t("FIS", "resumo", "Fórmulas de termodinâmica", "Q=mcΔT e afins."),
         t("MAT", "resumo", "Resumo — geometria plana", ""),
         t("MAT", "ficha_iave", "Exames — geometria analítica 10.º", "")],
        sun(),
    ],
})

# WEEK 4
weeks.append({
    "week": 4, "phase": "Mês 1 · Radiação, radicais e Gil Vicente",
    "days": [
        [t("FIS", "estudo", "Radiação solar e efeito de estufa", "Balanço térmico da Terra: absorção, reflexão, transmissão."),
         t("PORT", "estudo", "Auto da Barca do Inferno I", "Fidalgo, Onzeneiro, Parvo e Sapateiro.")],
        [t("MAT", "estudo", "Radicais e potências", "Operações com radicais, simplificação e racionalização."),
         t("PORT", "estudo", "Auto da Barca do Inferno II", "Frade, Brízida Vaz, Judeu, Corregedor, Enforcado, Cavaleiros.")],
        [t("FIS", "estudo", "Coletores e painéis fotovoltaicos", "Funcionamento e eficiência energética."),
         t("MAT", "estudo", "Expoente racional e equações", "a^(m/n) e equações com radicais.")],
        [t("PORT", "estudo", "Farsa de Inês Pereira", "Inês, Lianor Vaz, Pêro Marques e Brás da Mata."),
         t("MAT", "estudo", "Divisão de polinómios", "Algoritmo da divisão.")],
        [t("FIS", "ficha_iave", "5 questões — radiação e balanço térmico", "Teóricas e práticas de exame."),
         t("PORT", "estudo", "Tipos de cómico em Gil Vicente", "Caráter, situação, linguagem e crítica social.")],
        [t("FIS", "resumo", "Resumo global Física 10.º", ""),
         t("MAT", "resumo", "Polinómios e radicais", ""),
         t("PORT", "ficha_iave", "Ficha de leitura — Gil Vicente", "")],
        sun(),
    ],
})

# WEEK 5
weeks.append({
    "week": 5, "phase": "Mês 2 · Cinemática, funções e trovadores",
    "days": [
        [t("FIS", "estudo", "Cinemática — posição e deslocamento", "Vetor posição r(t), Δr e x(t) em trajetórias retilíneas."),
         t("PORT", "estudo", "Cantigas de Amigo", "Sujeito feminino, refrão, paralelismo, natureza.")],
        [t("MAT", "estudo", "Introdução às funções", "Domínio, contradomínio, conjunto de chegada e imagem."),
         t("PORT", "estudo", "2 Cantigas de Amigo — D. Dinis", "Ex.: «Ai flores, ai flores do verde pino».")],
        [t("FIS", "estudo", "Velocidade média e instantânea", "Gráficos v(t) e deslocamento pela área."),
         t("MAT", "estudo", "Domínios algébricos", "Restrições: denominadores e radicais de índice par.")],
        [t("PORT", "estudo", "Cantigas de Amor", "Ambiente cortesão, vassalagem amorosa, coita."),
         t("MAT", "estudo", "Zeros e estudo do sinal", "A partir do gráfico.")],
        [t("FIS", "exercicios", "6 exercícios — unidades e gráficos", "x(t) e v(t)."),
         t("PORT", "estudo", "2 Cantigas de Amor", "D. Dinis / Bernardim Ribeiro.")],
        [t("FIS", "resumo", "Resumo visual — cinemática", "Velocidade vs. posição."),
         t("MAT", "exercicios", "Ficha — domínios de funções", "")],
        sun(),
    ],
})

# WEEK 6
weeks.append({
    "week": 6, "phase": "Mês 2 · MRU/MRUV e funções",
    "days": [
        [t("FIS", "estudo", "Aceleração · MRU e MRUV", "Aceleração média/instantânea; movimentos retilíneos."),
         t("PORT", "estudo", "Cantigas de Escárnio e Maldizer", "Sátira social/política; linguagem direta/indireta.")],
        [t("MAT", "estudo", "Paridade de funções", "Pares e ímpares; simetrias dos gráficos."),
         t("PORT", "resumo", "Quadro das 3 tipologias trovadorescas", " + ficha de gramática.")],
        [t("FIS", "exercicios", "Equações de movimento", "x(t)=x0+v0t+½at² e v(t)=v0+at."),
         t("MAT", "estudo", "Transformações de gráficos", "f(x)+k, f(x+c), −f(x), f(−x), |f(x)|.")],
        [t("PORT", "estudo", "Fernão Lopes — introdução", "Historiografia e prosa medieval."),
         t("MAT", "estudo", "Função quadrática", "f(x)=a(x−h)²+k — vértice, eixo, zeros.")],
        [t("FIS", "exercicios", "Queda livre e lançamento vertical", "g=9,8 m/s² · 5 problemas de altura máxima."),
         t("PORT", "estudo", "Processos fonológicos", "Assimilação, dissimilação, prótese, síncope, apócope.")],
        [t("FIS", "ficha_iave", "Ficha IAVE — MRU, MRUV, queda livre", ""),
         t("MAT", "ficha_iave", "Ficha — quadrática e transformações", "")],
        sun(),
    ],
})

# WEEK 7
weeks.append({
    "week": 7, "phase": "Mês 2 · Newton, estatística e escrita",
    "days": [
        [t("FIS", "estudo", "1.ª e 3.ª leis de Newton", "Inércia e ação-reação — características do par."),
         t("PORT", "resumo", "Consolidação literatura 10.º", "Lusíadas, Gil Vicente e Cantigas.")],
        [t("MAT", "estudo", "Estatística bidimensional", "Diagrama de dispersão e centro de gravidade."),
         t("PORT", "exercicios", "Orações subordinadas e coordenadas", "Exercícios práticos.")],
        [t("FIS", "estudo", "2.ª lei de Newton", "Fres=ma em planos horizontais com/sem atrito."),
         t("MAT", "estudo", "Reta de regressão na CG", "y=ax+b e interpretação do declive.")],
        [t("PORT", "redacao", "Estrutura do texto de opinião", "Tese, argumentos, exemplos, conclusão."),
         t("MAT", "estudo", "Coeficiente de correlação r", "Força e sentido da associação.")],
        [t("FIS", "estudo", "Planos inclinados", "Px=mgsinα, Py=mgcosα."),
         t("PORT", "redacao", "1 texto de opinião completo", "Tema tipo IAVE.")],
        [t("FIS", "resumo", "Leis de Newton e decomposição", ""),
         t("MAT", "resumo", "Comandos da CG — estatística", "")],
        sun(),
    ],
})

# WEEK 8
weeks.append({
    "week": 8, "phase": "Mês 2 · MCU, revisão e simulacro",
    "days": [
        [t("FIS", "estudo", "Movimento circular uniforme", "T, f, v, aceleração centrípeta."),
         t("PORT", "estudo", "Erros frequentes — redação e gramática", "Revisão 10.º ano.")],
        [t("MAT", "estudo", "Polinómios e Ruffini", "Equações grau >2 e teorema do resto."),
         t("PORT", "estudo", "Critérios de classificação IAVE", "Leitura e análise — 10.º ano.")],
        [t("FIS", "estudo", "Gravitação universal", "F=G m1m2/r² e satélites (Fg=Fc)."),
         t("MAT", "ficha_iave", "10 EM de exames — 10.º ano", "")],
        [t("PORT", "ficha_iave", "Grupo I + II — prova modelo 10.º", "Interpretação e gramática."),
         t("MAT", "ficha_iave", "3 resposta aberta — geometria e funções", "")],
        [t("FIS", "resumo", "Fórmulas e unidades SI — mecânica", "Revisão 10.º e 11.º."),
         t("PORT", "redacao", "Auto-correção do texto de opinião", "Semana 7.")],
        [t("FIS", "simulacro", "PROVA 1 — Mecânica EN FQ A", "Parte de mecânica de exame nacional."),
         t("MAT", "simulacro", "PROVA 2 — Teste global Mat A 10.º", "")],
        sun(),
    ],
})

# WEEK 9
weeks.append({
    "week": 9, "phase": "Mês 3 · Ondas, contagem e Fernão Lopes",
    "days": [
        [t("FIS", "estudo", "Sinais e ondas", "Mecânicas vs EM; transversais vs longitudinais."),
         t("PORT", "estudo", "Fernão Lopes — Cap. 115", "Cerco de Lisboa e representação do povo.")],
        [t("MAT", "estudo", "Princípio fundamental da contagem", "Regra da multiplicação e da soma."),
         t("PORT", "estudo", "Fernão Lopes — Cap. 148", "Consciência coletiva e herói coletivo.")],
        [t("FIS", "estudo", "Grandezas periódicas", "λ, T, f e v=λf."),
         t("MAT", "estudo", "Arranjos e permutações", "nAk, nA'k e n!.")],
        [t("PORT", "ficha_iave", "Estilo de Fernão Lopes", "Visualismo, dinamismo, oralidade."),
         t("MAT", "exercicios", "Combinações nCk", "Comissões e grupos.")],
        [t("FIS", "estudo", "Equação temporal de um sinal", "Representação espacial vs temporal."),
         t("PORT", "estudo", "Deixes pessoais, espaciais e temporais", "")],
        [t("FIS", "resumo", "Equações da onda", ""),
         t("MAT", "exercicios", "Ficha — contagem/combinações", ""),
         t("PORT", "ficha_iave", "Ficha IAVE — Fernão Lopes", "")],
        sun(),
    ],
})

# WEEK 10
weeks.append({
    "week": 10, "phase": "Mês 3 · Som, binómio e Frei Luís de Sousa",
    "days": [
        [t("FIS", "estudo", "Som — tom, intensidade, timbre", "Som puro vs complexo."),
         t("PORT", "estudo", "Frei Luís de Sousa — Ato I", "Personagens; sebastianismo de D. Madalena e Maria.")],
        [t("MAT", "estudo", "Triângulo de Pascal", "Propriedades e simetrias."),
         t("PORT", "estudo", "Frei Luís de Sousa — Ato II", "Incêndio e mudança de casa.")],
        [t("FIS", "estudo", "Nível de intensidade sonora", "Escala dB; reflexão, absorção, refração."),
         t("MAT", "estudo", "Binómio de Newton", "Termo geral e expansão de (a+b)^n.")],
        [t("PORT", "estudo", "Frei Luís de Sousa — Ato III", "Romeiro/D. João e tragédia de Maria."),
         t("MAT", "exercicios", "6 problemas — Pascal e Binómio", "")],
        [t("FIS", "exercicios", "6 exercícios — som", "Frequência, λ e velocidade em vários meios."),
         t("PORT", "estudo", "Dimensão trágica e mito sebástico", "Em Frei Luís de Sousa.")],
        [t("FIS", "resumo", "Propriedades do som", ""),
         t("MAT", "resumo", "Contagem e binómio", ""),
         t("PORT", "ficha_iave", "Ficha — Frei Luís de Sousa", "")],
        sun(),
    ],
})

# WEEK 11
weeks.append({
    "week": 11, "phase": "Mês 3 · Luz, trigonometria e Amor de Perdição",
    "days": [
        [t("FIS", "estudo", "Espetro eletromagnético", "Visível, UV, IV, raios X e gama."),
         t("PORT", "estudo", "Amor de Perdição — ultrarromantismo", "Simão, Teresa e Mariana.")],
        [t("MAT", "estudo", "Trigonometria no triângulo e círculo", "Razões; graus e radianos."),
         t("PORT", "estudo", "Teresa vs Mariana", "Análise das figuras femininas.")],
        [t("FIS", "estudo", "Reflexão, refração e Snell", "n1 sin α1 = n2 sin α2."),
         t("MAT", "estudo", "sin, cos, tan no círculo", "Sinais nos 4 quadrantes; ângulos generalizados.")],
        [t("PORT", "resumo", "Paixões e destino trágico", "Ficha resumo — Amor de Perdição."),
         t("MAT", "estudo", "Relação fundamental", "sin²α+cos²α=1 e tanα=sinα/cosα.")],
        [t("FIS", "estudo", "Ângulo crítico e reflexão total", "Fibras óticas; dispersão da luz."),
         t("PORT", "estudo", "Discurso direto, indireto e indireto livre", "")],
        [t("FIS", "resumo", "Leis da ótica", ""),
         t("MAT", "ficha_iave", "Ficha — identidades trigonométricas", ""),
         t("PORT", "exercicios", "Interpretação — Amor de Perdição", "")],
        sun(),
    ],
})

# WEEK 12
weeks.append({
    "week": 12, "phase": "Mês 3 · Eletromagnetismo e Os Maias",
    "days": [
        [t("FIS", "estudo", "Fluxo magnético e Faraday-Lenz", "Φ=B·A·cosα; indução."),
         t("PORT", "estudo", "Os Maias — família Maia", "Afonso, Pedro e Carlos Eduardo.")],
        [t("MAT", "estudo", "Equações trigonométricas", "sin x=sin α, cos x=cos α, tan x=tan α."),
         t("PORT", "estudo", "Educação de Pedro vs Carlos", "Educação inglesa de Carlos.")],
        [t("FIS", "estudo", "Efeito fotoelétrico", "Fotões, Φ0 e Ek dos fotoeletrões (E=hf)."),
         t("MAT", "estudo", "Funções seno e cosseno", "Domínio, contradomínio, período 2π, paridade.")],
        [t("PORT", "estudo", "Crítica social — Os Maias I", "Jantar no Hotel Central e Corridas no Hipódromo."),
         t("MAT", "estudo", "Função tangente", "Domínio, período π, assíntotas verticais.")],
        [t("FIS", "ficha_iave", "6 exercícios — indução e fotoelétrico", ""),
         t("PORT", "estudo", "Sarau da Trindade e Episódio do Rasteiro", "")],
        [t("FIS", "resumo", "Resumo módulo Física 11.º", ""),
         t("MAT", "ficha_iave", "Equações e funções trigonométricas", ""),
         t("PORT", "resumo", "Esquema — crítica social em Os Maias", "")],
        sun(),
    ],
})

# WEEK 13
weeks.append({
    "week": 13, "phase": "Mês 4 · Química 10.º, sucessões e Maias",
    "days": [
        [t("QUI", "estudo", "Elementos e tabela periódica", "Massa atómica relativa; grupos, períodos, blocos."),
         t("PORT", "estudo", "Os Maias — intriga e incesto", "Carlos e Maria Eduarda.")],
        [t("MAT", "estudo", "Sucessões — conceito", "Termo geral, gráfico, ordem e limitação."),
         t("PORT", "estudo", "Os Maias — desfecho", "Envelhecimento; passeio final Carlos e Ega.")],
        [t("QUI", "estudo", "Configuração eletrónica", "Poupança, Hund, Pauli; eletrões de valência."),
         t("MAT", "estudo", "Monotonia de sucessões", "Sinal de uₙ₊₁−uₙ.")],
        [t("PORT", "estudo", "Símbolos em Os Maias", "Ramalhete, Vénus, diletantismo."),
         t("MAT", "estudo", "Progressões aritméticas", "Termo geral e soma dos n primeiros.")],
        [t("QUI", "estudo", "Propriedades periódicas", "Raios, energia de ionização, eletronegatividade."),
         t("PORT", "estudo", "Atos de fala", "Diretos/indiretos; assertivos, diretivos, etc.")],
        [t("QUI", "resumo", "Propriedades periódicas", ""),
         t("MAT", "ficha_iave", "Ficha — progressões aritméticas", ""),
         t("PORT", "ficha_iave", "Ficha completa — Os Maias", "")],
        sun(),
    ],
})

# WEEK 14
weeks.append({
    "week": 14, "phase": "Mês 4 · Ligações, limites e poesia",
    "days": [
        [t("QUI", "estudo", "Ligação química e VSEPR", "Covalente, iónica, metálica; geometria molecular."),
         t("PORT", "estudo", "Antero — fase neorromântica", "Idealismo e a mulher.")],
        [t("MAT", "estudo", "Progressões geométricas", "Termo geral e soma."),
         t("PORT", "estudo", "Antero — fase realista/filosófica", "Angústia existencial e a morte.")],
        [t("QUI", "estudo", "Polaridade e forças intermoleculares", "London, dipolo-dipolo, H-bond."),
         t("MAT", "estudo", "Limites de sucessões", "Convergentes e divergentes.")],
        [t("PORT", "estudo", "4 sonetos de Antero", "Ex.: Despondency; Na Mão de Deus."),
         t("MAT", "estudo", "Indeterminações em sucessões", "∞−∞ e ∞/∞.")],
        [t("QUI", "estudo", "Química orgânica — intro", "Hidrocarbonetos e grupos funcionais."),
         t("PORT", "estudo", "Cesário Verde — Num Bairro Moderno", "Perceção sensorial e transfiguração.")],
        [t("QUI", "resumo", "Tabela geometria/polaridade", ""),
         t("MAT", "resumo", "Limites de sucessões", ""),
         t("PORT", "ficha_iave", "Antero e Cesário Verde", "")],
        sun(),
    ],
})

# WEEK 15
weeks.append({
    "week": 15, "phase": "Mês 4 · Soluções, limites e Vieira",
    "days": [
        [t("QUI", "estudo", "Soluções e concentrações", "C=m/V, c=n/V e fração molar."),
         t("PORT", "estudo", "O Sentimento dum Ocidental", "4 partes: Ave-Marias → Horas Mortas.")],
        [t("MAT", "estudo", "Limites de funções", "Heine, laterais e existência."),
         t("PORT", "estudo", "Cidade e campo em Cesário", "")],
        [t("QUI", "estudo", "Diluição de soluções", "ciVi=cfVf; ALs 1.1/1.2."),
         t("MAT", "estudo", "Indeterminações 0/0", "Polinómios e radicais.")],
        [t("PORT", "estudo", "Sermão — Exórdio", "Conceito predicável; crítica aos pregadores."),
         t("MAT", "estudo", "Indeterminações 0×∞ e ∞", "Levantamento algébrico.")],
        [t("QUI", "exercicios", "6 problemas — concentrações", "Diluições e frações molares."),
         t("PORT", "estudo", "Sermão — Caps. II e III", "Louvores aos peixes.")],
        [t("QUI", "resumo", "Fórmulas Química 10.º", ""),
         t("MAT", "ficha_iave", "Levantamento de indeterminações", ""),
         t("PORT", "ficha_iave", "Alegoria no Sermão", "")],
        sun(),
    ],
})

# WEEK 16
weeks.append({
    "week": 16, "phase": "Mês 4 · Consolidação Qui + assíntotas",
    "days": [
        [t("QUI", "ficha_iave", "10 EM — Química 10.º", "Consolidação."),
         t("PORT", "estudo", "Sermão — Caps. IV e V", "Repreensões: vaidade, exploração, traição.")],
        [t("MAT", "estudo", "Assíntotas verticais", "x=a via limites laterais."),
         t("PORT", "estudo", "Sermão — Cap. VI", "Peroração / conclusão.")],
        [t("QUI", "ficha_iave", "4 resposta aberta IAVE — Qui 10.º", ""),
         t("MAT", "estudo", "Assíntotas não verticais", "m=lim f(x)/x e b=lim(f(x)−mx).")],
        [t("PORT", "estudo", "Oratória barroca", "Exórdio, exposição, confirmação, peroração."),
         t("MAT", "estudo", "Continuidade de uma função", "Num ponto e num domínio.")],
        [t("QUI", "resumo", "Revisão de todas as ALs Qui 10.º", ""),
         t("PORT", "estudo", "Teorema de Bolzano-Cauchy", "Existência de zeros.")],
        [t("MAT", "resumo", "Assíntotas e Bolzano", ""),
         t("PORT", "ficha_iave", "IAVE — Sermão de Santo António", "")],
        sun(),
    ],
})

# WEEK 17
weeks.append({
    "week": 17, "phase": "Mês 5 · Equilíbrio, derivadas e Camões",
    "days": [
        [t("QUI", "estudo", "Equilíbrio químico", "Reversíveis vs irreversíveis; estado de equilíbrio."),
         t("PORT", "estudo", "Camões lírico — amor petrarquista", "Beleza idealizada; contradições.")],
        [t("MAT", "estudo", "Taxa média de variação", "TMV em [a,b]; declive da secante."),
         t("PORT", "estudo", "Camões lírico — Natureza", "Locus amoenus vs estado de alma.")],
        [t("QUI", "estudo", "Constante Kc", "Lei da ação das massas; interpretação de Kc."),
         t("MAT", "estudo", "Derivada num ponto e f'", "Declive da tangente; função derivada.")],
        [t("PORT", "estudo", "Mudança / desconcerto do mundo", "«Mudam-se os tempos…»"),
         t("MAT", "estudo", "Regras de derivação", "Constante, x^n, soma, produto, quociente.")],
        [t("QUI", "estudo", "Princípio de Le Chatelier", "Concentração, pressão/volume, temperatura."),
         t("PORT", "estudo", "5 sonetos de Camões lírico", "Leitura e análise.")],
        [t("QUI", "resumo", "Perturbações do equilíbrio", ""),
         t("MAT", "resumo", "Tabela de regras de derivação", ""),
         t("PORT", "ficha_iave", "Interpretação — Camões lírico", "")],
        sun(),
    ],
})

# WEEK 18
weeks.append({
    "week": 18, "phase": "Mês 5 · Ácido-base e derivadas II",
    "days": [
        [t("QUI", "estudo", "Ácido-base Brönsted-Lowry", "Pares conjugados."),
         t("PORT", "estudo", "Camões vs Antero", "Articulação de leitura.")],
        [t("MAT", "estudo", "Regra da cadeia", "Derivada de função composta e [g(x)]^n."),
         t("PORT", "estudo", "Orações adjetivas e adverbiais", "Relativas explicativas/restritivas.")],
        [t("QUI", "estudo", "Kw, pH e pOH", "Kw=1,0×10⁻¹⁴."),
         t("MAT", "estudo", "Sinal de f' — monotonia e extremos", "Máximos e mínimos locais.")],
        [t("PORT", "estudo", "Funções sintáticas complexas", "Complemento do adjetivo; modificador do nome."),
         t("MAT", "exercicios", "Problemas de otimização", "Extremos absolutos.")],
        [t("QUI", "estudo", "Ka, Kb — ácidos fortes vs fracos", ""),
         t("PORT", "redacao", "Ensaio crítico (3 partes)", "")],
        [t("QUI", "resumo", "Ácido-base e pH", ""),
         t("MAT", "ficha_iave", "Otimização com derivadas", ""),
         t("PORT", "ficha_iave", "Gramática IAVE 11.º", "")],
        sun(),
    ],
})

# WEEK 19
weeks.append({
    "week": 19, "phase": "Mês 5 · Oxred, estudo de funções",
    "days": [
        [t("QUI", "estudo", "Oxidação-redução", "Nox, oxidante, redutor."),
         t("PORT", "resumo", "Tabela comparativa 10.º/11.º", "Temas e símbolos de todas as obras.")],
        [t("MAT", "estudo", "Derivadas trigonométricas", "sin, cos, tan."),
         t("PORT", "estudo", "Reprodução do discurso", "Direto → indireto (tempo/espaço).")],
        [t("QUI", "estudo", "Acerto de equações oxred", "Método dos eletrões; pares conjugados."),
         t("MAT", "estudo", "Concavidade e inflexão", "Via f''(x).")],
        [t("PORT", "exercicios", "Respostas curtas Grupo I", "Treino EN Português."),
         t("MAT", "estudo", "Estudo completo de uma função", "Domínio, assíntotas, monotonia, esboço.")],
        [t("QUI", "estudo", "Solubilidade e Kps", "Efeito do ião comum."),
         t("PORT", "ficha_iave", "Grupo II — gramática EN completo", "")],
        [t("QUI", "resumo", "Módulo Química 11.º", ""),
         t("MAT", "ficha_iave", "Estudo completo de funções", ""),
         t("PORT", "ficha_iave", "Itens resposta aberta IAVE", "")],
        sun(),
    ],
})

# WEEK 20
weeks.append({
    "week": 20, "phase": "Mês 5 · Consolidação e simulacro",
    "days": [
        [t("QUI", "resumo", "Consolidação Química 10.º+11.º", ""),
         t("PORT", "resumo", "Revisão fichas-síntese Português", "10.º e 11.º.")],
        [t("MAT", "resumo", "Bloco análise matemática", "Limites, continuidade, derivadas."),
         t("PORT", "redacao", "Grupo III — exame antigo", "Texto de opinião / ensaio.")],
        [t("QUI", "ficha_iave", "10 questões EN — ácido-base e equilíbrio", ""),
         t("MAT", "ficha_iave", "10 EM — funções e derivadas", "")],
        [t("PORT", "redacao", "Correção do texto (critérios oficiais)", ""),
         t("MAT", "ficha_iave", "3 problemas — geometria e trigonometria", "")],
        [t("QUI", "ficha_iave", "4 problemas IAVE — solubilidade e oxred", ""),
         t("PORT", "resumo", "Figuras de estilo e recursos expressivos", "")],
        [t("QUI", "simulacro", "PROVA 1 — módulo Química EN FQ A", ""),
         t("MAT", "simulacro", "PROVA 2 — teste global Mat A 11.º", "")],
        sun(),
    ],
})

# WEEK 21
weeks.append({
    "week": 21, "phase": "Mês 6 · ALs Física e novo programa",
    "days": [
        [t("FQ", "resumo", "ALs Física 10.º", "Erros, incertezas, material de laboratório."),
         t("PORT", "exercicios", "Respostas longas — Lusíadas e Trovadores", "")],
        [t("MAT", "exercicios", "Cidadania avançada", "Eleições e finanças — tipo exame."),
         t("PORT", "exercicios", "Respostas longas — Gil Vicente e Fernão Lopes", "")],
        [t("FQ", "resumo", "ALs Física 11.º", "v(t), g, velocidade do som, refração."),
         t("MAT", "exercicios", "Contagem e combinatória IAVE", "Com restrições.")],
        [t("PORT", "exercicios", "Respostas longas — Frei Luís e Amor de Perdição", ""),
         t("MAT", "ficha_iave", "8 EM — contagem e probabilidades", "")],
        [t("FQ", "ficha_iave", "Itens experimentais de Física", "Procedimentos e dados."),
         t("PORT", "exercicios", "30 itens Grupo II IAVE", "Gramática exaustiva.")],
        [t("FQ", "resumo", "Ficha síntese — ALs Física", ""),
         t("MAT", "ficha_iave", "Problemas novo programa Mat", "")],
        sun(),
    ],
})

# WEEK 22
weeks.append({
    "week": 22, "phase": "Mês 6 · ALs Química e geometria",
    "days": [
        [t("FQ", "resumo", "ALs Química 10.º", "Soluções, pH, ebulição/fusão."),
         t("PORT", "exercicios", "Respostas longas — Os Maias", "")],
        [t("MAT", "exercicios", "Geometria analítica no espaço", "Produto escalar, planos, esferas."),
         t("PORT", "exercicios", "Respostas longas — Cesário e Antero", "")],
        [t("FQ", "resumo", "ALs Química 11.º", "Titulação, equilíbrio, temperatura."),
         t("MAT", "exercicios", "Trigonometria e funções trig.", "Ângulos variáveis.")],
        [t("PORT", "exercicios", "Respostas longas — Sermão e Camões", ""),
         t("MAT", "ficha_iave", "4 demonstrações — geom. e trig.", "")],
        [t("FQ", "ficha_iave", "Itens experimentais de Química", ""),
         t("PORT", "estudo", "Critérios formais de escrita IAVE", "")],
        [t("FQ", "resumo", "Ficha síntese — ALs Química", ""),
         t("MAT", "ficha_iave", "Geometria e trig. EN", "")],
        sun(),
    ],
})

# WEEK 23
weeks.append({
    "week": 23, "phase": "Mês 6 · Treino por blocos EN",
    "days": [
        [t("FQ", "ficha_iave", "EN — Mecânica e Ondas", ""),
         t("PORT", "ficha_iave", "Grupo I — exame nacional recente", "")],
        [t("MAT", "ficha_iave", "EN — Estatística e Cidadania", ""),
         t("PORT", "ficha_iave", "Grupo II — mesmo exame", "")],
        [t("FQ", "ficha_iave", "EN — Eletromagnetismo e Luz", ""),
         t("MAT", "ficha_iave", "EN — Sucessões e Limites", "")],
        [t("PORT", "redacao", "Grupo III — redação do exame", ""),
         t("MAT", "ficha_iave", "EM antigas — treino de velocidade", "")],
        [t("FQ", "estudo", "Correção rigorosa Física (critérios IAVE)", ""),
         t("PORT", "estudo", "Análise de cotações e erros", "")],
        [t("FQ", "resumo", "Revisão dos pontos fracos da semana", ""),
         t("MAT", "resumo", "Revisão dos pontos fracos da semana", ""),
         t("PORT", "resumo", "Revisão dos pontos fracos da semana", "")],
        sun(),
    ],
})

# WEEK 24
weeks.append({
    "week": 24, "phase": "Mês 6 · Química EN + Caderno de Erros",
    "days": [
        [t("FQ", "ficha_iave", "EN — Estrutura da matéria e soluções", ""),
         t("PORT", "ficha_iave", "Grupo I — 2.º exame nacional", "")],
        [t("MAT", "ficha_iave", "EN — Derivadas e estudo de funções", ""),
         t("PORT", "ficha_iave", "Grupo II — 2.º exame", "")],
        [t("FQ", "ficha_iave", "EN — Equilíbrio, ácido-base, oxred", ""),
         t("MAT", "exercicios", "Otimização de exames passados", "")],
        [t("PORT", "redacao", "Grupo III — 2.º exame", ""),
         t("MAT", "estudo", "Calculadora gráfica — equações e interseções", "")],
        [t("FQ", "estudo", "Correção rigorosa Química (IAVE)", ""),
         t("PORT", "estudo", "Correção final do 2.º exame Português", "")],
        [t("FQ", "resumo", "Atualizar Caderno de Erros (S23–24)", ""),
         t("MAT", "resumo", "Atualizar Caderno de Erros (S23–24)", ""),
         t("PORT", "resumo", "Atualizar Caderno de Erros (S23–24)", "")],
        sun(),
    ],
})

# WEEK 25 — Simulacro 1
weeks.append({
    "week": 25, "phase": "Mês 7 · Simulacro 1",
    "days": [
        [t("FQ", "simulacro", "Simulacro 1 — FQ A", "Exame oficial completo · 120 min + 30 tolerância.", "2h30")],
        [t("MAT", "simulacro", "Simulacro 1 — Matemática A", "Exame oficial completo · 150 min + 30 tolerância.", "3h")],
        [t("PORT", "simulacro", "Simulacro 1 — Português", "Exame oficial completo · 120 min + 30 tolerância.", "2h30")],
        [t("FQ", "estudo", "Auto-correção Simulacro 1 FQ A", "Grelha oficial IAVE.")],
        [t("MAT", "estudo", "Auto-correção Simulacros MAT + PORT", ""),
         t("PORT", "estudo", "Auto-correção Simulacro 1 Português", "")],
        [t("FQ", "resumo", "Caderno de Erros — cotações perdidas", "Revisão teórica associada."),
         t("MAT", "resumo", "Caderno de Erros — cotações perdidas", ""),
         t("PORT", "resumo", "Caderno de Erros — cotações perdidas", "")],
        sun(),
    ],
})

# WEEK 26
weeks.append({
    "week": 26, "phase": "Mês 7 · Reforço dirigido 1",
    "days": [
        [t("FQ", "exercicios", "10 exercícios — falhas do Simulacro 1", "Temas fracos (ex.: mecânica ou ácido-base).")],
        [t("MAT", "exercicios", "10 exercícios — falhas do Simulacro 1", "Ex.: geometria no espaço ou derivadas.")],
        [t("PORT", "estudo", "Revisão obras/temas com dúvidas", "Do Simulacro 1.")],
        [t("FQ", "exercicios", "Cálculos estequiométricos e unidades", "Treino intensivo.")],
        [t("MAT", "exercicios", "Escolha múltipla — maximizar Grupo I", "")],
        [t("FQ", "resumo", "Consolidação conteúdos falhados S25", ""),
         t("MAT", "resumo", "Consolidação conteúdos falhados S25", ""),
         t("PORT", "resumo", "Consolidação conteúdos falhados S25", "")],
        sun(),
    ],
})

# WEEK 27
weeks.append({
    "week": 27, "phase": "Mês 7 · Simulacro 2",
    "days": [
        [t("FQ", "simulacro", "Simulacro 2 — FQ A", "2.ª fase ou ano anterior · tempo contado.", "2h30")],
        [t("MAT", "simulacro", "Simulacro 2 — Matemática A", "Tempo contado.", "3h")],
        [t("PORT", "simulacro", "Simulacro 2 — Português", "Tempo contado.", "2h30")],
        [t("FQ", "estudo", "Correção rigorosa Simulacro 2 FQ A", "")],
        [t("MAT", "estudo", "Correção Simulacro 2 MAT + PORT", ""),
         t("PORT", "estudo", "Correção Simulacro 2 Português", "")],
        [t("FQ", "resumo", "Comparar notas S25 vs S27", "Medir evolução."),
         t("MAT", "resumo", "Comparar notas S25 vs S27", ""),
         t("PORT", "resumo", "Comparar notas S25 vs S27", "")],
        sun(),
    ],
})

# WEEK 28
weeks.append({
    "week": 28, "phase": "Mês 7 · Reforço dirigido 2",
    "days": [
        [t("FQ", "exercicios", "Treino avançado — pontuação baixa", "Desenvolvimento e ALs.")],
        [t("MAT", "exercicios", "Otimização e demonstrações", "Algébricas/trigonométricas.")],
        [t("PORT", "exercicios", "Gramática + texto de opinião", "Orações, discurso, estrutura.")],
        [t("FQ", "resumo", "Revisão formulário oficial FQ A", "")],
        [t("MAT", "resumo", "Revisão formulário oficial Mat A", "")],
        [t("FQ", "resumo", "Organizar dossier — resumos essenciais", ""),
         t("MAT", "resumo", "Organizar dossier — resumos essenciais", ""),
         t("PORT", "resumo", "Organizar dossier — resumos essenciais", "")],
        sun(),
    ],
})

# WEEK 29
weeks.append({
    "week": 29, "phase": "Mês 8 · Revisão express",
    "days": [
        [t("FQ", "resumo", "Revisão ativa — Física 10.º e 11.º", "Todos os resumos.")],
        [t("MAT", "resumo", "Revisão — Geometria, Trig., Cidadania", "")],
        [t("PORT", "resumo", "Fichas-síntese literatura 10.º", "Lusíadas, Gil Vicente, Cantigas.")],
        [t("FQ", "resumo", "Revisão ativa — Química 10.º e 11.º", "")],
        [t("MAT", "resumo", "Sucessões, limites, derivadas, contagem", "")],
        [t("PORT", "resumo", "Fichas-síntese literatura 11.º", "Maias, Frei Luís, Vieira, Cesário, Antero, Fernão Lopes.")],
        sun(),
    ],
})

# WEEK 30
weeks.append({
    "week": 30, "phase": "Mês 8 · Simulacro final",
    "days": [
        [t("FQ", "simulacro", "Simulacro final — FQ A", "Condições 100% reais.", "2h30")],
        [t("MAT", "simulacro", "Simulacro final — Matemática A", "Condições 100% reais.", "3h")],
        [t("PORT", "simulacro", "Simulacro final — Português", "Condições 100% reais.", "2h30")],
        [t("FQ", "estudo", "Correção e validação — FQ A", "")],
        [t("MAT", "estudo", "Correção e validação — MAT A + PORT", ""),
         t("PORT", "estudo", "Correção e validação — Português", "")],
        [t("FQ", "resumo", "Ler Caderno de Erros completo", "Acumulado dos 8 meses."),
         t("MAT", "resumo", "Ler Caderno de Erros completo", ""),
         t("PORT", "resumo", "Ler Caderno de Erros completo", "")],
        sun(),
    ],
})

# WEEK 31
weeks.append({
    "week": 31, "phase": "Mês 8 · Ajuste fino",
    "days": [
        [t("FQ", "exercicios", "5 exercícios complexos — dúvidas FQ", "")],
        [t("MAT", "exercicios", "5 exercícios complexos — dúvidas MAT", "")],
        [t("PORT", "resumo", "Gramática e conetores — texto de opinião", "")],
        [t("FQ", "preparacao", "Verificar calculadoras gráficas", "Pilhas, radianos/graus, memória."),
         t("MAT", "preparacao", "Verificar calculadoras gráficas", "Pilhas, radianos/graus, memória.")],
        [t("PORT", "resumo", "Citações e episódios marcantes", "Obras obrigatórias.")],
        [t("FQ", "resumo", "Leitura calma das folhas de resumos", ""),
         t("MAT", "resumo", "Leitura calma das folhas de resumos", ""),
         t("PORT", "resumo", "Leitura calma das folhas de resumos", "")],
        sun(),
    ],
})

# WEEK 32
weeks.append({
    "week": 32, "phase": "Mês 8 · Semana do exame",
    "days": [
        [t("FQ", "resumo", "Leitura leve — formulário FQ A", "Máximo 2 horas.", "≤2h")],
        [t("MAT", "resumo", "Leitura leve — formulário Mat A", "Máximo 2 horas.", "≤2h")],
        [t("PORT", "resumo", "Leitura leve — fichas das obras", "Máximo 2 horas.", "≤2h")],
        [t("PREP", "preparacao", "Descanso total — preparar material", "Canetas, CC, calculadora permitida, água. Sem estudo intensivo.", "—")],
        [t("PREP", "preparacao", "Dia de exame — foco e confiança", "Gerir o tempo conforme o treino dos 8 meses.", "—")],
        [t("DESC", "descanso", "Descanso e celebração", "Cumprimento do plano!", "—")],
        sun(),
    ],
})

prep = [
    {
        "date": "2026-10-01",
        "tasks": [
            t("PREP", "preparacao", "Organizar dossier de estudo", "Separar por disciplina; criar Caderno de Erros vazio.", "1–2h"),
            t("PREP", "preparacao", "Reunir formulários oficiais", "FQ A e Matemática A (IAVE).", "30–45 min"),
        ],
    },
    {
        "date": "2026-10-02",
        "tasks": [
            t("PREP", "preparacao", "Definir horário dos 2 blocos diários", "Escolher janelas fixas (~1h30–2h cada).", "45 min"),
            t("PREP", "preparacao", "Preparar material (cadernos, folhas, CG)", "", "30 min"),
        ],
    },
    {
        "date": "2026-10-03",
        "tasks": [
            t("PREP", "preparacao", "Objetivos do Mês 1", "Física 10.º, Mat cidadania, Lusíadas — visão geral.", "1h"),
            t("PREP", "preparacao", "Explorar o calendário e marcar a Semana 1", "Começa 2.ª feira 5/out.", "30 min"),
        ],
    },
    {
        "date": "2026-10-04",
        "tasks": [
            t("DESC", "descanso", "Descanso / preparação mental", "Sem carga de estudo. Começar frescos na 2.ª feira.", "—"),
        ],
    },
]

out = {
    "week1Start": "2026-10-05",
    "typeLabels": TYPE_LABELS,
    "disciplineLabels": DISC_LABELS,
    "prepDays": prep,
    "weeks": weeks,
}

js = Path(__file__).resolve().parent.parent / "js" / "data.js"
js.parent.mkdir(parents=True, exist_ok=True)
payload = json.dumps(out, ensure_ascii=False, indent=2)
js.write_text(
    f"/* Auto-generated schedule data — Cronograma Exames */\nwindow.CRONOGRAMA_DATA = {payload};\n",
    encoding="utf-8",
)
print(f"Wrote {js} ({js.stat().st_size} bytes), weeks={len(weeks)}")
