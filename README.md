# Odontologia Rodrigues ATA — Landing Page

Landing page profissional, moderna e responsiva para a clínica **Odontologia Rodrigues ATA**, localizada em Araçatuba-SP. Especializada em **facetas** e **implantes dentários**.

Site 100% estático (HTML + CSS + JavaScript puro), sem frameworks e sem dependências externas de ícones — pronto para deploy na **Vercel** via **GitHub**.

---

## ✨ Características

- **Zero dependências** — apenas HTML5, CSS3 e JavaScript vanilla.
- **Sem imagens externas** — todos os visuais são gradients CSS e ícones SVG inline (o cliente adiciona as fotos reais depois).
- **Responsivo (mobile-first)** — breakpoints em 768px (tablet) e 1024px (desktop).
- **Animações suaves** — reveal no scroll via `IntersectionObserver` e contadores animados.
- **Botão flutuante de WhatsApp** com efeito pulse + botão "voltar ao topo".
- **SEO** — meta title/description, Open Graph, Twitter Card e dados estruturados (JSON-LD `Dentist`).
- **Acessibilidade** — contraste adequado, `aria-labels`, foco visível e suporte a `prefers-reduced-motion`.
- **Fontes** — Playfair Display (títulos) e Inter (corpo), via Google Fonts.

---

## 📁 Estrutura

```
.
├── index.html            # Página única com todas as seções
├── css/
│   └── style.css         # Estilos + design tokens (variáveis CSS) + responsivo
├── js/
│   └── main.js           # Menu mobile, scroll reveal, scrollspy, contadores
├── assets/
│   └── images/
│       └── og-image.svg  # Imagem de compartilhamento (Open Graph)
├── vercel.json           # Configuração de deploy (cache/clean URLs)
├── .gitignore
└── README.md
```

---

## 🎞️ Sistema de movimento

Toda a interatividade é feita com **CSS moderno + um único controlador em JavaScript vanilla** (sem bibliotecas de animação). Só `transform` e `opacity` são animados — amigável à GPU, sem *layout shift*.

- **Reveal no scroll** com variações direcionais (`data-reveal="left|right|scale|fade"`) e *stagger* automático entre irmãos, via `IntersectionObserver`.
- **Header dinâmico** — some ao rolar para baixo, volta ao subir, com sombra ao sair do topo.
- **Barra de progresso** de leitura no topo e **anel de progresso** no botão "voltar ao topo".
- **Parallax do hero** — camada decorativa reage ao scroll e ao mouse (desktop); tilt 3D no card.
- **Cards** com *spotlight* que segue o cursor, leve tilt e elevação (desktop); feedback ao toque (mobile).
- **Botões** com brilho que varre, seta que desliza e *ripple* ao clicar/tocar.
- **Menu mobile** com abertura animada e entrada escalonada dos itens.
- **Contadores** animados nas estatísticas.

**Tokens de motion** (em `:root` no `style.css`): `--ease-out`, `--ease-out-back`, `--ease-in-out`, `--dur-fast`, `--dur`, `--dur-slow` — ajuste-os para acelerar/suavizar tudo de uma vez.

**Acessibilidade:** com `prefers-reduced-motion: reduce`, o site desliga parallax, tilt, *ripple* e transições, exibindo tudo de forma estática. Efeitos de hover/tilt/spotlight rodam apenas em dispositivos com ponteiro fino (desktop).

## 🎨 Paleta de cores

Definida como variáveis CSS em `css/style.css` (`:root`):

Paleta **híbrida**: azul-marinho como base estrutural + o **teal da logo** como cor secundária/acento.

| Token | Hex | Uso |
|-------|-----|-----|
| `--azul-primario` | `#1B3A5C` | Marinho — base escura (hero, stats, CTA, footer) |
| `--azul-secundario` | `#2C6E7F` | Teal da logo — gradientes e destaques |
| `--teal` | `#2C6E7F` | Teal da marca (alias) |
| `--azul-claro` | `#E7F1F3` | Fundo claro (levemente teal) das seções alternadas |
| `--branco` | `#FFFFFF` | Fundo principal |
| `--texto-escuro` | `#1A1A2E` | Texto principal |
| `--texto-cinza` | `#6B7280` | Textos secundários |
| `--accent` | `#236A7D` | Teal de acento — botões CTA, links, títulos de seção |
| `--accent-rgb` | `35, 106, 125` | O mesmo teal em RGB, para sombras e brilhos |
| `--whatsapp` | `#25D366` | Botão flutuante do WhatsApp |

---

## 🚀 Rodando localmente

Como é um site estático, basta abrir o `index.html` no navegador. Para servir com um servidor local (recomendado, evita restrições de alguns navegadores):

```bash
# Python 3
python -m http.server 5500

# ou Node (npx)
npx serve .
```

Depois acesse `http://localhost:5500`.

---

## ☁️ Deploy na Vercel (via GitHub)

1. Crie um repositório no GitHub e envie os arquivos:

   ```bash
   git init
   git add .
   git commit -m "Landing page Odontologia Rodrigues ATA"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```

2. Acesse [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. **Framework Preset:** `Other` — não é necessário build. Deixe *Build Command* e *Output Directory* em branco (a raiz já é o site).
4. Clique em **Deploy**. Pronto! 🎉

O `vercel.json` já aplica cache nos assets e URLs limpas.

---

## 📝 Personalização — o que atualizar com dados reais

- **CRO dos dentistas** — em `index.html`, seção *Equipe*, substitua `CRO-SP XXXXX` pelos números reais.
- **Logo** — a marca no cabeçalho/rodapé/favicon é uma **recriação em SVG** (círculo teal + dente + "R"). Para usar o arquivo original, substitua o `<svg class="logo__badge">` por `<img src="assets/images/logo.png" ...>` no header e no footer.
- **Vídeo da clínica** — em `assets/videos/clinica.mp4`. Para trocar, basta substituir esse arquivo (o componente detecta a proporção sozinho e se adapta a vídeos verticais **ou** horizontais, sem distorcer). Seção *Conheça a Nossa Clínica* (`#clinica`).
- **Comparador Antes/Depois** — o 1º card de *Sorrisos Transformados* usa fotos reais (`assets/images/transformacao-1-antes.jpg` e `-depois.jpg`) com uma **linha arrastável** (mouse + toque). Para criar outro card assim, copie o bloco `<figure class="result-card result-card--slider">`, dê um `id` novo ao `.ba` e aponte para as novas imagens — o JS liga o arrasto sozinho em qualquer elemento `.ba`.
- **Fotos reais** — substitua os placeholders restantes (seções *Sobre*, *Equipe* e demais cards de *Resultados*) pelas imagens do cliente. Adicione-as em `assets/images/` e troque os blocos placeholder por `<img>`.
- **Depoimentos** — atualize com avaliações reais dos pacientes.
- **Números** — ajuste "+1.000 sorrisos", "+10 anos" etc. conforme a realidade da clínica.
- **URL canônica / Open Graph** — troque `https://odontologiarodrigues.com.br/` pelo domínio final em `index.html`.

---

## 📞 Contato da clínica

- **Endereço:** Rua Manoel Carvalho de Santana, 524 — Araçatuba-SP
- **WhatsApp:** [(18) 99144-2141](https://wa.me/5518991442141)
- **Instagram:** [@odontologiarodrigues](https://instagram.com/odontologiarodrigues)
- **Google Maps:** [Ver no mapa](https://maps.app.goo.gl/KUiC2Us7djRGccNy8)
- **Horário:** Segunda a Sexta, 8h às 18h

---

Desenvolvido por **Santiago**.
