# Verificação — 23/09/2026

## Realizado

- Compilação Next.js de produção e validação TypeScript.
- 15 verificações automatizadas: assinatura HMAC válida/inválida e ID alterado; validação de CPF; rejeição de quantidade zero, produtos duplicados e preço injetado; desconto Pix de 5%; checkout fechado sem credenciais.
- Inspeção visual da Home no navegador.
- Navegação para catálogo, filtro Têxtil (2 resultados), ordenação crescente e inclusão de peça na sacola.
- Quantidade 2 na Bandeja Pérola: R$ 178,00 e R$ 169,10 no Pix.
- Checkout demonstrativo confirmado sem botão de pagamento habilitado.
- Painel administrativo carregado em modo de prévia, com campos de foto, descrição, dimensões e preço.
- Imagens locais em WebP com largura/altura explícitas e carregamento tardio nas fotos abaixo da dobra.

## Não atestado

- Cobrança Pix ou cartão, cálculo real de frete, login/Storage Supabase e entrega de e-mails: faltam as contas e credenciais da marca.
- SQL não aplicado a uma instância Supabase nesta sessão; homologar antes da abertura.
- Aferição Lighthouse >90 e inspeção em aparelho móvel real: pendentes na publicação.
- WebMCP: registro com detecção de suporte implementado; o navegador de teste não oferece modelContext, portanto a execução por agentes não foi validada. A loja funciona sem esse recurso.
- Publicação na Vercel: requer conexão do usuário.

O projeto não deve ser anunciado como uma loja operando pagamentos até a conclusão da homologação indicada em ATIVACAO.md.
